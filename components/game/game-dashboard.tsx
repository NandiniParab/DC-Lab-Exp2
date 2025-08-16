"use client"
import { useAuth } from "@/lib/auth-context"
import { GameBoard } from "./game-board"
import { Leaderboard } from "./leaderboard"
import { GameStats } from "./game-stats"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function GameDashboard() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border cute-shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Tag Me! 💖</h1>
            <div className="text-sm text-muted-foreground">
              Welcome back, <span className="font-medium text-primary">{user?.username}</span>!
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Tags: <span className="font-bold text-accent">{user?.tags || 0}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-border hover:bg-muted bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="game" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-lg p-1">
            <TabsTrigger
              value="game"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              🎮 Game
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              🏆 Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              📊 Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="space-y-6">
            <GameBoard />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <GameStats />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Made with 💖 for the cutest tag game ever!</p>
        </div>
      </footer>
    </div>
  )
}
