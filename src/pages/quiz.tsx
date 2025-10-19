import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import UserInfoForm from '@/components/quiz/UserInfoForm'
import QuestionDisplay from '@/components/quiz/QuestionDisplay'
import QuizTimer from '@/components/quiz/QuizTimer'
import EnhancedQuizTimer from '@/components/quiz/EnhancedQuizTimer'
import QuizResults from '@/components/quiz/QuizResults'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { AnimatedLoading, PageTransition, FadeIn, SlideIn } from '@/components/ui/AnimatedLoading'
import { UserInfo, QuizSession, Question, QuizAnswer } from '@/types/quiz'
import { storage, isSessionExpired } from '@/lib/storage'
import { quizService } from '@/lib/quizService'

type QuizStep = 'info' | 'quiz' | 'results'

// Helper functions for performance feedback (temporary until QuizResults component is integrated)
const getPerformanceMessage = (percentage: number): string => {
  if (percentage >= 90) return 'Outstanding Performance! 🎉'
  if (percentage >= 80) return 'Excellent Work! 🌟'
  if (percentage >= 70) return 'Good Job! 👍'
  if (percentage >= 60) return 'Nice Effort! 💪'
  if (percentage >= 50) return 'Keep Practicing! 📚'
  return 'Room for Improvement! 🎯'
}

const getPerformanceAdvice = (percentage: number): string => {
  if (percentage >= 80) return 'You have mastered this material!'
  if (percentage >= 70) return 'You have a good understanding of the material.'
  if (percentage >= 60) return 'Review the areas where you struggled.'
  if (percentage >= 50) return 'Consider spending more time studying.'
  return 'Don\'t give up! Practice makes perfect.'
}

