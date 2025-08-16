"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

interface Player {
  username: string
  avatar: string
  tags: number
  isOnline: boolean
}

interface GameState {
  currentIt: string | null
  players: Player[]
  lastTagged: string | null
  gameStarted: boolean
}

interface GameContextType {
  gameState: GameState
  tagPlayer: (targetPlayer: string) => Promise<boolean>
  startGame: () => Promise<boolean>
  refreshGameState: () => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    currentIt: null,
    players: [],
    lastTagged: null,
    gameStarted: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      refreshGameState()
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        refreshGameState()
        refreshUser() // Also refresh user data to get updated tag count
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [user])

  const refreshGameState = async () => {
    try {
      const response = await fetch("/api/game/status")
      if (response.ok) {
        const data = await response.json()
        setGameState({
          currentIt: data.currentIt,
          players: data.players || [],
          lastTagged: data.lastTagged,
          gameStarted: !!data.currentIt,
        })
      }
    } catch (error) {
      console.error("Failed to refresh game state:", error)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const tagPlayer = async (targetPlayer: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/game/tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagged: targetPlayer }),
      })

      const data = await response.json()

      if (response.ok) {
        await refreshGameState()
        await refreshUser() // Refresh user data to update tag count
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (error) {
      setError("Failed to tag player. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const startGame = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        await refreshGameState()
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (error) {
      setError("Failed to start game. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <GameContext.Provider value={{ gameState, tagPlayer, startGame, refreshGameState, loading, error, clearError }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
