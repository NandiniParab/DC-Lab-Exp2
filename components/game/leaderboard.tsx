"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LeaderboardEntry {
  username: string
  tags: number
  avatar: string
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"all" | "today" | "week" | "month">("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "👑"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "🎀"
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case "all":
        return "All Time"
      case "today":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      default:
        return "All Time"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <Card className="cute-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary heart-decoration">Leaderboard</CardTitle>
        <CardDescription>Top taggers in the game!</CardDescription>

        <div className="flex justify-center space-x-2 mt-4">
          {(["all", "today", "week", "month"] as const).map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? "default" : "outline"}
              onClick={() => setTimeframe(tf)}
              className={timeframe === tf ? "bg-primary text-primary-foreground" : ""}
            >
              {getTimeframeLabel(tf)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((player, index) => {
              const rank = index + 1
              return (
                <div
                  key={player.username}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    rank <= 3 ? "bg-accent/10 border border-accent/20" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl ${getRankColor(rank)}`}>{getRankEmoji(rank)}</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                        {player.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.username}</p>
                        <p className="text-sm text-muted-foreground">Rank #{rank}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={rank <= 3 ? "default" : "secondary"}
                      className={rank <= 3 ? "bg-accent text-accent-foreground" : ""}
                    >
                      {player.tags} tags
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No players on the leaderboard yet</p>
            <p className="text-sm">Be the first to start tagging!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
