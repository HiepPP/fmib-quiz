import { UserInfo, QuizResult } from '@/types/quiz'

interface QuizResultsProps {
  userInfo: UserInfo | null
  quizResult: QuizResult | null
  submitError: string | null
  isTimerExpired: boolean
  onRestartQuiz: () => void
  onGoHome: () => void
}

export default function QuizResults({
  userInfo,
  quizResult,
  submitError,
  isTimerExpired,
  onRestartQuiz,
  onGoHome
}: QuizResultsProps) {
  // Helper functions for performance feedback
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

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const percentage = quizResult?.summary?.percentage || 0
  const scoreColor = getScoreColor(percentage)

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Status Banner */}
      <div className={`rounded-lg border-2 p-6 mb-6 text-center ${
        submitError
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          : isTimerExpired
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center justify-center space-x-3 mb-2">
          {submitError ? (
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : isTimerExpired ? (
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {submitError ? 'Quiz Completed (with errors)' :
             isTimerExpired ? 'Time Expired!' : 'Quiz Completed!'}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {submitError
            ? 'Your quiz was completed but there was an error submitting to the server.'
            : isTimerExpired
              ? 'Your quiz was automatically submitted when the time ran out.'
              : 'Your quiz has been successfully submitted!'
          }
        </p>
      </div>

      {/* Main Results Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Final Score
            </h3>

            {/* Circular Score Display */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                    className={scoreColor}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${scoreColor}`}>
                      {percentage}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {quizResult?.summary?.score || 0}/{quizResult?.summary?.totalQuestions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {getPerformanceMessage(percentage)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getPerformanceAdvice(percentage)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quiz Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quizResult?.summary?.totalQuestions || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {quizResult?.summary?.correctAnswers || 0}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Correct</p>
              </div>

              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {quizResult?.summary?.incorrectAnswers || 0}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">Incorrect</p>
              </div>

              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(quizResult?.summary?.timeSpent || 0)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Time</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          {userInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Student Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userInfo.studentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Class Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userInfo.classNumber}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed at: {new Date(quizResult?.summary?.completedAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Error Details (if any) */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium text-sm mb-1">
                    Submission Error Details
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {submitError}
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                    Your quiz results have been saved locally. Please contact support if this issue persists.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestartQuiz}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Take Quiz Again</span>
        </button>

        <button
          onClick={onGoHome}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Go Home</span>
        </button>
      </div>
    </div>
  )
}