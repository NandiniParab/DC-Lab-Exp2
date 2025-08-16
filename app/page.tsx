"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthPage } from "@/components/auth/auth-page"
import { GameDashboard } from "@/components/game/game-dashboard"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Tag Me...</p>
        </div>
      </div>
    )
  }

  return user ? <GameDashboard /> : <AuthPage />
}
