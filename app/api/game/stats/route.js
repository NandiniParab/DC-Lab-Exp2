import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { GameState } from "@/lib/models/GameState"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("tagme")

    const stats = await GameState.getGameStats(db)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Game stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
