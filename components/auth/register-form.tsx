"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return
    }

    await register(username, password)
  }

  return (
    <Card className="w-full max-w-md cute-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary heart-decoration">Join the Fun!</CardTitle>
        <CardDescription>Create your account to start playing Tag Me!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a cute username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-lg border-2 border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border-2 border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-lg border-2 border-border focus:border-primary"
            />
            {password !== confirmPassword && confirmPassword && (
              <p className="text-destructive text-xs">Passwords don't match</p>
            )}
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 font-medium"
            disabled={loading || password !== confirmPassword}
          >
            {loading ? "Creating account..." : "Sign Up 🎀"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={onToggleMode} className="text-primary hover:text-primary/80 font-medium underline">
              Sign in here!
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
