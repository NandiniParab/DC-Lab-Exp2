"use client"

import { useAuth } from "../../contexts/AuthContext"

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-pink-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💖</div>
            <h1 className="text-2xl font-bold text-pink-600">Tag Me!</h1>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{user?.avatar || "👧"}</span>
                <span className="font-semibold text-gray-700">{user?.username}</span>
              </div>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
