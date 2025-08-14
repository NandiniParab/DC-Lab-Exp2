const express = require("express")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const multer = require("multer")
const { GridFSBucket } = require("mongodb")
const { Readable } = require("stream")
const router = express.Router()

const Volunteer = require("../models/Volunteer")

// 🔧 FIXED: Configure multer for memory storage with detailed logging
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  console.log("🔍 MULTER FILE FILTER CALLED:")
  console.log("  - Field name:", file.fieldname)
  console.log("  - Original name:", file.originalname)
  console.log("  - MIME type:", file.mimetype)
  console.log("  - Size:", file.size)

  // Accept only PDF files
  if (file.mimetype === "application/pdf") {
    console.log("✅ PDF file accepted by filter")
    cb(null, true)
  } else {
    console.log("❌ File rejected by filter - not PDF")
    cb(new Error("Only PDF files are allowed!"), false)
  }
}

// 🔧 FIXED: Enhanced multer configuration with logging
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  onError: (err, next) => {
    console.log("❌ MULTER ERROR:", err)
    next(err)
  },
})

// 🔧 FIXED: Add multer debugging middleware
const multerDebug = (req, res, next) => {
  console.log("🔍 MULTER DEBUG MIDDLEWARE:")
  console.log("  - Content-Type:", req.headers["content-type"])
  console.log("  - Content-Length:", req.headers["content-length"])
  console.log("  - Method:", req.method)
  console.log("  - URL:", req.url)
  console.log("  - Body keys:", Object.keys(req.body || {}))
  console.log("  - Files:", req.files)
  console.log("  - File:", req.file)
  next()
}

// GridFS bucket for storing PDFs in MongoDB
let gfsBucket
let isGridFSReady = false

const initializeGridFS = () => {
  if (mongoose.connection.readyState === 1 && !isGridFSReady) {
    try {
      gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "resumes",
      });
      isGridFSReady = true;
      console.log("✅ GridFS bucket initialized for PDF storage");
    } catch (error) {
      console.error("❌ Failed to initialize GridFS:", error);
    }
  } else if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ MongoDB not connected yet. Will retry GridFS initialization in 2 seconds.");
    setTimeout(initializeGridFS, 2000);
  }
};

// Initialize GridFS when connection is ready
mongoose.connection.on("connected", () => {
  console.log("🔗 MongoDB connected, initializing GridFS...");
  initializeGridFS();
});

// Always try to initialize GridFS on startup, and retry if not ready
initializeGridFS();

// Create transporter for email
const createTransporter = () => {
  console.log("🔧 Creating email transporter...")
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not found in environment variables")
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

// Helper function to get initiative full name
const getInitiativeName = (code) => {
  const initiatives = {
    ccae: "CCAE - Child Care and Education",
    csii: "CSII - Community Skills and Income Initiative",
    csaa: "CSAA - Community Service and Awareness",
    general: "General Volunteer",
  }
  return initiatives[code] || code
}

// Helper function to store PDF in MongoDB GridFS
const storePDFInMongoDB = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    if (!isGridFSReady || !gfsBucket) {
      reject(new Error("GridFS bucket not ready"))
      return
    }

    console.log("📄 Starting GridFS upload for:", filename)
    console.log("📊 File buffer size:", fileBuffer.length, "bytes")

    const readableStream = new Readable()
    readableStream.push(fileBuffer)
    readableStream.push(null)

    const uploadStream = gfsBucket.openUploadStream(filename, {
      metadata: {
        originalName: filename,
        uploadDate: new Date(),
        contentType: "application/pdf",
      },
    })

    uploadStream.on("error", (error) => {
      console.error("❌ GridFS upload error:", error)
      reject(error)
    })

    uploadStream.on("finish", (file) => {
      console.log("✅ PDF stored in MongoDB GridFS with ID:", file._id)
      resolve(file._id)
    })

    readableStream.pipe(uploadStream)
  })
}

