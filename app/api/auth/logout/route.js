import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function POST(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value

    if (token) {
      try {
        // Verify token and set user offline
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        const client = await clientPromise
        const db = client.db("tagme")
        await User.setOnlineStatus(db, decoded.username, false)
      } catch (error) {
        console.error("Error setting user offline:", error)
      }
    }

    const response = NextResponse.json({ message: "Logged out successfully" })

    // Clear the cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
