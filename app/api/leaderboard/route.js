import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const timeframe = searchParams.get("timeframe") || "all" // all, today, week, month

    const client = await clientPromise
    const db = client.db("tagme")

    let leaderboard

    if (timeframe === "all") {
      leaderboard = await User.getLeaderboard(db, limit)
    } else {
      // For time-based leaderboards, we'll use tag history
      const dateFilter = new Date()

      switch (timeframe) {
        case "today":
          dateFilter.setHours(0, 0, 0, 0)
          break
        case "week":
          dateFilter.setDate(dateFilter.getDate() - 7)
          break
        case "month":
          dateFilter.setMonth(dateFilter.getMonth() - 1)
          break
      }

      const timeBasedStats = await db
        .collection("tagHistory")
        .aggregate([
          { $match: { timestamp: { $gte: dateFilter } } },
          { $group: { _id: "$tagger", tags: { $sum: 1 } } },
          { $sort: { tags: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "username",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              username: "$_id",
              tags: 1,
              avatar: "$userInfo.avatar",
            },
          },
        ])
        .toArray()

      leaderboard = timeBasedStats
    }

    return NextResponse.json({
      leaderboard: leaderboard.map((user) => ({
        username: user.username,
        tags: user.tags,
        avatar: user.avatar,
      })),
      timeframe,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