// 🔧 FIXED: Enhanced test endpoint with better debugging
router.post("/test-upload", multerDebug, upload.single("resume"), (req, res) => {
  console.log("🧪 TEST UPLOAD ENDPOINT HIT")
  console.log("📝 Request body:", req.body)
  console.log("📄 Request file:", req.file)
  console.log("📋 Request headers:", req.headers)
  console.log("📋 Content-Type:", req.headers["content-type"])

  if (req.file) {
    console.log("✅ FILE RECEIVED SUCCESSFULLY!")
    console.log("📄 File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer ? req.file.buffer.length : "No buffer",
    })
  } else {
    console.log("❌ NO FILE RECEIVED")
    console.log("📋 Available request properties:", Object.keys(req))
  }

  res.json({
    success: true,
    message: "Test upload endpoint",
    fileReceived: !!req.file,
    fileDetails: req.file
      ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          hasBuffer: !!req.file.buffer,
          bufferSize: req.file.buffer ? req.file.buffer.length : 0,
        }
      : null,
    bodyKeys: Object.keys(req.body || {}),
    headers: req.headers,
  })
})

// Route to serve PDFs from MongoDB GridFS
router.get("/resume/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId
    console.log("📄 Serving PDF with ID:", fileId)

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      console.log("❌ Invalid file ID:", fileId)
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      })
    }

    if (!isGridFSReady || !gfsBucket) {
      console.log("❌ GridFS not ready")
      return res.status(503).json({
        success: false,
        message: "File service not available",
      })
    }

    const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray()

    if (!files || files.length === 0) {
      console.log("❌ File not found in GridFS:", fileId)
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    const file = files[0]
    console.log("✅ Found file in GridFS:", file.filename)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`)
    res.setHeader("Content-Length", file.length)

    const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))

    downloadStream.on("error", (error) => {
      console.error("❌ Error streaming file:", error)
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Error streaming file" })
      }
    })

    downloadStream.pipe(res)
  } catch (error) {
    console.error("❌ Error serving PDF from MongoDB:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error serving file",
      })
    }
  }
})

// Route to download PDF from MongoDB GridFS
router.get("/download/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId
    console.log("⬇️ Download PDF with ID:", fileId)

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      })
    }

    if (!isGridFSReady || !gfsBucket) {
      return res.status(503).json({
        success: false,
        message: "File service not available",
      })
    }

    const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray()

    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    const file = files[0]

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`)
    res.setHeader("Content-Length", file.length)

    const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
    downloadStream.pipe(res)
  } catch (error) {
    console.error("❌ Error downloading PDF:", error)
    res.status(500).json({
      success: false,
      message: "Error downloading file",
    })
  }
})

// GET route to view all volunteer applications (for admin)
router.get("/volunteers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected. Check MongoDB Atlas connection.",
      })
    }

    const volunteers = await Volunteer.find().sort({ appliedAt: -1 })

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    })
  } catch (error) {
    console.error("Error fetching volunteer applications:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer applications",
    })
  }
})

// GET route to view single volunteer application
router.get("/volunteers/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected. Check MongoDB Atlas connection.",
      })
    }

    const volunteer = await Volunteer.findById(req.params.id)

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer application not found",
      })
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    })
  } catch (error) {
    console.error("Error fetching volunteer application:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer application",
    })
  }
})

// PUT route to update volunteer application status
router.put("/volunteers/:id", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database not connected. Check MongoDB Atlas connection.",
      })
    }

    const { status, priority, notes } = req.body

    const updateData = {}
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (notes) updateData.notes = notes
    if (status === "accepted" || status === "rejected") updateData.reviewedAt = new Date()

    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer application not found",
      })
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    })
  } catch (error) {
    console.error("Error updating volunteer application:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer application",
    })
  }
})

