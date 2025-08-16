"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  const API_BASE_URL = "http://localhost:5000/api"

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`)
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data

      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
