import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div
          className={cn(
            sizes[size],
            'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600'
          )}
        />
        <div
          className={cn(
            sizes[size],
            'absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-ping'
          )}
        />
      </div>
      {text && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  )
}

// Pulse loader for content
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}

// Skeleton loader for content
export function SkeletonLoader({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          {i === 0 && <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>}
        </div>
      ))}
    </div>
  )
}