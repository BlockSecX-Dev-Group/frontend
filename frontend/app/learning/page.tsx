"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, HelpCircle, Shield, Trophy, ArrowRight, Loader2, Lock,
  CheckCircle, Flame, Video, FileQuestion, Clock, Award, RefreshCw, Timer,
  ChevronLeft, ChevronRight as ChevronRightIcon, Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getAllFields, getAvailableFieldsForUser, isAuthenticated } from "@/api"
import { FieldInfo } from "@/api/types"
import { getChallengeQuestions, submitChallengeAnswers, QuizSession } from "@/api/quiz"
import {
  getAllVideosInfo,
  startWatching,
  completeWatching,
  VideoInfo,
  VideoListResponse,
  VideoSession,
  getCurrentTimestamp
} from "@/api/video"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

interface CTFChallenge {
  id: string; title: string; description: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  points: number; isAvailable: boolean
}

const mapFieldToChallenge = (field: FieldInfo, availableFields: string[]): CTFChallenge => {
  let difficulty: CTFChallenge["difficulty"] = "beginner"
  if (field.cost >= 200) difficulty = "expert"
  else if (field.cost >= 100) difficulty = "advanced"
  else if (field.cost >= 50) difficulty = "intermediate"
  return {
    id: field.field_name, title: field.field_name,
    description: field.description || "Practice smart contract vulnerabilities",
    difficulty, points: field.cost || 100, isAvailable: availableFields.includes(field.field_name)
  }
}

function LearningContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "video")
  const [tabDirection, setTabDirection] = useState<"left" | "right">("left")
  const tabOrder = ["video", "quiz", "ctf"]
  const [ctfChallenges, setCtfChallenges] = useState<CTFChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Video state - new API structure
  const [videoList, setVideoList] = useState<VideoInfo[]>([])
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [session, setSession] = useState<VideoSession | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [canComplete, setCanComplete] = useState(false)
  const [useBackend, setUseBackend] = useState(true)

  // Quiz state
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left")
  const [isQuizLoading, setIsQuizLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState<{ correctCount: number } | null>(null)

  // Fetch video list from API
  const fetchVideos = useCallback(async () => {
    setIsVideoLoading(true)
    try {
      const data = await getAllVideosInfo()
      setVideoList(data.video_list || [])
      // Find first playable video
      const firstPlayable = data.video_list.findIndex((v: VideoInfo) => v.can_play && !v.is_received)
      setSelectedVideoIndex(firstPlayable >= 0 ? firstPlayable : 0)
      setUseBackend(true)
    } catch (error) {
      console.error("[Video] Failed to fetch:", error)
      setUseBackend(false)
      // Fallback demo data
      setVideoList([{
        video_id: "demo",
        video_name: t("learning.demo_video"),
        video_desc: t("learning.demo_desc"),
        video_duration: 30,
        point_reward: 10,
        sort_order: 0,
        can_play: true,
        is_received: false,
        play_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        unlock_msg: t("learning.demo_mode")
      }])
    } finally {
      setIsVideoLoading(false)
    }
  }, [t])

  // Fetch CTF challenges
  const fetchChallenges = async () => {
    setIsLoading(true)
    try {
      const fields = await getAllFields()
      let availableFields: string[] = []
      if (isAuthenticated()) { try { availableFields = await getAvailableFieldsForUser() } catch {} }
      setCtfChallenges(fields.map(f => mapFieldToChallenge(f, availableFields)))
    } catch { setCtfChallenges([]) } finally { setIsLoading(false) }
  }

  // 重置视频播放状态的函数
  const resetVideoState = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setSession(null)
    setElapsed(0)
    setCanComplete(false)
    setSelectedVideoIndex(0)
  }, [])

  useEffect(() => {
    fetchChallenges()
    fetchVideos()
    const handleAuth = () => {
      // 钱包切换/登出时重置所有视频状态
      resetVideoState()
      fetchChallenges()
      fetchVideos()
    }
    window.addEventListener("authStateChanged", handleAuth)
    return () => {
      window.removeEventListener("authStateChanged", handleAuth)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchVideos, resetVideoState])

  // Timer for elapsed time
  useEffect(() => {
    if (session && !canComplete) {
      timerRef.current = setInterval(() => {
        const now = getCurrentTimestamp()
        const newElapsed = now - session.startTimestamp
        setElapsed(newElapsed)
        // Allow completion if watched at least 80% of video duration
        const minTime = session.videoDuration * 0.8
        if (newElapsed >= minTime) setCanComplete(true)
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [session, canComplete])

  // Get current video
  const currentVideo = videoList[selectedVideoIndex]
  const minWatchTime = session ? session.videoDuration * 0.8 : (currentVideo ? currentVideo.video_duration * 0.8 : 0)
  const progress = minWatchTime > 0 ? Math.min((elapsed / minWatchTime) * 100, 100) : 0

  // Handle start video
  const handleStartVideo = async (autoPlay = true) => {
    if (!currentVideo) return false
    if (!isAuthenticated()) {
      toast({ title: t("learning.login_required"), description: t("wallet.connect_first"), variant: "destructive" })
      return false
    }
    if (!currentVideo.can_play) {
      toast({ title: t("learning.video.locked"), description: currentVideo.unlock_msg || t("learning.video.complete_previous"), variant: "destructive" })
      return false
    }
    if (isStarting) return false

    setIsStarting(true)
    try {
      const newSession = await startWatching(currentVideo)
      setSession(newSession)
      setElapsed(0)
      setCanComplete(false)
      toast({ title: t("learning.video.started"), description: t("learning.video.tracking") })
      if (autoPlay && videoRef.current) videoRef.current.play().catch(() => {})
      return true
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" })
      return false
    } finally { setIsStarting(false) }
  }

  const handleVideoPlay = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // 已完成视频可以直接播放，不需要创建session
    if (currentVideo?.is_received) {
      return
    }
    // 待观看视频需要创建session
    if (!session && !isStarting) {
      e.currentTarget.pause()
      const started = await handleStartVideo(false)
      if (started && videoRef.current) videoRef.current.play().catch(() => {})
    }
  }

  const handleComplete = async () => {
    if (!session) return
    setIsCompleting(true)
    try {
      const result = await completeWatching(session)
      if (result.success) {
        toast({ title: t("learning.video.completed"), description: `+${result.pointsEarned} ${t("learning.points")}! ${result.message}` })
      } else {
        toast({ title: t("common.error"), description: result.message || t("learning.video.keep_watching"), variant: "destructive" })
      }
      setSession(null)
      setElapsed(0)
      setCanComplete(false)
      await fetchVideos()
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" })
    } finally { setIsCompleting(false) }
  }

  const handleVideoSelect = (index: number) => {
    // 切换视频时清除当前session
    if (session) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setSession(null)
    }
    setSelectedVideoIndex(index)
    setElapsed(0)
    setCanComplete(false)
  }

  // Quiz functions
  const handleStartQuiz = async () => {
    if (!isAuthenticated()) {
      toast({ title: t("learning.login_required"), description: t("wallet.connect_first"), variant: "destructive" })
      return
    }
    setIsQuizLoading(true)
    setQuizResult(null)
    setQuizAnswers({})
    setCurrentQuestionIndex(0)
    try {
      const quizData = await getChallengeQuestions()
      setQuizSession(quizData)
      toast({ title: t("learning.quiz.started"), description: t("learning.quiz.loaded").replace("{count}", String(quizData.questions.length)) })
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("common.error"), variant: "destructive" })
    } finally { setIsQuizLoading(false) }
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId.toString()]: answer }))
  }

  const handleNextQuestion = () => {
    setSlideDirection("left")
    setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))
  }

  const handlePrevQuestion = () => {
    setSlideDirection("right")
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
  }

  const handleQuestionJump = (index: number) => {
    setSlideDirection(index > currentQuestionIndex ? "left" : "right")
    setCurrentQuestionIndex(index)
  }

  const handleSubmitQuiz = async () => {
    if (!quizSession) return
    setIsSubmitting(true)
    try {
      const result = await submitChallengeAnswers(quizSession.sessionId, quizAnswers)
      setQuizResult(result)
      toast({
        title: t("learning.quiz.complete"),
        description: t("learning.quiz.result").replace("{correct}", String(result.correctCount)).replace("{total}", String(quizSession.questions.length)),
      })
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("common.error"), variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  const handleExitQuiz = () => {
    setQuizSession(null)
    setQuizResult(null)
    setQuizAnswers({})
    setCurrentQuestionIndex(0)
  }

  const handleTabChange = (newTab: string) => {
    const currentIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(newTab)
    setTabDirection(newIndex > currentIndex ? "left" : "right")
    setActiveTab(newTab)
  }

  const getDifficultyStyle = (d: string) => {
    if (d === "beginner") return "bg-green-500/10 text-green-500"
    if (d === "intermediate") return "bg-blue-500/10 text-blue-500"
    if (d === "advanced") return "bg-orange-500/10 text-orange-500"
    if (d === "expert") return "bg-red-500/10 text-red-500"
    return "bg-gray-500/10 text-gray-500"
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return m + ":" + sec.toString().padStart(2, "0")
  }

  const answeredCount = Object.keys(quizAnswers).length
  const totalQuestions = quizSession?.questions.length || 0
  const completedVideos = videoList.filter(v => v.is_received).length

  // Tab slide animation variants
  const tabSlideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? 300 : -300,
      opacity: 0
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -300 : 300,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="container mx-auto px-4 py-6 max-w-6xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1">
            <TabsTrigger value="video" className="gap-2 text-base h-full"><Video className="h-5 w-5" />{t("learning.tabs.video")}</TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2 text-base h-full"><FileQuestion className="h-5 w-5" />{t("learning.tabs.quiz")}</TabsTrigger>
            <TabsTrigger value="ctf" className="gap-2 text-base h-full"><Shield className="h-5 w-5" />{t("learning.tabs.ctf")}</TabsTrigger>
          </TabsList>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={tabDirection}>
              <motion.div
                key={activeTab}
                custom={tabDirection}
                variants={tabSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Video Tab */}
                {activeTab === "video" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardContent className="p-4">
                          {isVideoLoading ? (
                            <div className="flex flex-col items-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                              <p className="text-muted-foreground">{t("learning.video.loading")}</p>
                            </div>
                          ) : currentVideo ? (
                            <div className="space-y-4">
                              {/* Video Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="shrink-0">
                                      {selectedVideoIndex + 1} / {videoList.length}
                                    </Badge>
                                    {currentVideo.is_received && (
                                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 shrink-0">
                                        <CheckCircle className="h-3 w-3 mr-1" />{t("learning.completed")}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-semibold truncate">{currentVideo.video_name.replace('.mp4', '')}</h3>
                                  {currentVideo.video_desc && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{currentVideo.video_desc}</p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-center gap-1 text-primary font-medium">
                                    <Gift className="h-4 w-4" />+{currentVideo.point_reward} pts
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />{formatTime(currentVideo.video_duration)}
                                  </div>
                                </div>
                              </div>

                              {/* Video Player */}
                              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                {currentVideo.can_play && currentVideo.play_url ? (
                                  <>
                                    <video
                                      ref={videoRef}
                                      className="w-full h-full"
                                      src={currentVideo.play_url}
                                      controls
                                      controlsList="nodownload"
                                      onContextMenu={e => e.preventDefault()}
                                      onPlay={handleVideoPlay}
                                    />
                                    {/* 只有待观看视频(未完成)且无session时显示开始覆盖层 */}
                                    {!currentVideo.is_received && !session && (
                                      <div
                                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer transition-opacity hover:bg-black/50"
                                        onClick={() => handleStartVideo(true)}
                                      >
                                        <div className="text-center">
                                          {isStarting ? (
                                            <Loader2 className="h-16 w-16 text-white animate-spin mx-auto" />
                                          ) : (
                                            <>
                                              <Play className="h-16 w-16 text-white mx-auto mb-2 fill-white" />
                                              <p className="text-white text-sm">{t("learning.video.click_start")}</p>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                    <div className="text-center">
                                      <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                      <p className="text-muted-foreground">{currentVideo.unlock_msg || t("learning.video.locked")}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Progress Section - 只有待观看视频显示 */}
                              {!currentVideo.is_received && (
                                session ? (
                                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground flex items-center gap-1">
                                        <Timer className="h-4 w-4" />{t("learning.video.watch_time")}
                                      </span>
                                      <span className={cn("font-mono font-medium", canComplete ? "text-green-500" : "text-foreground")}>
                                        {formatTime(elapsed)} / {formatTime(minWatchTime)}
                                      </span>
                                    </div>
                                    <Progress value={progress} className="h-3" />
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-muted-foreground">
                                        {canComplete ? t("learning.video.can_claim") : t("learning.video.keep_watching")}
                                      </p>
                                      <Badge variant="outline" className="gap-1 text-xs">
                                        <Timer className="h-3 w-3" />{t("learning.video.session_active")}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : currentVideo.can_play && (
                                  <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">{t("learning.video.click_play")}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {t("learning.video.required_time").replace("{time}", formatTime(minWatchTime))}
                                        </p>
                                      </div>
                                      <Badge variant={useBackend ? "default" : "secondary"} className="shrink-0">
                                        {useBackend ? t("learning.video.connected") : t("learning.video.offline")}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Complete Button - 只有待观看视频且有session时显示 */}
                              {!currentVideo.is_received && session && (
                                <Button className="w-full" size="lg" onClick={handleComplete} disabled={!canComplete || isCompleting}>
                                  {isCompleting ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t("learning.video.completing")}</>
                                  ) : canComplete ? (
                                    <><CheckCircle className="mr-2 h-5 w-5" />{t("learning.video.complete_earn").replace("{points}", String(currentVideo.point_reward))}</>
                                  ) : (
                                    <><Lock className="mr-2 h-5 w-5" />{t("learning.video.watch_more").replace("{time}", formatTime(minWatchTime - elapsed))}</>
                                  )}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold mb-2">{t("learning.video.no_videos")}</h3>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Video List Sidebar */}
                    <div className="lg:col-span-1">
                      <Card className="h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">{t("learning.video.course_videos")}</h3>
                            <Badge variant="outline">{completedVideos}/{videoList.length}</Badge>
                          </div>
                          <Progress value={(completedVideos / Math.max(videoList.length, 1)) * 100} className="h-2 mb-4" />
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-2">
                              {videoList.map((video, index) => (
                                <div
                                  key={video.video_id}
                                  onClick={() => handleVideoSelect(index)}
                                  className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                    index === selectedVideoIndex
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50",
                                    !video.can_play && "opacity-60"
                                  )}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                                      video.is_received
                                        ? "bg-green-500 text-white"
                                        : video.can_play
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground"
                                    )}>
                                      {video.is_received ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : video.can_play ? (
                                        index + 1
                                      ) : (
                                        <Lock className="h-3 w-3" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {video.video_name.replace('.mp4', '').replace(/_/g, ' ')}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />{formatTime(video.video_duration)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Award className="h-3 w-3" />{video.point_reward}pts
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Quiz Tab */}
                {activeTab === "quiz" && (
                  <Card><CardContent className="p-6">
                    {quizResult ? (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Trophy className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{t("learning.quiz.complete")}</h3>
                        <p className="text-4xl font-bold text-primary mb-4">{quizResult.correctCount} / {totalQuestions}</p>
                        <p className="text-muted-foreground mb-6">
                          {quizResult.correctCount >= totalQuestions * 0.8 ? t("learning.quiz.excellent") :
                           quizResult.correctCount >= totalQuestions * 0.6 ? t("learning.quiz.good") : t("learning.quiz.practice")}
                        </p>
                        <Button onClick={handleExitQuiz}>{t("learning.quiz.back")}</Button>
                      </div>
                    ) : quizSession ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{currentQuestionIndex + 1} / {totalQuestions}</Badge>
                          <Badge variant="secondary">{answeredCount} {t("learning.quiz.answered")}</Badge>
                        </div>
                        <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />

                        <div className="relative overflow-hidden min-h-[280px]">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={currentQuestionIndex}
                              initial={{ x: slideDirection === "left" ? 300 : -300, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: slideDirection === "left" ? -300 : 300, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
                              className="space-y-4"
                            >
                              <h3 className="text-lg font-medium">{quizSession.questions[currentQuestionIndex].question}</h3>
                              <div className="space-y-2">
                                {Object.entries(quizSession.questions[currentQuestionIndex].options).map(([key, value]) => {
                                  const questionId = quizSession.questions[currentQuestionIndex].question_id.toString()
                                  const isSelected = quizAnswers[questionId] === key
                                  return (
                                    <div
                                      key={key}
                                      onClick={() => handleAnswerSelect(quizSession.questions[currentQuestionIndex].question_id, key)}
                                      className={cn(
                                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all select-none",
                                        isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                      )}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className="flex-1"><span className="font-semibold mr-2">{key}.</span>{value}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                            <ChevronLeft className="mr-1 h-4 w-4" />{t("learning.quiz.previous")}
                          </Button>
                          {currentQuestionIndex < totalQuestions - 1 ? (
                            <Button onClick={handleNextQuestion}>
                              {t("common.next")}<ChevronRightIcon className="ml-1 h-4 w-4" />
                            </Button>
                          ) : (
                            <Button onClick={handleSubmitQuiz} disabled={isSubmitting || answeredCount < totalQuestions}>
                              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.loading")}</> : t("learning.quiz.submit")}
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                          {quizSession.questions.map((q, i) => (
                            <Button
                              key={q.question_id}
                              variant={quizAnswers[q.question_id.toString()] ? "default" : "outline"}
                              size="sm"
                              className={cn("w-10 h-10", i === currentQuestionIndex && "ring-2 ring-primary")}
                              onClick={() => handleQuestionJump(i)}
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{t("learning.quiz.title")}</h3>
                        <p className="text-muted-foreground mb-4">{t("learning.quiz.desc")}</p>
                        <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><FileQuestion className="h-4 w-4" />{t("learning.quiz.questions")}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{t("learning.quiz.time")}</span>
                          <span className="flex items-center gap-1"><Award className="h-4 w-4" />{t("learning.quiz.cost")}</span>
                        </div>
                        <Button size="lg" onClick={handleStartQuiz} disabled={isQuizLoading}>
                          {isQuizLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t("common.loading")}</> : <><Play className="mr-2 h-5 w-5" />{t("learning.quiz.start")}</>}
                        </Button>
                      </div>
                    )}
                  </CardContent></Card>
                )}

                {/* CTF Tab */}
                {activeTab === "ctf" && (
                  <Card><CardContent className="p-6">
                    {!isAuthenticated() ? (
                      <div className="text-center py-12">
                        <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{t("learning.ctf.wallet_required")}</h3>
                        <p className="text-muted-foreground mb-4">{t("learning.ctf.wallet_required_desc")}</p>
                      </div>
                    ) : isLoading ? (
                      <div className="flex flex-col items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mb-4" /></div>
                    ) : ctfChallenges.length === 0 ? (
                      <div className="text-center py-12"><Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-xl font-semibold">{t("learning.ctf.no_challenges")}</h3></div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold mb-2">{t("learning.ctf.title")}</h3>
                          <p className="text-sm text-muted-foreground">{t("learning.ctf.select_challenge")}</p>
                        </div>
                        {ctfChallenges.map((challenge) => {
                          const canAccess = challenge.isAvailable && isAuthenticated()
                          return (
                            <div key={challenge.id} className={cn("p-4 border rounded-lg transition-shadow", canAccess ? "hover:shadow-md" : "opacity-70")}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Flame className="h-4 w-4 text-red-500" />
                                    <h4 className="font-semibold">{challenge.title}</h4>
                                    <Badge variant="outline" className={cn("text-xs capitalize", getDifficultyStyle(challenge.difficulty))}>
                                      {challenge.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-primary font-medium"><Trophy className="h-4 w-4" />{t("learning.ctf.points").replace("{points}", String(challenge.points))}</div>
                                  </div>
                                  {canAccess ? (
                                    <Link href={`/learning/${encodeURIComponent(challenge.id)}`}>
                                      <Button size="sm">
                                        {t("learning.start")}<ArrowRight className="ml-1 h-4 w-4" />
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled className="cursor-not-allowed">
                                      <Lock className="mr-1 h-4 w-4" />{t("learning.locked")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent></Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default function LearningPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LearningContent />
    </Suspense>
  )
}
