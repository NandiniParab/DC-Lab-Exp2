import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
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

    // Check if user already exists
    const existingUser = await User.findByUsername(db, username)
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create(db, {
      username,
      password: hashedPassword,
    })

    return NextResponse.json({
      message: "User created successfully",
      user: { username: user.username, tags: user.tags },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
