"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Clock,
  Trophy,
  Users,
  ArrowRight,
  Flame,
  Check,
  Lock,
  Play,
  HelpCircle,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Challenge level enum
export enum ChallengeLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

// Challenge type enum - Learning format classification
export enum ChallengeType {
  VIDEO = "video",      // Video learning
  QUIZ = "quiz",        // Knowledge Q&A
  CTF = "ctf",          // Practical CTF challenges
}

// Challenge status enum
export enum ChallengeStatus {
  AVAILABLE = "available",
  LOCKED = "locked",
  COMPLETED = "completed",
  LAUNCHED = "launched",
}

// Challenge data interface
export interface ChallengeData {
  id: string
  title: string
  description: string
  level: ChallengeLevel
  type: ChallengeType
  points: number
  timeLimit: number
  participants: number
  completions: number
  status: ChallengeStatus
  image?: string
  tags?: string[]
  prerequisites?: string[]
  progress?: number
}

interface ChallengeCardProps {
  challenge: ChallengeData
  compact?: boolean
  showTags?: boolean
  showProgress?: boolean
  className?: string
}

export function ChallengeCard({
  challenge,
  compact = false,
  showTags = true,
  showProgress = true,
  className,
}: ChallengeCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getLevelStyle = (level: ChallengeLevel) => {
    switch (level) {
      case ChallengeLevel.BEGINNER:
        return "text-green-500 bg-green-500/10"
      case ChallengeLevel.INTERMEDIATE:
        return "text-blue-500 bg-blue-500/10"
      case ChallengeLevel.ADVANCED:
        return "text-amber-500 bg-amber-500/10"
      case ChallengeLevel.EXPERT:
        return "text-red-500 bg-red-500/10"
      default:
        return "text-gray-500 bg-gray-500/10"
    }
  }

  const getLevelName = (level: ChallengeLevel) => {
    switch (level) {
      case ChallengeLevel.BEGINNER:
        return "Beginner"
      case ChallengeLevel.INTERMEDIATE:
        return "Intermediate"
      case ChallengeLevel.ADVANCED:
        return "Advanced"
      case ChallengeLevel.EXPERT:
        return "Expert"
      default:
        return "Unknown"
    }
  }

  const getTypeName = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.VIDEO:
        return "Video"
      case ChallengeType.QUIZ:
        return "Quiz"
      case ChallengeType.CTF:
        return "CTF"
      default:
        return "Other"
    }
  }

  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.VIDEO:
        return <Play className="h-3 w-3" />
      case ChallengeType.QUIZ:
        return <HelpCircle className="h-3 w-3" />
      case ChallengeType.CTF:
        return <Shield className="h-3 w-3" />
      default:
        return null
    }
  }

  const getTypeStyle = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.VIDEO:
        return "text-purple-500 bg-purple-500/10 border-purple-500/20"
      case ChallengeType.QUIZ:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case ChallengeType.CTF:
        return "text-red-500 bg-red-500/10 border-red-500/20"
      default:
        return "bg-secondary/50"
    }
  }

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.COMPLETED:
        return <Check className="h-4 w-4 text-green-500" />
      case ChallengeStatus.LOCKED:
        return <Lock className="h-4 w-4 text-gray-500" />
      case ChallengeStatus.LAUNCHED:
        return <Flame className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.AVAILABLE:
        return "Available"
      case ChallengeStatus.LOCKED:
        return "Locked"
      case ChallengeStatus.COMPLETED:
        return "Completed"
      case ChallengeStatus.LAUNCHED:
        return "Running"
      default:
        return ""
    }
  }

  const isPlayable = challenge.status === ChallengeStatus.AVAILABLE ||
    challenge.status === ChallengeStatus.COMPLETED

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border transition-all duration-300 bg-card",
        isPlayable
          ? "border-border hover:border-primary/50 hover:shadow-md"
          : "border-border opacity-80",
        isHovered && "shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Status badge */}
        {challenge.status !== ChallengeStatus.AVAILABLE && (
          <div className="mb-3">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 w-fit",
                challenge.status === ChallengeStatus.COMPLETED && "bg-green-500/10 text-green-500 border-green-500/20",
                challenge.status === ChallengeStatus.LAUNCHED && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                challenge.status === ChallengeStatus.LOCKED && "bg-gray-500/10 text-gray-500 border-gray-500/20"
              )}
            >
              {getStatusIcon(challenge.status)}
              <span className="text-xs">{getStatusText(challenge.status)}</span>
            </Badge>
          </div>
        )}

        {/* Type and Level */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={cn("flex items-center gap-1", getTypeStyle(challenge.type))}>
            {getTypeIcon(challenge.type)}
            {getTypeName(challenge.type)}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              getLevelStyle(challenge.level)
            )}
          >
            <Flame className="h-3 w-3" />
            <span>{getLevelName(challenge.level)}</span>
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{challenge.title}</h3>

        {/* Description */}
        {!compact && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {challenge.description}
          </p>
        )}

        {/* Tags */}
        {showTags && challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {challenge.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs py-0 px-1.5 bg-secondary/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-auto pt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>{challenge.points} pts</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>{challenge.timeLimit} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-green-500" />
            <span>{challenge.participants}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-border">
          <Link
            href={`/challenges/${encodeURIComponent(challenge.id)}`}
            className={cn(
              "flex items-center justify-between w-full",
              !isPlayable && "pointer-events-none"
            )}
          >
            <Button
              variant={challenge.status === ChallengeStatus.LOCKED ? "outline" : "default"}
              className={cn(
                "w-full",
                challenge.status === ChallengeStatus.LOCKED && "opacity-60 cursor-not-allowed"
              )}
              disabled={challenge.status === ChallengeStatus.LOCKED}
            >
              {challenge.status === ChallengeStatus.LOCKED && <Lock className="mr-2 h-4 w-4" />}
              {challenge.status === ChallengeStatus.COMPLETED ? "Try Again" :
                challenge.status === ChallengeStatus.LAUNCHED ? "Continue" :
                  challenge.status === ChallengeStatus.LOCKED ? "Locked" : "Start Challenge"}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
