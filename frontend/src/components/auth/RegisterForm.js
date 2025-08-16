"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()

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

    const result = await register(formData.username, formData.email, formData.password)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="input"
          placeholder="Choose a cute username"
          required
        />
      </div>

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
          placeholder="Create a secure password"
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Creating account..." : "Join the Fun! 🌸"}
      </button>
    </form>
  )
}

export default RegisterForm
