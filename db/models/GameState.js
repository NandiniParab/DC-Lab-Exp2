const { getDB } = require("../connection")

class GameState {
  constructor(gameData) {
    this.players = gameData.players || []
    this.currentIt = gameData.currentIt || null
    this.gameActive = gameData.gameActive || false
    this.gameStartTime = gameData.gameStartTime || null
    this.tagHistory = gameData.tagHistory || []
    this.createdAt = gameData.createdAt || new Date()
  }

  async save() {
    const db = getDB()
    const result = await db.collection("gameStates").insertOne({
      players: this.players,
      currentIt: this.currentIt,
      gameActive: this.gameActive,
      gameStartTime: this.gameStartTime,
      tagHistory: this.tagHistory,
      createdAt: this.createdAt,
    })

    return result
  }

  static async getCurrentGame() {
    const db = getDB()
    return await db.collection("gameStates").findOne({ gameActive: true }, { sort: { createdAt: -1 } })
  }

  static async updateGame(gameId, updateData) {
    const db = getDB()
    const { ObjectId } = require("mongodb")
    return await db.collection("gameStates").updateOne({ _id: new ObjectId(gameId) }, { $set: updateData })
  }

  static async addTagToHistory(gameId, tagData) {
    const db = getDB()
    const { ObjectId } = require("mongodb")
    return await db
      .collection("gameStates")
      .updateOne({ _id: new ObjectId(gameId) }, { $push: { tagHistory: tagData } })
  }

  static async endGame(gameId) {
    const db = getDB()
    const { ObjectId } = require("mongodb")
    return await db.collection("gameStates").updateOne({ _id: new ObjectId(gameId) }, { $set: { gameActive: false } })
  }
}

module.exports = GameState
