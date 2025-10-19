import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  padding?: boolean
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', centered = false, padding = true, children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full'
    }

    const paddings = {
      true: 'px-4 sm:px-6 lg:px-8',
      false: ''
    } as const

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          sizes[size],
          centered && 'mx-auto',
          padding && paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

export { Container }