"use client"

import { useAuth } from "../../contexts/AuthContext"

const GameStats = () => {
  const { user } = useAuth()

  const stats = user?.stats || {
    gamesPlayed: 0,
    timesTagged: 0,
    timesBeenTagged: 0,
    totalScore: 0,
  }

  const statCards = [
    {
      label: "Total Score",
      value: stats.totalScore,
      icon: "⭐",
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    {
      label: "Games Played",
      value: stats.gamesPlayed,
      icon: "🎮",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      label: "Times Tagged",
      value: stats.timesTagged,
      icon: "🎯",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      label: "Times Been Tagged",
      value: stats.timesBeenTagged,
      icon: "😅",
      color: "bg-red-50 border-red-200 text-red-700",
    },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">{user?.avatar || "👧"}</div>
        <h2 className="text-2xl font-bold text-pink-600">{user?.username}'s Stats</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`card border-2 ${stat.color}`}>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
          <h3 className="font-semibold text-pink-700 mb-2">Keep Playing! 💕</h3>
          <p className="text-gray-600">Tag more players to increase your score and climb the leaderboard!</p>
        </div>
      </div>
    </div>
  )
}

export default GameStats
