"use client"

import { useGame } from "@/lib/game-context"
import { useAuth } from "@/lib/auth-context"
import { PlayerAvatar } from "./player-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function GameBoard() {
  const { user } = useAuth()
  const { gameState, tagPlayer, startGame, loading, error, clearError } = useGame()

  if (!user) return null

  const canTag = gameState.currentIt === user.username
  const isUserIt = gameState.currentIt === user.username

  const handleTagPlayer = async (targetPlayer: string) => {
    const success = await tagPlayer(targetPlayer)
    if (success) {
      // Clear any previous errors on successful tag
      clearError()
    }
  }

  const handleStartGame = async () => {
    const success = await startGame()
    if (success) {
      clearError()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="cute-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary heart-decoration">Tag Me! Game</CardTitle>
          <CardDescription>
            {gameState.gameStarted ? (
              isUserIt ? (
                <span className="text-accent font-medium">You are IT! Tag someone! 🎯</span>
              ) : (
                <span>
                  <strong className="text-accent">{gameState.currentIt}</strong> is IT! Run! 🏃‍♀️
                </span>
              )
            ) : (
              "Start a game to begin playing!"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive">
              <AlertDescription className="text-destructive flex items-center justify-between">
                {error}
                <Button size="sm" variant="ghost" onClick={clearError} className="h-auto p-1 text-destructive">
                  ✕
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!gameState.gameStarted && gameState.players.length >= 2 && (
            <div className="text-center mb-6">
              <Button
                onClick={handleStartGame}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Starting..." : "Start Game! 🎮"}
              </Button>
            </div>
          )}

          {gameState.players.length < 2 && (
            <div className="text-center mb-6">
              <p className="text-muted-foreground">Waiting for more players to join... (Need at least 2 players)</p>
              <p className="text-sm text-muted-foreground mt-2">Current players: {gameState.players.length}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gameState.players.map((player) => (
              <PlayerAvatar
                key={player.username}
                username={player.username}
                avatar={player.avatar}
                tags={player.tags}
                isIt={gameState.currentIt === player.username}
                isCurrentUser={player.username === user.username}
                onTag={() => handleTagPlayer(player.username)}
                canTag={canTag}
              />
            ))}
          </div>

          {gameState.players.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No players online</p>
              <p className="text-sm">Refresh the page or wait for other players to join!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
