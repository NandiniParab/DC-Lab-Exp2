"use client"

const PlayerAvatar = ({ player, isIt, canTag, onTag, loading }) => {
  return (
    <div
      className={`card transition-all duration-300 ${
        isIt ? "border-rose-300 bg-rose-50" : "border-pink-200"
      } ${canTag ? "hover:shadow-lg cursor-pointer" : ""}`}
      onClick={canTag ? onTag : undefined}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="text-4xl">{player.avatar || "👧"}</div>
          {isIt && <div className="absolute -top-1 -right-1 text-lg">👑</div>}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{player.username}</h3>
          {isIt && <p className="text-sm text-rose-600 font-medium">Currently IT!</p>}
          {canTag && <p className="text-sm text-pink-600">Click to tag! 💕</p>}
        </div>
      </div>
    </div>
  )
}

export default PlayerAvatar
