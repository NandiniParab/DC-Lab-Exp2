const { getDB } = require("../connection")
const bcrypt = require("bcryptjs")

class User {
  constructor(userData) {
    this.username = userData.username
    this.email = userData.email
    this.password = userData.password
    this.avatar = userData.avatar || "👧"
    this.stats = userData.stats || {
      gamesPlayed: 0,
      timesTagged: 0,
      timesBeenTagged: 0,
      totalScore: 0,
    }
    this.createdAt = userData.createdAt || new Date()
  }

  async save() {
    const db = getDB()
    const hashedPassword = await bcrypt.hash(this.password, 12)

    const result = await db.collection("users").insertOne({
      username: this.username,
      email: this.email,
      password: hashedPassword,
      avatar: this.avatar,
      stats: this.stats,
      createdAt: this.createdAt,
    })

    return result
  }

  static async findByEmail(email) {
    const db = getDB()
    return await db.collection("users").findOne({ email })
  }

  static async findById(id) {
    const db = getDB()
    const { ObjectId } = require("mongodb")
    return await db.collection("users").findOne({ _id: new ObjectId(id) })
  }

  static async updateStats(userId, stats) {
    const db = getDB()
    const { ObjectId } = require("mongodb")
    return await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: { stats } })
  }

  static async getLeaderboard(timeFilter = "all") {
    const db = getDB()
    const matchCondition = {}

    if (timeFilter !== "all") {
      const now = new Date()
      let startDate

      switch (timeFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      if (startDate) {
        matchCondition.createdAt = { $gte: startDate }
      }
    }

    return await db.collection("users").find(matchCondition).sort({ "stats.totalScore": -1 }).limit(10).toArray()
  }
}

module.exports = User
