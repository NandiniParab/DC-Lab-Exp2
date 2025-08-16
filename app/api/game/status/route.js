import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { GameState } from "@/lib/models/GameState"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("tagme")

    // Get current game state
    const gameState = await GameState.getCurrentGame(db)

    // Get online players
    const onlinePlayers = await db
      .collection("users")
      .find({ isOnline: true })
      .project({ username: 1, avatar: 1, tags: 1 })
      .toArray()

    // If no game state exists and there are players, pick someone as "it"
    if (!gameState && onlinePlayers.length > 0) {
      const randomPlayer = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)]
      await GameState.updateGame(db, {
        currentIt: randomPlayer.username,
        timestamp: new Date(),
        gameId: "main-game",
      })

      return NextResponse.json({
        currentIt: randomPlayer.username,
        players: onlinePlayers,
        lastTagged: null,
      })
    }

    return NextResponse.json({
      currentIt: gameState?.currentIt || null,
      players: onlinePlayers,
      lastTagged: gameState?.lastTagged || null,
    })
  } catch (error) {
    console.error("Game status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
