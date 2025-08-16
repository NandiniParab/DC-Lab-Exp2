const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const { connectDB } = require("../db/connection")
const User = require("../db/models/User")
const GameState = require("../db/models/GameState")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create new user
    const user = new User({ username, email, password })
    const result = await user.save()

    // Generate token
    const token = jwt.sign({ userId: result.insertedId, email }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: result.insertedId, username, email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, stats: user.stats },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, stats: user.stats },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Game Routes
app.post("/api/game/start", authenticateToken, async (req, res) => {
  try {
    // Check if there's already an active game
    const activeGame = await GameState.getCurrentGame()
    if (activeGame) {
      return res.status(400).json({ error: "Game already in progress" })
    }

    // Create new game
    const user = await User.findById(req.user.userId)
    const gameState = new GameState({
      players: [{ id: user._id, username: user.username, avatar: user.avatar }],
      currentIt: user._id,
      gameActive: true,
      gameStartTime: new Date(),
    })

    const result = await gameState.save()

    res.json({
      message: "Game started successfully",
      gameId: result.insertedId,
      gameState: {
        players: gameState.players,
        currentIt: gameState.currentIt,
        gameActive: true,
      },
    })
  } catch (error) {
    console.error("Start game error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/game/status", authenticateToken, async (req, res) => {
  try {
    const game = await GameState.getCurrentGame()
    if (!game) {
      return res.json({ gameActive: false, message: "No active game" })
    }

    res.json({
      gameActive: true,
      gameId: game._id,
      players: game.players,
      currentIt: game.currentIt,
      gameStartTime: game.gameStartTime,
      tagHistory: game.tagHistory,
    })
  } catch (error) {
    console.error("Game status error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/game/tag", authenticateToken, async (req, res) => {
  try {
    const { targetUserId } = req.body
    const taggerId = req.user.userId

    // Get current game
    const game = await GameState.getCurrentGame()
    if (!game) {
      return res.status(400).json({ error: "No active game" })
    }

    // Validate tag
    if (game.currentIt.toString() !== taggerId) {
      return res.status(400).json({ error: "You are not 'it'" })
    }

    if (taggerId === targetUserId) {
      return res.status(400).json({ error: "Cannot tag yourself" })
    }

    // Update game state
    const tagData = {
      taggerId,
      targetUserId,
      timestamp: new Date(),
    }

    await GameState.updateGame(game._id, { currentIt: targetUserId })
    await GameState.addTagToHistory(game._id, tagData)

    // Update user stats
    const tagger = await User.findById(taggerId)
    const target = await User.findById(targetUserId)

    if (tagger && target) {
      tagger.stats.timesTagged += 1
      tagger.stats.totalScore += 10
      target.stats.timesBeenTagged += 1

      await User.updateStats(taggerId, tagger.stats)
      await User.updateStats(targetUserId, target.stats)
    }

    res.json({
      message: "Tag successful",
      newIt: targetUserId,
      tagData,
    })
  } catch (error) {
    console.error("Tag error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Leaderboard Routes
app.get("/api/leaderboard", async (req, res) => {
  try {
    const { timeFilter = "all" } = req.query
    const leaderboard = await User.getLeaderboard(timeFilter)

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      avatar: user.avatar,
      stats: user.stats,
    }))

    res.json({ leaderboard: formattedLeaderboard })
  } catch (error) {
    console.error("Leaderboard error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Start server
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
