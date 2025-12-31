"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Terminal,
  Clock,
  Flag,
  ArrowLeft,
  Zap,
  Code,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Rocket,
  Play,
  FileQuestion,
  Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  getAllFields,
  createField,
  shutdownField,
  checkFlag,
  getRunningFieldForUser,
  getChallengeQuestions,
  submitChallengeAnswers,
  isAuthenticated
} from "@/api"
import { FieldInfo, RunningFieldResponse, ChallengeType, ChallengeQuestion } from "@/api/types"

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [fieldInfo, setFieldInfo] = useState<FieldInfo | null>(null)
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [targetUrl, setTargetUrl] = useState<string | null>(null)
  const [targetPort, setTargetPort] = useState<string | null>(null)
  const [flagInput, setFlagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [runningField, setRunningField] = useState<RunningFieldResponse | null>(null)

  // Quiz state
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizTimeLimit, setQuizTimeLimit] = useState<number>(0)
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Decode field name from URL
  const decodedFieldName = decodeURIComponent(id)

  // Determine challenge type (default to CTF if not specified)
  const challengeType = fieldInfo?.challenge_type || ChallengeType.CTF

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })

    // Get field information
    const fetchFieldInfo = async () => {
      try {
        const fields = await getAllFields()
        const field = fields.find((f) => f.field_name === decodedFieldName)
        if (field) {
          setFieldInfo(field)

          // If it's a quiz type, fetch questions
          if (field.challenge_type === ChallengeType.QUIZ) {
            fetchQuizQuestions()
          }
        } else {
          setError("Field not found")
        }
      } catch (err) {
        setError("Failed to get field information")
        console.error("Failed to get field information:", err)
      }
    }

    // Check for running field
    const checkRunningField = async () => {
      if (!isAuthenticated()) return

      try {
        const running = await getRunningFieldForUser()
        if (running && running.field_name === decodedFieldName) {
          setRunningField(running)
          setFieldId(running.field_id)

          if (running.field_url) {
            parseFieldUrl(running.field_url)
          }
        }
      } catch (err) {
        console.log("No running field")
      }
    }

    fetchFieldInfo()
    checkRunningField()
  }, [decodedFieldName])

  const parseFieldUrl = (url: string) => {
    try {
      // 如果 URL 已经包含协议，直接解析
      const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`)
      // 保留完整路径（包含 /challenge/{id}/）
      setTargetUrl(`${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`)
      setTargetPort(urlObj.port || '')
    } catch {
      // 如果解析失败，使用原始 URL
      setTargetUrl(url)
      setTargetPort('')
    }
  }

  const fetchQuizQuestions = async () => {
    try {
      const result = await getChallengeQuestions(decodedFieldName)
      setQuestions(result.questions)
      setQuizTimeLimit(result.timeLimit)
      setQuizStartTime(Date.now())
    } catch (err) {
      console.error("Failed to fetch quiz questions:", err)
    }
  }

  // ============ CTF Functions ============

  const launchChallenge = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Please connect wallet",
        description: "You need to connect your wallet to start a challenge",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await createField(decodedFieldName)
      setFieldId(response.field_id)

      if (response.field_url) {
        parseFieldUrl(response.field_url)
      }

      toast({
        title: "Field launched!",
        description: "Challenge environment is ready",
      })
    } catch (err: any) {
      toast({
        title: "Failed to launch",
        description: err.message || "Failed to launch field",
        variant: "destructive",
      })
      console.error("Failed to launch field:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flagInput.trim()) {
      toast({
        title: "Enter flag",
        description: "Please enter a flag to submit",
        variant: "destructive",
      })
      return
    }

    if (!fieldId) {
      toast({
        title: "Launch field first",
        description: "Please launch the field before submitting a flag",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await checkFlag(fieldId, flagInput)

      if (result.status === "success") {
        setShowSuccess(true)
        toast({
          title: "Correct flag!",
          description: "Challenge completed successfully",
        })

        // Auto shutdown after successful flag submission
        await shutdownField(fieldId)

        setTimeout(() => {
          setShowSuccess(false)
          router.push("/learning")
        }, 3000)
      } else if (result.message.includes("already passed")) {
        toast({
          title: "Already completed",
          description: result.message,
        })
      } else {
        toast({
          title: "Incorrect flag",
          description: result.message || "Try again",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Submit failed",
        description: err.message || "Failed to submit flag",
        variant: "destructive",
      })
      console.error("Failed to submit flag:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleShutdown = async () => {
    if (!fieldId) return

    try {
      setLoading(true)
      await shutdownField(fieldId)
      toast({
        title: "Field shutdown",
        description: "Challenge environment has been shutdown",
      })
      setFieldId(null)
      setTargetUrl(null)
      setTargetPort(null)
      setRunningField(null)
    } catch (err: any) {
      toast({
        title: "Shutdown failed",
        description: err.message || "Failed to shutdown field",
        variant: "destructive",
      })
      console.error("Failed to shutdown field:", err)
    } finally {
      setLoading(false)
    }
  }

  // ============ Quiz Functions ============

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitQuiz = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Please connect wallet",
        description: "You need to connect your wallet to submit answers",
        variant: "destructive",
      })
      return
    }

    const answeredCount = Object.keys(answers).length
    if (answeredCount < questions.length) {
      toast({
        title: "Incomplete",
        description: `Please answer all ${questions.length} questions (${answeredCount} answered)`,
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const answerArray = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }))

      const result = await submitChallengeAnswers(answerArray)
      setQuizSubmitted(true)

      toast({
        title: "Quiz submitted!",
        description: `You got ${result.correct_count}/${result.total_count} correct and earned ${result.points_earned} points!`,
      })

      setTimeout(() => {
        router.push("/learning")
      }, 3000)
    } catch (err: any) {
      toast({
        title: "Submit failed",
        description: err.message || "Failed to submit quiz",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ============ Render Functions ============

  const renderCTFContent = () => (
    <>
      {/* Contract Code */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Contract Code
        </h3>
        <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
          <code>{fieldInfo?.code || "// Contract code will be displayed here"}</code>
        </pre>
      </div>

      {/* Hints */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Hints</h3>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          {fieldInfo?.hints?.map((hint, index) => (
            <li key={index}>{hint}</li>
          )) || <li>No hints available</li>}
        </ul>
      </div>

      {/* Field Access Information */}
      {targetUrl && (
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Terminal className="w-5 h-5 mr-2" />
            Field Access Information
          </h3>
          <div className="bg-secondary p-4 rounded-md">
            <div className="mb-2">
              <span className="text-muted-foreground">URL: </span>
              <code className="text-primary">{targetUrl}</code>
            </div>
            {targetPort && (
              <div>
                <span className="text-muted-foreground">Port: </span>
                <code className="text-primary">{targetPort}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )

  const renderQuizContent = () => (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      ) : (
        questions.map((question, index) => (
          <Card key={question.question_id}>
            <CardHeader>
              <CardTitle className="text-base">
                Question {index + 1}
              </CardTitle>
              <CardDescription>{question.question}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.question_id] || ""}
                onValueChange={(value) => handleAnswerChange(question.question_id, value)}
                disabled={quizSubmitted}
              >
                {Object.entries(question.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`${question.question_id}-${key}`} />
                    <Label htmlFor={`${question.question_id}-${key}`} className="cursor-pointer">
                      {key}. {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  const renderVideoContent = () => (
    <div className="space-y-6">
      {fieldInfo?.video_url ? (
        <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
          <video
            src={fieldInfo.video_url}
            controls
            className="w-full h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Video not available</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground">{fieldInfo?.description}</p>
      </div>
    </div>
  )

  const renderSidebar = () => (
    <div className="space-y-6">
      {/* Challenge Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Challenge Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline">
              {challengeType === ChallengeType.CTF && "CTF"}
              {challengeType === ChallengeType.QUIZ && "Quiz"}
              {challengeType === ChallengeType.VIDEO && "Video"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost:</span>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-1 text-yellow-500" />
              <span>{fieldInfo?.cost || 0} points</span>
            </div>
          </div>
          {fieldInfo?.difficulty && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="text-amber-500">{fieldInfo.difficulty}</span>
            </div>
          )}
        </CardContent>

        {/* CTF Actions */}
        {challengeType === ChallengeType.CTF && (
          <CardFooter className="flex flex-col gap-2">
            {fieldId || runningField ? (
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleShutdown}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Terminal className="w-4 h-4 mr-2" />
                )}
                Shutdown Field
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={launchChallenge}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Launch Field
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* CTF Flag Submit */}
      {challengeType === ChallengeType.CTF && (fieldId || runningField) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Submit Flag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFlag} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter flag (e.g., flag{...})"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Flag className="w-4 h-4 mr-2" />
                )}
                Submit Flag
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quiz Submit */}
      {challengeType === ChallengeType.QUIZ && !quizSubmitted && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Quiz</CardTitle>
            <CardDescription>
              {Object.keys(answers).length}/{questions.length} answered
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmitQuiz}
              disabled={loading || Object.keys(answers).length < questions.length}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Submit Answers
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )

  // ============ Main Render ============

  if (!fieldInfo && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive text-xl mb-4">Error: {error}</p>
        <Button variant="outline" onClick={() => router.push("/learning")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-background transition-all duration-700 ease-out"
      style={{
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        opacity: mounted ? 1 : 0,
      }}
    >
      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Challenge Completed!</h2>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-background/80 border-b">
        <Link href="/learning" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Challenges</span>
        </Link>

        <div className="flex items-center space-x-2">
          {challengeType === ChallengeType.CTF && <Shield className="w-6 h-6 text-primary" />}
          {challengeType === ChallengeType.QUIZ && <FileQuestion className="w-6 h-6 text-primary" />}
          {challengeType === ChallengeType.VIDEO && <Video className="w-6 h-6 text-primary" />}
          <span className="font-medium">
            {challengeType === ChallengeType.CTF && "CTF Challenge"}
            {challengeType === ChallengeType.QUIZ && "Quiz Challenge"}
            {challengeType === ChallengeType.VIDEO && "Video Learning"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{fieldInfo?.field_name}</CardTitle>
                    <CardDescription className="mt-2">
                      {fieldInfo?.description || "No description available"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{fieldInfo?.cost} Points</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {challengeType === ChallengeType.CTF && renderCTFContent()}
                {challengeType === ChallengeType.QUIZ && renderQuizContent()}
                {challengeType === ChallengeType.VIDEO && renderVideoContent()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          {renderSidebar()}
        </div>
      </main>
    </div>
  )
}
