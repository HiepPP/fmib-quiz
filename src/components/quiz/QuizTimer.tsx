import { useState, useEffect, useCallback } from 'react'
import { getRemainingTime, isSessionExpired } from '@/lib/storage'

interface QuizTimerProps {
  startTime: number
  onTimeExpire: () => void
  onTick?: (remainingTime: number) => void
}

export default function QuizTimer({ startTime, onTimeExpire, onTick }: QuizTimerProps) {
  const [remainingTime, setRemainingTime] = useState(() => getRemainingTime(startTime))
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Check if already expired
    if (isSessionExpired(startTime)) {
      setIsExpired(true)
      onTimeExpire()
      return
    }

    const interval = setInterval(() => {
      const newRemainingTime = getRemainingTime(startTime)
      setRemainingTime(newRemainingTime)

      if (onTick) {
        onTick(newRemainingTime)
      }

      if (newRemainingTime <= 0) {
        setIsExpired(true)
        clearInterval(interval)
        onTimeExpire()
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [startTime, onTimeExpire, onTick])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const getTimeColor = useCallback((): string => {
    if (remainingTime <= 60) return 'text-red-600 dark:text-red-400'
    if (remainingTime <= 180) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }, [remainingTime])

  if (isExpired) {
    return null
  }

  return (
    <div className={`flex items-center justify-center ${getTimeColor()}`}>
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-mono font-semibold text-lg">
          {formatTime(remainingTime)}
        </span>
      </div>
    </div>
  )
}