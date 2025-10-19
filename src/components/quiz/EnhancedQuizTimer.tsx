import { useState, useEffect, useCallback } from 'react'
import { getRemainingTime, isSessionExpired } from '@/lib/storage'

interface EnhancedQuizTimerProps {
  startTime: number
  onTimeExpire: () => void
  onTick?: (remainingTime: number) => void
  isPaused?: boolean
  className?: string
}

export default function EnhancedQuizTimer({
  startTime,
  onTimeExpire,
  onTick,
  isPaused = false,
  className = ""
}: EnhancedQuizTimerProps) {
  const [remainingTime, setRemainingTime] = useState(() => getRemainingTime(startTime))
  const [isExpired, setIsExpired] = useState(false)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    // Check if already expired
    if (isSessionExpired(startTime)) {
      setIsExpired(true)
      onTimeExpire()
      return
    }

    const interval = setInterval(() => {
      if (!isPaused) {
        const newRemainingTime = getRemainingTime(startTime)
        setRemainingTime(newRemainingTime)

        // Set warning state when less than 2 minutes
        setIsWarning(newRemainingTime <= 120)

        if (onTick) {
          onTick(newRemainingTime)
        }

        if (newRemainingTime <= 0) {
          setIsExpired(true)
          setIsWarning(false)
          clearInterval(interval)
          onTimeExpire()
        }
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [startTime, onTimeExpire, onTick, isPaused])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const getTimerStyles = useCallback(() => {
    if (remainingTime <= 30) {
      return {
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        borderColor: 'border-red-300 dark:border-red-700',
        textColor: 'text-red-700 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400',
        pulseAnimation: true
      }
    } else if (remainingTime <= 120) {
      return {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        pulseAnimation: false
      }
    } else {
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        borderColor: 'border-green-300 dark:border-green-700',
        textColor: 'text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
        pulseAnimation: false
      }
    }
  }, [remainingTime])

  const getTimePercentage = useCallback(() => {
    const totalTime = 10 * 60 // 10 minutes in seconds
    return (remainingTime / totalTime) * 100
  }, [remainingTime])

  if (isExpired) {
    return null
  }

  const styles = getTimerStyles()

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Main Timer Display */}
      <div className={`${styles.bgColor} ${styles.borderColor} border-2 rounded-xl p-4 shadow-lg transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`relative ${styles.pulseAnimation ? 'animate-pulse' : ''}`}>
              <svg
                className={`w-6 h-6 ${styles.iconColor} ${isPaused ? 'animate-spin-slow' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isPaused ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {isWarning && !isPaused && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              )}
            </div>
            <div>
              <div className={`text-2xl font-bold ${styles.textColor} font-mono`}>
                {formatTime(remainingTime)}
              </div>
              <div className={`text-xs ${styles.textColor} opacity-75`}>
                {remainingTime <= 30 ? 'Time almost up!' : remainingTime <= 120 ? 'Hurry up!' : 'Time remaining'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm font-medium ${styles.textColor}`}>
              {Math.ceil(remainingTime / 60)} min
            </div>
            <div className={`text-xs ${styles.textColor} opacity-75`}>
              {Math.floor((remainingTime % 60))} sec
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                remainingTime <= 30
                  ? 'bg-red-500'
                  : remainingTime <= 120
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${getTimePercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {remainingTime <= 60 && remainingTime > 0 && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              {remainingTime <= 10
                ? `Quiz will auto-submit in ${remainingTime} seconds!`
                : 'Less than 1 minute remaining! Complete your answers quickly.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}