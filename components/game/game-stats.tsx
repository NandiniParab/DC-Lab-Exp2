"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GameStats {
  totalTags: number
  totalPlayers: number
  onlinePlayers: number
  topTagger: { username: string; tags: number } | null
}

interface TagEvent {
  tagger: string
  tagged: string
  timestamp: string
}

export function GameStats() {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [recentTags, setRecentTags] = useState<TagEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentTags()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/game/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchRecentTags = async () => {
    try {
      const response = await fetch("/api/game/history?limit=5")
      if (response.ok) {
        const data = await response.json()
        setRecentTags(data.history)
      }
    } catch (error) {
      console.error("Failed to fetch recent tags:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cute-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalTags || 0}</div>
          </CardContent>
        </Card>

        <Card className="cute-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalPlayers || 0}</div>
          </CardContent>
        </Card>

        <Card className="cute-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats?.onlinePlayers || 0}</div>
          </CardContent>
        </Card>

        <Card className="cute-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Tagger</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topTagger ? (
              <div>
                <div className="font-bold text-primary">{stats.topTagger.username}</div>
                <div className="text-sm text-muted-foreground">{stats.topTagger.tags} tags</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No tags yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="cute-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary heart-decoration">Recent Tag Activity</CardTitle>
          <CardDescription>Latest tagging events in the game</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTags.length > 0 ? (
            <div className="space-y-3">
              {recentTags.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      Tag!
                    </Badge>
                    <span className="text-sm">
                      <span className="font-medium text-primary">{event.tagger}</span> tagged{" "}
                      <span className="font-medium text-accent">{event.tagged}</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent tag activity</p>
              <p className="text-sm">Start playing to see some action!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
