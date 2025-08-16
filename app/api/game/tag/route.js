import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { GameState } from "@/lib/models/GameState"

export async function POST(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const tagger = decoded.username

    const { tagged } = await request.json()

    if (!tagged) {
      return NextResponse.json({ error: "Tagged player is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("tagme")

    // Check if tagger is currently "it"
    const currentGame = await GameState.getCurrentGame(db)
    if (!currentGame || currentGame.currentIt !== tagger) {
      return NextResponse.json({ error: 'You are not currently "it"!' }, { status: 400 })
    }

    // Check if tagged player exists and is online
    const taggedUser = await User.findByUsername(db, tagged)
    if (!taggedUser || !taggedUser.isOnline) {
      return NextResponse.json({ error: "Player not found or offline" }, { status: 400 })
    }

    try {
      const result = await GameState.tagPlayer(db, tagger, tagged)

      // Update tagger's score
      await User.updateTags(db, tagger, 1)

      return NextResponse.json({
        message: `${tagged} is now "it"!`,
        newIt: result.newIt,
        timestamp: result.timestamp,
        success: true,
      })
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Tag error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
