"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

const GameContext = createContext()

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    gameActive: false,
    players: [],
    currentIt: null,
    gameId: null,
    tagHistory: [],
  })
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)

  const { isAuthenticated } = useAuth()
  const API_BASE_URL = "http://localhost:5000/api"

  useEffect(() => {
    if (isAuthenticated) {
      fetchGameStatus()
      fetchLeaderboard()
    }
  }, [isAuthenticated])

  const fetchGameStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/game/status`)
      setGameState(response.data)
    } catch (error) {
      console.error("Failed to fetch game status:", error)
    }
  }

  const fetchLeaderboard = async (timeFilter = "all") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard?timeFilter=${timeFilter}`)
      setLeaderboard(response.data.leaderboard)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    }
  }

  const startGame = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/game/start`)
      await fetchGameStatus()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to start game",
      }
    } finally {
      setLoading(false)
    }
  }

  const tagPlayer = async (targetUserId) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/game/tag`, {
        targetUserId,
      })
      await fetchGameStatus()
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to tag player",
      }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    gameState,
    leaderboard,
    loading,
    startGame,
    tagPlayer,
    fetchGameStatus,
    fetchLeaderboard,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
