export class User {
  constructor(data) {
    this.username = data.username
    this.password = data.password // Should be hashed
    this.tags = data.tags || 0
    this.isOnline = data.isOnline || false
    this.avatar = data.avatar || "🎀"
    this.createdAt = data.createdAt || new Date()
  }

  static async create(db, userData) {
    const user = new User(userData)
    const result = await db.collection("users").insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async findByUsername(db, username) {
    return await db.collection("users").findOne({ username })
  }

  static async updateTags(db, username, increment = 1) {
    return await db.collection("users").updateOne({ username }, { $inc: { tags: increment } })
  }

  static async setOnlineStatus(db, username, isOnline) {
    return await db.collection("users").updateOne({ username }, { $set: { isOnline } })
  }

  static async getLeaderboard(db, limit = 10) {
    return await db.collection("users").find({}).sort({ tags: -1 }).limit(limit).toArray()
  }
}
