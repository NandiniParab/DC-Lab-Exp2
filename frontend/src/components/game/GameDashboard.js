"use client"

import { useState } from "react"
import GameBoard from "./GameBoard"
import Leaderboard from "./Leaderboard"
import GameStats from "./GameStats"

const GameDashboard = () => {
  const [activeTab, setActiveTab] = useState("game")

  const tabs = [
    { id: "game", label: "Game", icon: "🎮" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "stats", label: "Stats", icon: "📊" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex bg-white rounded-full p-1 shadow-lg border border-pink-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id ? "bg-pink-500 text-white shadow-md" : "text-pink-600 hover:bg-pink-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {activeTab === "game" && <GameBoard />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "stats" && <GameStats />}
      </div>
    </div>
  )
}

export default GameDashboard
