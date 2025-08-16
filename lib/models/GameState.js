export class GameState {
  constructor(data) {
    this.currentIt = data.currentIt
    this.lastTagged = data.lastTagged || null
    this.timestamp = data.timestamp || new Date()
    this.gameId = data.gameId || "main-game"
    this.gameStarted = data.gameStarted || false
    this.players = data.players || []
  }

  static async getCurrentGame(db) {
    return await db.collection("gameState").findOne({ gameId: "main-game" })
  }

  static async updateGame(db, gameData) {
    const gameState = new GameState(gameData)
    return await db.collection("gameState").updateOne({ gameId: "main-game" }, { $set: gameState }, { upsert: true })
  }

  static async tagPlayer(db, tagger, tagged) {
    const timestamp = new Date()

    // Validate that both players exist and are online
    const taggerUser = await db.collection("users").findOne({ username: tagger, isOnline: true })
    const taggedUser = await db.collection("users").findOne({ username: tagged, isOnline: true })

    if (!taggerUser || !taggedUser) {
      throw new Error("One or both players are not online")
    }

    // Check if tagger is currently "it"
    const currentGame = await this.getCurrentGame(db)
    if (!currentGame || currentGame.currentIt !== tagger) {
      throw new Error('You are not currently "it"!')
    }

    // Prevent self-tagging
    if (tagger === tagged) {
      throw new Error("You cannot tag yourself!")
    }

    // Update game state
    await this.updateGame(db, {
      currentIt: tagged,
      lastTagged: tagged,
      timestamp,
      gameId: "main-game",
      gameStarted: true,
    })

    // Record the tag event
    await db.collection("tagHistory").insertOne({
      tagger,
      tagged,
      timestamp,
      gameId: "main-game",
    })

    return { success: true, newIt: tagged, timestamp }
  }

  static async startNewGame(db) {
    const onlinePlayers = await db.collection("users").find({ isOnline: true }).toArray()

    if (onlinePlayers.length < 2) {
      throw new Error("Need at least 2 players to start a game")
    }

    // Pick a random player to be "it"
    const randomPlayer = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)]

    await this.updateGame(db, {
      currentIt: randomPlayer.username,
      lastTagged: null,
      timestamp: new Date(),
      gameId: "main-game",
      gameStarted: true,
      players: onlinePlayers.map((p) => p.username),
    })

    return { currentIt: randomPlayer.username, players: onlinePlayers }
  }

  static async getGameStats(db) {
    const totalTags = await db.collection("tagHistory").countDocuments()
    const totalPlayers = await db.collection("users").countDocuments()
    const onlinePlayers = await db.collection("users").countDocuments({ isOnline: true })

    const topTagger = await db.collection("users").findOne({}, { sort: { tags: -1 } })

    return {
      totalTags,
      totalPlayers,
      onlinePlayers,
      topTagger: topTagger ? { username: topTagger.username, tags: topTagger.tags } : null,
    }
  }
}
