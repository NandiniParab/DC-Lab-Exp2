import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { User } from "@/lib/models/User"

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("tagme")

    // Find user
    const user = await User.findByUsername(db, username)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set user online
    await User.setOnlineStatus(db, username, true)

    // Create JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        username: user.username,
        tags: user.tags,
        avatar: user.avatar,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
