"use client"
import { useAuth } from "../contexts/AuthContext"
import AuthPage from "./auth/AuthPage"
import GameDashboard from "./game/GameDashboard"
import Header from "./layout/Header"

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">💖</div>
          <div className="text-pink-600 font-semibold">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-6">{isAuthenticated ? <GameDashboard /> : <AuthPage />}</main>
    </div>
  )
}

export default MainApp
