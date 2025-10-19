import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
  label?: string
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = 'md', color = 'blue', showLabel = false, label, ...props }, ref) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100)

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colors = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      fill: 'bg-blue-600',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      fill: 'bg-green-600',
      text: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      fill: 'bg-yellow-600',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      fill: 'bg-red-600',
      text: 'text-red-600 dark:text-red-400'
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          <span className={cn('text-sm font-medium', colors[color].text)}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        colors[color].bg,
        sizes[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            colors[color].fill
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
})

Progress.displayName = 'Progress'

export { Progress }