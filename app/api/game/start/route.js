import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { GameState } from "@/lib/models/GameState"

export async function POST(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    const client = await clientPromise
    const db = client.db("tagme")

    try {
      const gameResult = await GameState.startNewGame(db)

      return NextResponse.json({
        message: `Game started! ${gameResult.currentIt} is "it"!`,
        currentIt: gameResult.currentIt,
        players: gameResult.players,
      })
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Start game error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