const QuizPage: NextPage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<QuizStep>('info')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = storage.getQuizSession()
    const savedQuestions = storage.getQuestions()

    if (savedQuestions.length === 0) {
      setError('No quiz questions available. Please contact the administrator.')
      setIsLoading(false)
      return
    }

    setQuestions(savedQuestions)

    if (existingSession && !existingSession.isCompleted && !isSessionExpired(existingSession.startTime)) {
      // Resume existing session
      setUserInfo(existingSession.userInfo)
      setCurrentQuestionIndex(existingSession.currentQuestionIndex)
      setSessionStartTime(existingSession.startTime)
      setCurrentStep('quiz')
    } else if (existingSession && existingSession.isCompleted) {
      // Show completed results
      setUserInfo(existingSession.userInfo)
      setCurrentStep('results')
    } else if (existingSession && isSessionExpired(existingSession.startTime)) {
      // Clear expired session
      storage.clearQuizSession()
    }

    setIsLoading(false)
  }, [])

  // Get current selected answer from localStorage
  const getCurrentSelectedAnswer = useCallback((): string | null => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return null
    const currentQuestion = questions[currentQuestionIndex]
    const userAnswers = storage.getUserAnswers()
    const answer = userAnswers.find(a => a.questionId === currentQuestion.id)
    return answer?.answerId || null
  }, [questions, currentQuestionIndex])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answerId: string) => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return

    const currentQuestion = questions[currentQuestionIndex]
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      answerId
    }

    storage.saveUserAnswer(answer)
  }, [questions, currentQuestionIndex])

  // Handle next question
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)

      // Update session
      const session = storage.getQuizSession()
      if (session) {
        const updatedSession = { ...session, currentQuestionIndex: nextIndex }
        storage.saveQuizSession(updatedSession)
      }
    } else {
      // Last question, finish quiz
      handleFinishQuiz()
    }
  }, [currentQuestionIndex, questions.length])

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)

      // Update session
      const session = storage.getQuizSession()
      if (session) {
        const updatedSession = { ...session, currentQuestionIndex: prevIndex }
        storage.saveQuizSession(updatedSession)
      }
    }
  }, [currentQuestionIndex])

  // Handle quiz completion
  const handleFinishQuiz = useCallback(async () => {
    const session = storage.getQuizSession()
    if (!session || !userInfo) {
      setCurrentStep('results')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const userAnswers = storage.getUserAnswers()
      const submissionData = {
        userInfo,
        answers: userAnswers,
        startTime: session.startTime,
        endTime: Date.now(),
        timeExpired: isTimerExpired
      }

      // Validate submission data
      const validation = quizService.validateSubmission(submissionData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Submit to API (or fallback to simulation)
      const response = await quizService.submitQuiz(submissionData)

      if (response.success) {
        setQuizResult(response.data)
        const completedSession = { ...session, isCompleted: true }
        storage.saveQuizSession(completedSession)
        setCurrentStep('results')
      } else {
        throw new Error(response.error || 'Failed to submit quiz')
      }
    } catch (error) {
      console.error('Quiz submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quiz')

      // Still complete the quiz even if API fails
      const completedSession = { ...session, isCompleted: true }
      storage.saveQuizSession(completedSession)
      setCurrentStep('results')
    } finally {
      setIsSubmitting(false)
    }
  }, [userInfo, isTimerExpired])

  // Handle timer expiration
  const handleTimeExpire = useCallback(() => {
    setIsTimerExpired(true)
    handleFinishQuiz()
  }, [handleFinishQuiz])

  // Handle timer tick
  const handleTimerTick = useCallback((remainingTime: number) => {
    setTimeRemaining(remainingTime)
  }, [])

  const handleUserInfoSubmit = (submittedUserInfo: UserInfo) => {
    const startTime = Date.now()
    setSessionStartTime(startTime)
    setUserInfo(submittedUserInfo)
    setCurrentQuestionIndex(0)
    setCurrentStep('quiz')
    setTimeRemaining(600) // Reset timer to 10 minutes
  }

  const handleRestartQuiz = useCallback(() => {
    // Clear all quiz-related data from localStorage
    storage.clearQuizSession()
    storage.clearUserAnswers()

    // Reset all state variables
    setUserInfo(null)
    setCurrentQuestionIndex(0)
    setTimeRemaining(600) // Reset timer to 10 minutes
    setIsTimerExpired(false)
    setIsSubmitting(false)
    setSubmitError(null)
    setQuizResult(null)
    setSessionStartTime(null)
    setError(null)

    // Reset to info step
    setCurrentStep('info')

    // Optional: Clear any cached quiz data if needed
    // storage.clearQuestions() // Uncomment if you want to reset questions too
  }, [])

  const handleGoHome = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>FMIB Quiz - Loading</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <PageTransition>
              <Card variant="ghost" className="max-w-md mx-auto">
                <CardContent className="text-center p-8">
                  <AnimatedLoading
                    type="dots"
                    size="lg"
                    text="Loading quiz..."
                    className="mb-4"
                  />
                  <FadeIn delay={300}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Preparing your quiz experience...
                    </p>
                  </FadeIn>
                </CardContent>
              </Card>
            </PageTransition>
          </div>
        </Layout>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>FMIB Quiz - Error</title>
        </Head>
        <Layout title="FMIB Quiz">
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <PageTransition>
              <div className="max-w-md mx-auto w-full px-4">
                <SlideIn direction="up" delay={100}>
                  <Alert variant="error" title="Quiz Not Available" className="mb-6">
                    {error}
                  </Alert>
                </SlideIn>
                <SlideIn direction="up" delay={200}>
                  <div className="flex justify-center">
                    <Button onClick={handleGoHome} variant="primary" size="lg">
                      Go Home
                    </Button>
                  </div>
                </SlideIn>
              </div>
            </PageTransition>
          </div>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{currentStep === 'info' ? 'FMIB Quiz - Start' : currentStep === 'quiz' ? 'FMIB Quiz - In Progress' : 'FMIB Quiz - Results'}</title>
        <meta name="description" content="Take the FMIB quiz" />
      </Head>

      <Layout title="FMIB Quiz">
        <PageTransition>
          <div className="flex-1 py-4 sm:py-6 lg:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              {/* Header */}
              <header className="text-center mb-6 sm:mb-8 lg:mb-10" role="banner">
                <FadeIn>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    FMIB Quiz
                  </h1>
                  {userInfo && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Welcome, <span className="font-medium" aria-label={`User name: ${userInfo.name}`}>{userInfo.name}</span>
                    </p>
                  )}
                </FadeIn>
              </header>

              {/* Step content */}
              <FadeIn delay={200}>
                {currentStep === 'info' && (
                  <UserInfoForm onSubmit={handleUserInfoSubmit} />
                )}
              </FadeIn>

            <FadeIn delay={200}>
                {currentStep === 'quiz' && (
                  <div>
                    <main className="max-w-4xl mx-auto" role="main">
                {/* Enhanced Timer */}
                {sessionStartTime && (
                  <div className="mb-4 sm:mb-6">
                    <SlideIn direction="down" delay={100}>
                      <EnhancedQuizTimer
                        startTime={sessionStartTime}
                        onTimeExpire={handleTimeExpire}
                        onTick={handleTimerTick}
                        isPaused={false}
                      />
                    </SlideIn>
                  </div>
                )}

                {/* Question Display */}
                {questions.length > 0 && currentQuestionIndex < questions.length && (
                  <SlideIn direction="up" delay={200}>
                    <QuestionDisplay
                      question={questions[currentQuestionIndex]}
                      questions={questions}
                      questionNumber={currentQuestionIndex + 1}
                      totalQuestions={questions.length}
                      selectedAnswer={getCurrentSelectedAnswer()}
                      onAnswerSelect={handleAnswerSelect}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      canGoNext={true}
                      canGoPrevious={currentQuestionIndex > 0}
                      isLastQuestion={currentQuestionIndex === questions.length - 1}
                      timeRemaining={timeRemaining}
                    />
                  </SlideIn>
                )}

                {/* Submitting Overlay */}
                {isSubmitting && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="submitting-title"
                    aria-describedby="submitting-description"
                  >
                    <ScaleIn>
                      <Card variant="elevated" className="max-w-sm w-full mx-4 shadow-2xl">
                        <CardContent className="text-center p-6">
                          <h2 id="submitting-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {isTimerExpired ? 'Time expired! Submitting quiz...' : 'Submitting quiz...'}
                          </h2>
                          <AnimatedLoading
                            type="spinner"
                            size="lg"
                            className="my-4"
                          />
                          <p id="submitting-description" className="text-sm text-gray-600 dark:text-gray-400">
                            Please don't close this window
                          </p>
                        </CardContent>
                      </Card>
                    </ScaleIn>
                  </div>
                )}

                {/* Submit Error Alert */}
                {submitError && (
                  <div className="mt-6 max-w-md mx-auto">
                    <SlideIn direction="up">
                      <Alert variant="error" title="Submission Error">
                        <div className="space-y-2">
                          <p className="text-sm">
                            {submitError}
                          </p>
                          <p className="text-xs opacity-80">
                            Your quiz has been saved locally. You can try again or contact support.
                          </p>
                        </div>
                      </Alert>
                    </SlideIn>
                  </div>
                )}

                {/* End Quiz Button */}
                {!isSubmitting && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleRestartQuiz}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      End Quiz Early
                    </Button>
                  </div>
                )}
                    </main>
                  </div>
                )}
            </FadeIn>

            <FadeIn delay={300}>
              {currentStep === 'results' && (
                <div className="max-w-2xl mx-auto">
                  <SlideIn direction="up" delay={100}>
                    <Card variant="elevated">
                      <CardContent className="p-6">
                        <div className="text-center py-12">
                      {/* Timer Expired Warning */}
                      {isTimerExpired && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center justify-center space-x-3">
                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                              Quiz automatically submitted due to time limit
                            </p>
                          </div>
                        </div>
                      )}

                      <svg className={`w-16 h-16 ${isTimerExpired ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isTimerExpired ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {submitError ? 'Quiz Completed (with errors)' :
                         isTimerExpired ? 'Time Expired!' : 'Quiz Completed!'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {submitError
                          ? 'Your quiz was completed but there was an error submitting to the server.'
                          : isTimerExpired
                            ? 'Your quiz was automatically submitted when the time ran out.'
                            : 'Your quiz has been successfully submitted!'
                        }
                      </p>

                      {/* Quiz Results */}
                      {quizResult && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Quiz Results
                          </h3>

                          {/* Score Display */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-blue-200 dark:border-blue-800">
                              <div>
                                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                  {quizResult.summary?.percentage || 0}%
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  Score
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Statistics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {quizResult.summary?.totalQuestions || 0}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Questions
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {quizResult.summary?.correctAnswers || 0}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Correct
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {quizResult.summary?.incorrectAnswers || 0}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Incorrect
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Math.floor((quizResult.summary?.timeSpent || 0) / 60)}:
                                {String((quizResult.summary?.timeSpent || 0) % 60).padStart(2, '0')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Time Spent
                              </p>
                            </div>
                          </div>

                          {/* Performance Message */}
                          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {getPerformanceMessage(quizResult.summary?.percentage || 0)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getPerformanceAdvice(quizResult.summary?.percentage || 0)}
                            </p>
                          </div>
                        </div>
                      )}

                      {userInfo && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Quiz Information:</h3>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p><strong>Name:</strong> {userInfo.name}</p>
                            <p><strong>Student Number:</strong> {userInfo.studentNumber}</p>
                            <p><strong>Class Number:</strong> {userInfo.classNumber}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-4 justify-center">
                        <button
                          onClick={handleRestartQuiz}
                          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Take Quiz Again
                        </button>
                        <button
                          onClick={handleGoHome}
                          className="px-6 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
              </CardContent>
            </Card>
              </SlideIn>
            </div>
            )}
            </FadeIn>
          </div>
        </div>
    </PageTransition>
  </Layout>
    </>
  )
}

export default QuizPage