// 🔧 FIXED: Main volunteer route with proper validation and database save
router.post("/volunteer-simple", multerDebug, upload.single("resume"), async (req, res) => {
  console.log("🎯 VOLUNTEER APPLICATION ROUTE HIT!")
  console.log("📝 Request body:", req.body)
  console.log("📄 Request file:", req.file)
  console.log("📋 Request headers content-type:", req.headers["content-type"])

  // Enhanced file debugging
  if (req.file) {
    console.log("✅ FILE RECEIVED BY MULTER:")
    console.log("  - Field name:", req.file.fieldname)
    console.log("  - Original name:", req.file.originalname)
    console.log("  - MIME type:", req.file.mimetype)
    console.log("  - Size:", req.file.size, "bytes")
    console.log("  - Buffer exists:", !!req.file.buffer)
    console.log("  - Buffer length:", req.file.buffer ? req.file.buffer.length : "N/A")
  } else {
    console.log("❌ NO FILE RECEIVED BY MULTER")
    console.log("📋 Request body keys:", Object.keys(req.body || {}))
  }

  try {
    const { domain, firstName, lastName, contact, dateOfBirth, email, whyJoinUs, questionsForUs } = req.body

    console.log("🔍 VALIDATING FORM DATA:")
    console.log("  - domain:", domain)
    console.log("  - firstName:", firstName)
    console.log("  - lastName:", lastName)
    console.log("  - contact:", contact)
    console.log("  - dateOfBirth:", dateOfBirth)
    console.log("  - email:", email)
    console.log("  - whyJoinUs:", whyJoinUs ? "provided" : "missing")
    console.log("  - questionsForUs:", questionsForUs ? "provided" : "empty")

    // Validate required fields
    if (!domain || !firstName || !lastName || !contact || !dateOfBirth || !email || !whyJoinUs) {
      console.log("❌ Validation failed: Missing required fields")
      const missingFields = []
      if (!domain) missingFields.push("domain")
      if (!firstName) missingFields.push("firstName")
      if (!lastName) missingFields.push("lastName")
      if (!contact) missingFields.push("contact")
      if (!dateOfBirth) missingFields.push("dateOfBirth")
      if (!email) missingFields.push("email")
      if (!whyJoinUs) missingFields.push("whyJoinUs")

      console.log("❌ Missing fields:", missingFields)

      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Validation failed: Invalid email")
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      })
    }

    // Calculate age from date of birth
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    console.log("📅 Calculated age:", age)

    if (age < 16 || age > 100) {
      console.log("❌ Validation failed: Invalid age")
      return res.status(400).json({
        success: false,
        message: "Applicant must be between 16 and 100 years old",
      })
    }

    // Generate a simple application ID
    const applicationId = `SWIS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    console.log("✅ Generated Application ID:", applicationId)

    // Handle PDF storage in MongoDB
    let resumeFileName = ""
    let resumeFileId = null
    let resumeFileUrl = ""
    let resumeFileSize = 0
    let pdfBuffer = null

    if (req.file && req.file.buffer && req.file.buffer.length > 0) {
      resumeFileName = req.file.originalname;
      resumeFileSize = req.file.size;
      pdfBuffer = req.file.buffer;
      console.log("✅ PDF PROCESSING:");
      console.log("  - File name:", resumeFileName);
      console.log("  - File size:", resumeFileSize, "bytes");
      console.log("  - Buffer size:", pdfBuffer.length, "bytes");

      // Wait for GridFS to be ready if not yet ready
      let gridfsTries = 0;
      while ((!isGridFSReady || !gfsBucket) && gridfsTries < 5) {
        console.warn("⏳ Waiting for GridFS to be ready...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        gridfsTries++;
      }

      try {
        if (isGridFSReady && gfsBucket) {
          console.log("💾 STORING PDF IN MONGODB GRIDFS...");
          resumeFileId = await storePDFInMongoDB(pdfBuffer, resumeFileName);
          resumeFileUrl = `${req.protocol}://${req.get("host")}/api/resume/${resumeFileId}`;
          console.log("✅ PDF STORED SUCCESSFULLY!");
          console.log("  - GridFS ID:", resumeFileId);
          console.log("  - URL:", resumeFileUrl);
        } else {
          console.log("❌ GridFS still not ready after waiting. PDF will only be sent via email.");
        }
      } catch (gridfsError) {
        console.error("❌ Failed to store PDF in MongoDB:", gridfsError);
      }
    } else {
      console.log("❌ NO VALID PDF FILE RECEIVED");
    }

    let savedVolunteer = null

    // 🔧 FIXED: Try to save to database with proper data structure
    try {
      if (mongoose.connection.readyState === 1) {
        console.log("💾 SAVING TO DATABASE...")

        // Create volunteer object with ONLY the fields that exist in the model
        const volunteerData = {
          domain: domain.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contact: contact.trim(),
          dateOfBirth: birthDate,
          age: age,
          email: email.trim().toLowerCase(),
          whyJoinUs: whyJoinUs.trim(),
          questionsForUs: questionsForUs ? questionsForUs.trim() : "",
          resumeFileName: resumeFileName,
          resumeFileId: resumeFileId,
          resumeFileUrl: resumeFileUrl,
          resumeFileSize: resumeFileSize,
          applicationId: applicationId,
          // These will use default values from schema:
          // status: "new",
          // priority: "medium",
          // appliedAt: Date.now(),
        }

        console.log("📋 VOLUNTEER DATA TO SAVE:")
        console.log(JSON.stringify(volunteerData, null, 2))

        const newVolunteer = new Volunteer(volunteerData)
        savedVolunteer = await newVolunteer.save()

        console.log("✅ SAVED TO DATABASE SUCCESSFULLY:")
        console.log("  - Database ID:", savedVolunteer._id)
        console.log("  - Application ID:", savedVolunteer.applicationId)
        console.log("  - Resume file name:", savedVolunteer.resumeFileName)
        console.log("  - Resume file ID:", savedVolunteer.resumeFileId)
        console.log("  - Resume URL:", savedVolunteer.resumeFileUrl)
      } else {
        console.log("⚠️ Database not connected - continuing with email only")
      }
    } catch (dbError) {
      console.error("❌ DATABASE SAVE FAILED:")
      console.error("  - Error message:", dbError.message)
      console.error("  - Error name:", dbError.name)
      if (dbError.errors) {
        console.error("  - Validation errors:")
        Object.keys(dbError.errors).forEach((field) => {
          console.error(`    - ${field}: ${dbError.errors[field].message}`)
        })
      }
      console.log("⚠️ Continuing with email only...")
    }

    console.log("✅ Creating email transporter...")
    const transporter = createTransporter()

    // Prepare email attachments
    const emailAttachments = []
    if (req.file && pdfBuffer && pdfBuffer.length > 0) {
      emailAttachments.push({
        filename: resumeFileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      })
      console.log("📎 EMAIL ATTACHMENT PREPARED:", resumeFileName)
    } else {
      console.log("⚠️ NO EMAIL ATTACHMENT - no valid PDF file")
    }

    // Email content (keeping the same as before)
    const instituteNotificationEmail = {
      from: `"SWIS NGO Volunteer Application" <${process.env.EMAIL_USER}>`,
      to: "gudhakaj@gmail.com",
      subject: `🙋‍♂️ New Volunteer Application - ${firstName} ${lastName} (${getInitiativeName(domain)})`,
      attachments: emailAttachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🙋‍♂️ New Volunteer Application</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">SWIS Foundation - Join Us Application</p>
          </div>
          
          <div style="padding: 25px; background-color: #f8fafc;">
            <h2 style="color: #1e40af; margin-top: 0; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
              👤 Applicant Information
            </h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 8px 0;"><strong>📛 Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 8px 0;"><strong>🎂 Age:</strong> ${age} years</p>
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a></p>
              <p style="margin: 8px 0;"><strong>📞 Contact:</strong> <a href="tel:${contact}" style="color: #1e40af;">${contact}</a></p>
              <p style="margin: 8px 0;"><strong>📅 Date of Birth:</strong> ${new Date(dateOfBirth).toLocaleDateString()}</p>
              <p style="margin: 8px 0;"><strong>🎯 Domain:</strong> <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 6px; font-size: 14px;">${getInitiativeName(domain)}</span></p>
              <p style="margin: 8px 0;"><strong>🆔 Application ID:</strong> ${applicationId}</p>
              ${savedVolunteer ? `<p style="margin: 8px 0;"><strong>🗄️ Database ID:</strong> ${savedVolunteer._id}</p>` : ""}
              
              ${
                resumeFileName && pdfBuffer
                  ? `
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #0ea5e9;">
                  <p style="margin: 8px 0; color: #0ea5e9; font-weight: bold;">✅ Resume Successfully Uploaded</p>
                  <p style="margin: 8px 0;"><strong>📄 File Name:</strong> ${resumeFileName}</p>
                  <p style="margin: 8px 0;"><strong>📊 File Size:</strong> ${(resumeFileSize / 1024).toFixed(2)} KB</p>
                  ${resumeFileUrl ? `<p style="margin: 8px 0;"><strong>🔗 View Online:</strong> <a href="${resumeFileUrl}" style="color: #1e40af; text-decoration: underline;">Click to view PDF</a></p>` : ""}
                  <p style="margin: 8px 0; font-size: 12px; color: #059669;">📎 <strong>Resume is attached to this email</strong></p>
                  <p style="margin: 8px 0; font-size: 12px; color: #0ea5e9;">💾 PDF stored in MongoDB Atlas</p>
                </div>
              `
                  : `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #f59e0b; font-weight: bold;">⚠️ No resume uploaded</p>
                  <p style="margin: 8px 0; font-size: 12px; color: #92400e;">The applicant did not upload a resume file.</p>
                </div>
              `
              }
            </div>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #3b82f6; margin-top: 0; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
              💭 Why They Want to Join
            </h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
              <p style="line-height: 1.6; color: #333; margin: 0; font-size: 16px;">${whyJoinUs}</p>
            </div>
          </div>
          
          ${
            questionsForUs
              ? `
          <div style="padding: 25px; background-color: #f8fafc;">
            <h2 style="color: #1e40af; margin-top: 0; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
              ❓ Questions for Us
            </h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
              <p style="line-height: 1.6; color: #333; margin: 0; font-size: 16px;">${questionsForUs}</p>
            </div>
          </div>
          `
              : ""
          }
          
          <div style="padding: 25px; background-color: #e5e7eb; text-align: center;">
            <a href="mailto:${email}?subject=Re: Your volunteer application to SWIS Foundation&body=Dear ${firstName},%0A%0AThank you for your application to SWIS Foundation for ${getInitiativeName(domain)}.%0A%0A" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 8px; font-weight: bold;">
              📧 Contact ${firstName}
            </a>
            <a href="tel:${contact}" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 8px; font-weight: bold;">
              📞 Call ${firstName}
            </a>
            ${
              resumeFileUrl
                ? `
            <a href="${resumeFileUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 8px; font-weight: bold;">
              📄 View Resume
            </a>
            `
                : ""
            }
          </div>
          
          <div style="padding: 20px; background-color: #1e40af; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">📅 Applied on: ${new Date().toLocaleString()}</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">🌐 From: SWIS NGO Join Us Form</p>
            ${resumeFileName ? `<p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">💾 Resume: ${resumeFileName} (${(resumeFileSize / 1024).toFixed(2)} KB)</p>` : ""}
          </div>
        </div>
      `,
    }

    const volunteerAcknowledgmentEmail = {
      from: `"SWIS Foundation" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Application Received - SWIS Foundation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Application Received!</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Welcome to the SWIS Foundation Family</p>
          </div>
          
          <div style="padding: 25px; background-color: #f8fafc;">
            <h2 style="color: #1e40af; margin-top: 0;">Dear ${firstName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for your interest in volunteering with <strong>SWIS Foundation</strong>! 
              We have successfully received your application for <strong>${getInitiativeName(domain)}</strong>.
            </p>
            <div style="background: linear-gradient(135deg, #3b82f6, #93c5fd); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: white;">
                <strong>Your Application Reference ID:</strong> ${applicationId}
              </p>
            </div>
          </div>
          
          <div style="padding: 0 25px 25px 25px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1e40af;">
              <h3 style="color: #1e40af; margin-top: 0;">📋 Your Application Summary:</h3>
              <p style="margin: 5px 0;"><strong>Domain:</strong> ${getInitiativeName(domain)}</p>
              <p style="margin: 5px 0;"><strong>Age:</strong> ${age} years</p>
              <p style="margin: 5px 0;"><strong>Contact:</strong> ${contact}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              ${resumeFileName ? `<p style="margin: 5px 0;"><strong>Resume:</strong> ${resumeFileName} ✅ Uploaded Successfully</p>` : `<p style="margin: 5px 0;"><strong>Resume:</strong> ⚠️ Not uploaded</p>`}
            </div>
          </div>
          
          <div style="padding: 0 25px 25px 25px;">
            <h3 style="color: #3b82f6;">🔄 What happens next?</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>✅ Our team will review your application</li>
                <li>📞 We will contact you within 3-5 business days</li>
                <li>🤝 If selected, we'll schedule an orientation session</li>
                <li>🎯 You'll be matched with projects that fit your interests</li>
                <li>🌟 Start making a difference in your community!</li>
              </ul>
            </div>
          </div>
          
          <div style="padding: 25px; background-color: #f8fafc;">
            <h3 style="color: #1e40af; margin-top: 0;">📞 Questions?</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 8px 0;"><strong>📧 Email:</strong> <a href="mailto:swisinstitute@gmail.com" style="color: #1e40af;">swisinstitute@gmail.com</a></p>
              <p style="margin: 8px 0;"><strong>📞 Phone:</strong> <a href="tel:+918482004559" style="color: #1e40af;">+91 848 200 4559</a></p>
            </div>
          </div>
          
          <div style="padding: 25px; background: linear-gradient(135deg, #1e40af, #3b82f6); text-align: center; color: white;">
            <p style="margin: 0; font-weight: bold; font-size: 18px;">Welcome to the SWIS Family!</p>
            <p style="margin: 8px 0; font-weight: bold; color: #93c5fd;">SWIS Foundation Team</p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.8;">
              This is an automated acknowledgment. Please save this email for your records.
            </p>
          </div>
        </div>
      `,
    }

    console.log("📧 SENDING EMAILS...")

    // Send notification to institute with PDF attachment
    console.log("📤 Sending volunteer application notification to institute...")
    await transporter.sendMail(instituteNotificationEmail)
    console.log("✅ Volunteer application notification sent to institute!")

    // Send acknowledgment to volunteer
    console.log("📤 Sending acknowledgment to volunteer...")
    await transporter.sendMail(volunteerAcknowledgmentEmail)
    console.log("✅ Acknowledgment sent to volunteer!")

    res.status(200).json({
      success: true,
      message:
        "Thank you for your application! We have received your submission and will contact you within 2-5 business days.",
      applicationId: applicationId,
      databaseId: savedVolunteer ? savedVolunteer._id : null,
      resumeUrl: resumeFileUrl || null,
      resumeStoredInMongoDB: !!resumeFileId,
      resumeAttachedToEmail: !!pdfBuffer,
      databaseSaved: !!savedVolunteer,
      debug: {
        fileReceived: !!req.file,
        fileName: resumeFileName,
        fileSize: resumeFileSize,
        gridfsReady: isGridFSReady,
        mongoConnected: mongoose.connection.readyState === 1,
      },
    })
  } catch (error) {
    console.error("❌ DETAILED ERROR:", error)

    let errorMessage = "Failed to submit application. Please try again later."
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check your Gmail app password."
    } else if (error.code === "ESOCKET" || error.code === "ECONNECTION") {
      errorMessage = "Connection error. Please check your internet connection."
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Connection timeout. Please try again."
    } else if (error.message.includes("certificate")) {
      errorMessage = "SSL certificate error. Please try again."
    } else if (error.message.includes("Only PDF files are allowed")) {
      errorMessage = "Only PDF files are allowed for resume upload."
    } else if (error.code === "LIMIT_FILE_SIZE") {
      errorMessage = "File size too large. Please upload a PDF smaller than 5MB."
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

module.exports = router
