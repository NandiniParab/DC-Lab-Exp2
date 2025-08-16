import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = await clientPromise
    const db = client.db("tagme")

    const history = await db.collection("tagHistory").find({}).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({
      history: history.map((event) => ({
        tagger: event.tagger,
        tagged: event.tagged,
        timestamp: event.timestamp,
      })),
    })
  } catch (error) {
    console.error("Game history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
