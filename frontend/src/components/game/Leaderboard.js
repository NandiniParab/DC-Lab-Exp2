"use client"

import { useState, useEffect } from "react"
import { useGame } from "../../contexts/GameContext"

const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard } = useGame()
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    fetchLeaderboard(timeFilter)
  }, [timeFilter])

  const timeFilters = [
    { value: "all", label: "All Time" },
    { value: "month", label: "This Month" },
    { value: "week", label: "This Week" },
    { value: "today", label: "Today" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600">🏆 Leaderboard</h2>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="input max-w-xs">
          {timeFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              index === 0
                ? "border-yellow-300 bg-yellow-50"
                : index === 1
                  ? "border-gray-300 bg-gray-50"
                  : index === 2
                    ? "border-orange-300 bg-orange-50"
                    : "border-pink-200 bg-pink-50"
            }`}
          >
            <div className="text-2xl font-bold text-gray-600 min-w-[2rem]">#{player.rank}</div>
            <div className="text-3xl">{player.avatar}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{player.username}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Score: {player.stats.totalScore}</span>
                <span>Tags: {player.stats.timesTagged}</span>
                <span>Tagged: {player.stats.timesBeenTagged}</span>
              </div>
            </div>
            {index < 3 && <div className="text-2xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>}
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎮</div>
          <p className="text-gray-600">No players yet. Start playing to see the leaderboard!</p>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
