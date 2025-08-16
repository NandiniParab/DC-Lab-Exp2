"use client"

import { useGame } from "../../contexts/GameContext"
import { useAuth } from "../../contexts/AuthContext"
import PlayerAvatar from "./PlayerAvatar"

const GameBoard = () => {
  const { gameState, startGame, tagPlayer, loading } = useGame()
  const { user } = useAuth()

  const handleStartGame = async () => {
    const result = await startGame()
    if (!result.success) {
      alert(result.error)
    }
  }

  const handleTagPlayer = async (playerId) => {
    const result = await tagPlayer(playerId)
    if (!result.success) {
      alert(result.error)
    } else {
      alert("Tag successful! 🎉")
    }
  }

  const isUserIt = gameState.currentIt === user?.id

  if (!gameState.gameActive) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-3xl font-bold text-pink-600 mb-4">Ready to Play?</h2>
        <p className="text-gray-600 mb-8">Start a new game and begin the fun!</p>
        <button onClick={handleStartGame} disabled={loading} className="btn btn-primary text-lg px-8 py-4">
          {loading ? "Starting..." : "Start New Game! 🌸"}
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-pink-600 mb-2">Game Active! 🎉</h2>
        {isUserIt ? (
          <p className="text-lg text-rose-600 font-semibold">You're IT! Tag someone! 💕</p>
        ) : (
          <p className="text-lg text-gray-600">
            <span className="font-semibold text-pink-600">
              {gameState.players.find((p) => p.id === gameState.currentIt)?.username}
            </span>{" "}
            is IT! Run! 🏃‍♀️
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {gameState.players.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            isIt={player.id === gameState.currentIt}
            canTag={isUserIt && player.id !== user?.id}
            onTag={() => handleTagPlayer(player.id)}
            loading={loading}
          />
        ))}
      </div>

      {gameState.tagHistory.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="font-semibold text-pink-700 mb-3">Recent Tags 📝</h3>
          <div className="space-y-2">
            {gameState.tagHistory.slice(-5).map((tag, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-semibold">{gameState.players.find((p) => p.id === tag.taggerId)?.username}</span>{" "}
                tagged{" "}
                <span className="font-semibold">
                  {gameState.players.find((p) => p.id === tag.targetUserId)?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
