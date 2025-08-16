"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlayerAvatarProps {
  username: string
  avatar: string
  tags: number
  isIt: boolean
  isCurrentUser: boolean
  onTag?: () => void
  canTag: boolean
}

export function PlayerAvatar({ username, avatar, tags, isIt, isCurrentUser, onTag, canTag }: PlayerAvatarProps) {
  return (
    <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-card cute-shadow">
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
            isIt ? "bg-accent text-accent-foreground animate-pulse" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {avatar}
        </div>
        {isIt && (
          <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1">IT!</Badge>
        )}
      </div>
      <div className="text-center">
        <p className={`font-medium ${isCurrentUser ? "text-primary" : "text-foreground"}`}>{username}</p>
        <p className="text-sm text-muted-foreground">{tags} tags</p>
      </div>
      {canTag && !isCurrentUser && !isIt && onTag && (
        <Button size="sm" onClick={onTag} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Tag! 🎯
        </Button>
      )}
    </div>
  )
}
