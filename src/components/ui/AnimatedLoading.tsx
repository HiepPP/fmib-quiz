import { cn } from '@/lib/utils'

interface AnimatedLoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export function AnimatedLoading({
  type = 'spinner',
  size = 'md',
  text,
  className
}: AnimatedLoadingProps) {
  const sizes = {
    sm: {
      spinner: 'w-4 h-4',
      dots: 'gap-1',
      pulse: 'w-8 h-8',
      skeleton: 'h-4'
    },
    md: {
      spinner: 'w-6 h-6',
      dots: 'gap-2',
      pulse: 'w-12 h-12',
      skeleton: 'h-4'
    },
    lg: {
      spinner: 'w-8 h-8',
      dots: 'gap-2',
      pulse: 'w-16 h-16',
      skeleton: 'h-6'
    },
    xl: {
      spinner: 'w-12 h-12',
      dots: 'gap-3',
      pulse: 'w-20 h-20',
      skeleton: 'h-8'
    }
  }

  const renderContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="relative">
            <div
              className={cn(
                'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
                sizes[size].spinner
              )}
            />
            <div
              className={cn(
                'absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-ping',
                sizes[size].spinner
              )}
            />
          </div>
        )

      case 'dots':
        return (
          <div className={cn('flex', sizes[size].dots)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div
            className={cn(
              'bg-blue-600 rounded-full animate-pulse',
              sizes[size].pulse
            )}
          />
        )

      case 'skeleton':
        return (
          <div className="space-y-3 w-full">
            <div
              className={cn(
                'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
                sizes[size].skeleton
              )}
            />
            <div
              className={cn(
                'bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4',
                sizes[size].skeleton
              )}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {renderContent()}
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
          {text}
        </p>
      )}
    </div>
  )
}

// Page transition component
export function PageTransition({
  children,
  isVisible = true
}: {
  children: React.ReactNode
  isVisible?: boolean
}) {
  return (
    <div
      className={cn(
        'transition-all duration-500 ease-in-out transform',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      )}
    >
      {children}
    </div>
  )
}

// Fade in animation component
export function FadeIn({
  children,
  delay = 0,
  duration = 'normal'
}: {
  children: React.ReactNode
  delay?: number
  duration?: 'fast' | 'normal' | 'slow'
}) {
  const durations = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  }

  return (
    <div
      className={cn(
        'animate-fade-in',
        durations[duration],
        'transition-opacity'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Slide in animation component
export function SlideIn({
  children,
  direction = 'up',
  delay = 0
}: {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
}) {
  const getAnimationClass = () => {
    switch (direction) {
      case 'up':
        return 'animate-slide-up'
      case 'down':
        return 'animate-slide-down'
      case 'left':
        return 'animate-slide-left'
      case 'right':
        return 'animate-slide-right'
      default:
        return 'animate-slide-up'
    }
  }

  return (
    <div
      className={cn(
        getAnimationClass(),
        'transition-transform'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Scale animation component
export function ScaleIn({
  children,
  delay = 0
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <div
      className="animate-scale-in transition-transform"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}