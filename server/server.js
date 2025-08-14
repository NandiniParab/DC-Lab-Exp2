const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const contactRoutes = require("./routes/contact")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB Atlas (Fixed - removed deprecated options)
const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...")
    const MONGO_URI = process.env.MONGO_URI;
    await mongoose.connect(
      MONGO_URI,
      {
        // Removed deprecated options: useNewUrlParser and useUnifiedTopology
        // These are no longer needed in modern MongoDB driver versions
      },
    )

    console.log("✅ Connected to MongoDB Atlas successfully!")
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message)
    console.log("🔧 Continuing without database - emails will still work!")
  }
}

// Connect to database
connectDB()

// MongoDB connection event listeners
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB Atlas")
})

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected from MongoDB Atlas")
})

// Middleware
app.use(
  cors({
    origin: [
      "https://www.theswis.org",
      "https://swis-institute.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api", contactRoutes)

// Health check route for Render
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Health check route
app.get("/api/health", (req, res) => {
  console.log("✅ Health check route hit!")
  res.status(200).json({
    message: "Server is running!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📧 Contact endpoint: http://localhost:${PORT}/api/contact`)
  console.log(`🙋‍♂️ Volunteer endpoint: http://localhost:${PORT}/api/volunteer-simple`)
  console.log(`🌐 Database: MongoDB Atlas (No API key needed!)`)
})