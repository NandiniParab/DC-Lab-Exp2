const { MongoClient } = require("mongodb")

let db

const connectDB = async () => {
  try {
    if (db) return db

    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db("tag_game")

    console.log("MongoDB connected successfully")
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.")
  }
  return db
}

module.exports = { connectDB, getDB }
