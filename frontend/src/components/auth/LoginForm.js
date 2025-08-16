"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input"
          placeholder="Enter your password"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Signing in..." : "Sign In 💕"}
      </button>
    </form>
  )
}

export default LoginForm
