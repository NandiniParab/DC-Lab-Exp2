const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: (v) => /^[+]?[1-9][\d]{0,15}$/.test(v),
        message: "Please enter a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please enter a valid email address",
      },
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    // Additional tracking fields
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [{ email: 1 }, { status: 1 }, { submittedAt: -1 }, { createdAt: -1 }],
  },
)

// Add a method to format the contact for display
contactSchema.methods.toDisplayFormat = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    message: this.message,
    status: this.status,
    priority: this.priority,
    submittedAt: this.submittedAt,
    respondedAt: this.respondedAt,
    timeSinceSubmission: this.getTimeSinceSubmission(),
  }
}

// Add a method to calculate time since submission
contactSchema.methods.getTimeSinceSubmission = function () {
  const now = new Date()
  const submitted = new Date(this.submittedAt)
  const diffInHours = Math.floor((now - submitted) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Less than 1 hour ago"
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

// Pre-save middleware to ensure data consistency
contactSchema.pre("save", function (next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase()
  }

  // Set respondedAt when status changes to resolved
  if (this.isModified("status") && this.status === "resolved" && !this.respondedAt) {
    this.respondedAt = new Date()
  }

  next()
})

module.exports = mongoose.model("Contact", contactSchema)
