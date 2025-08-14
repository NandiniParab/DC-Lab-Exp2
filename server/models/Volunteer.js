const mongoose = require("mongoose")

const volunteerSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      enum: ["ccae", "csii", "csaa", "general"],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    whyJoinUs: {
      type: String,
      required: true,
      trim: true,
    },
    questionsForUs: {
      type: String,
      trim: true,
      default: "",
    },
    resumeFileName: {
      type: String,
      trim: true,
      default: "",
    },
    resumeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // GridFS file ID
    },
    resumeFileUrl: {
      type: String,
      trim: true,
      default: "",
    },
    resumeFileSize: {
      type: Number,
      default: 0,
    },
    applicationId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["new", "under-review", "accepted", "rejected", "on-hold"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    // REMOVED ALL THE EXTRA REQUIRED FIELDS THAT WERE CAUSING VALIDATION ERRORS
    // These fields were from a different form and not needed for volunteer application:
    // - termsAccepted, hasTransportation, emergencyContact, etc.
  },
  {
    timestamps: true,
  },
)

// Add indexes for better query performance
volunteerSchema.index({ email: 1 })
volunteerSchema.index({ applicationId: 1 })
volunteerSchema.index({ status: 1 })
volunteerSchema.index({ appliedAt: -1 })

module.exports = mongoose.model("Volunteer", volunteerSchema)
