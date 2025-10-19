import { useState, useEffect } from 'react'
import { Question } from '@/types/quiz'
import { storage } from '@/lib/storage'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Progress } from '@/components/ui/Progress'

interface QuestionDisplayProps {
  question: Question
  questions: Question[]
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string | null
  onAnswerSelect: (answerId: string) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastQuestion: boolean
  timeRemaining: number
}

export default function QuestionDisplay({
  question,
  questions,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  timeRemaining
}: QuestionDisplayProps) {
  const [error, setError] = useState<string | null>(null)

  // Clear error when answer is selected
  useEffect(() => {
    if (selectedAnswer) {
      setError(null)
    }
  }, [selectedAnswer])

  const handleNext = () => {
    if (!selectedAnswer) {
      setError('Please select an answer before continuing')
      return
    }
    onNext()
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeColor = (): string => {
    if (timeRemaining <= 60) return 'text-red-600 dark:text-red-400'
    if (timeRemaining <= 180) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
      {/* Timer and Progress */}
      <div className="space-y-4">
        {/* Timer */}
        <div className={`flex items-center justify-center ${getTimeColor()}`}
             role="timer"
             aria-live="polite"
             aria-label={`Time remaining: ${formatTime(timeRemaining)}`}>
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-semibold text-base sm:text-lg">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card variant="outline">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
            <Progress
              value={questionNumber}
              max={totalQuestions}
              size="sm"
              color="blue"
              showLabel={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-800 dark:text-blue-200 font-bold text-xs sm:text-sm">
                {questionNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed pr-2">
                {question.question}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                Select one answer below
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>

          {/* Answer Options */}
          <div className="space-y-3 mb-6 sm:mb-8">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === answer.id
              const letter = String.fromCharCode(65 + index) // A, B, C, D

              return (
                <div
                  key={answer.id}
                  className={`relative cursor-pointer transition-all duration-200 rounded-lg ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                      : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-2 dark:hover:ring-gray-600 dark:hover:ring-offset-gray-800'
                  }`}
                >
                  <label className="block cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={answer.id}
                      checked={isSelected}
                      onChange={() => onAnswerSelect(answer.id)}
                      className="sr-only"
                      aria-describedby={`answer-${answer.id}`}
                      aria-pressed={isSelected}
                    />
                    <div
                      className={`p-3 sm:p-4 border-2 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <span className="text-sm font-medium">{letter}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            id={`answer-${answer.id}`}
                            className={`text-sm sm:text-base leading-relaxed break-words ${
                              isSelected
                                ? 'text-gray-900 dark:text-white font-medium'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {answer.text}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              )
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <Alert variant="error">
                {error}
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              variant="outline"
              size="lg"
              className="order-2 sm:order-1"
              aria-label="Go to previous question"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>

            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-1 sm:order-2" role="note">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Answer required to continue</span>
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              variant={isLastQuestion ? "success" : "primary"}
              size="lg"
              className="order-3"
              aria-label={isLastQuestion ? "Finish quiz" : "Go to next question"}
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next'}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLastQuestion ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation (Quick Jump) */}
      {totalQuestions > 1 && (
        <Card variant="outline">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
              const isCurrent = num === questionNumber
              const isAnswered = storage.getUserAnswers().some(answer =>
                questions[num - 1] && answer.questionId === questions[num - 1].id
              )

              return (
                <button
                  key={num}
                  disabled={isCurrent}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white cursor-default'
                      : isAnswered
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={`Go to question ${num}${isAnswered ? ' (answered)' : ''}`}
                  aria-label={`Question ${num}${isAnswered ? ' - answered' : ''}${isCurrent ? ' - current question' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {num}
                </button>
              )
            })}
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}