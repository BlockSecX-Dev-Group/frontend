"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, CheckCircle, Clock, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface VideoData {
  id: string
  title: string
  description: string
  duration: number // seconds
  videoUrl: string
  points: number
}

export interface VideoProgress {
  currentVideoIndex: number
  totalVideos: number
  watchedToday: boolean
  currentVideo: VideoData | null
}

interface VideoPlayerProps {
  videoProgress: VideoProgress
  onComplete: (videoId: string, watchToken: string) => Promise<boolean>
  onHeartbeat?: (videoId: string, progress: number, watchToken: string) => void
  className?: string
}

// Generate watch token for verification
const generateWatchToken = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function VideoPlayer({
  videoProgress,
  onComplete,
  onHeartbeat,
  className
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [watchProgress, setWatchProgress] = useState(0)
  const [canComplete, setCanComplete] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [watchToken] = useState(() => generateWatchToken())
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const lastTimeRef = useRef(0)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { currentVideo, currentVideoIndex, totalVideos, watchedToday } = videoProgress

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle video time update - track actual watch progress
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !currentVideo) return

    const currentTime = videoRef.current.currentTime
    const duration = currentVideo.duration

    // Calculate time difference to detect seeking
    const timeDiff = currentTime - lastTimeRef.current

    // Only count natural playback (not seeking)
    if (timeDiff > 0 && timeDiff < 2) {
      setTotalWatchTime(prev => prev + timeDiff)
    }

    lastTimeRef.current = currentTime

    // Progress based on actual watch time, not video position
    const actualProgress = Math.min((totalWatchTime / duration) * 100, 100)
    setWatchProgress(actualProgress)

    // Allow completion at 90% actual watch time
    if (actualProgress >= 90 && !canComplete) {
      setCanComplete(true)
    }
  }, [currentVideo, totalWatchTime, canComplete])

  // Setup heartbeat for backend verification
  useEffect(() => {
    if (isPlaying && currentVideo && onHeartbeat) {
      heartbeatIntervalRef.current = setInterval(() => {
        onHeartbeat(currentVideo.id, watchProgress, watchToken)
      }, 30000) // Send heartbeat every 30 seconds
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [isPlaying, currentVideo, watchProgress, watchToken, onHeartbeat])

  // Handle video completion
  const handleCompleteVideo = async () => {
    if (!canComplete || !currentVideo || isCompleting) return

    setIsCompleting(true)
    try {
      const success = await onComplete(currentVideo.id, watchToken)
      if (!success) {
        console.error("Failed to complete video")
      }
    } catch (error) {
      console.error("Error completing video:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  // Prevent context menu (right-click) for security
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  // Completed state
  if (watchedToday) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Today's Video Completed</h3>
        <p className="text-muted-foreground mb-4">
          Come back tomorrow for the next lesson
        </p>
        <div className="text-sm text-muted-foreground">
          Progress: {currentVideoIndex + 1} / {totalVideos} videos
        </div>
      </div>
    )
  }

  // No video available
  if (!currentVideo) {
    return (
      <div className={cn("text-center py-12", className)}>
        <CheckCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">All Videos Completed!</h3>
        <p className="text-muted-foreground">
          You've finished all video lessons. Great job!
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
            Lesson {currentVideoIndex + 1} / {totalVideos}
          </div>
          <h3 className="text-xl font-semibold">{currentVideo.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentVideo.description}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary font-medium">
            <Award className="h-4 w-4" />
            +{currentVideo.points} pts
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDuration(currentVideo.duration)}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          src={currentVideo.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onSeeking={() => {
            // Reset last time on seek to prevent counting skipped time
            if (videoRef.current) {
              lastTimeRef.current = videoRef.current.currentTime
            }
          }}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={handleContextMenu}
        />
      </div>

      {/* Watch Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Watch Progress</span>
          <span className={cn(
            "font-medium",
            watchProgress >= 90 ? "text-green-500" : "text-muted-foreground"
          )}>
            {Math.round(watchProgress)}%
          </span>
        </div>
        <Progress value={watchProgress} className="h-2" />
        {watchProgress < 90 && (
          <p className="text-xs text-muted-foreground">
            Watch at least 90% to complete this lesson
          </p>
        )}
      </div>

      {/* Complete Button */}
      <Button
        className="w-full"
        size="lg"
        disabled={!canComplete || isCompleting}
        onClick={handleCompleteVideo}
      >
        {isCompleting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Completing...
          </>
        ) : canComplete ? (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Complete & Earn {currentVideo.points} Points
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Watch Video to Complete
          </>
        )}
      </Button>
    </div>
  )
}

export default VideoPlayer
