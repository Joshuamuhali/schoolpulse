import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingCardProps {
  title?: string
  lines?: number
  className?: string
}

export function LoadingCard({ title, lines = 3, className }: LoadingCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      {title && (
        <div className="mb-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
      )}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              {i === 0 && <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4">
              {[...Array(columns)].map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn(
                    'h-4 animate-pulse rounded bg-muted',
                    colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-20' : 'w-24'
                  )} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface LoadingPageProps {
  title?: string
  subtitle?: string
  className?: string
}

export function LoadingPage({ title, subtitle, className }: LoadingPageProps) {
  return (
    <div className={cn('flex items-center justify-center min-h-64', className)}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        {title && <h3 className="text-lg font-medium">{title}</h3>}
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-64 text-center p-8', className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  error?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An error occurred while loading the data', 
  error,
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-64 text-center p-8', className)}>
      <div className="mb-4 text-destructive">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 rounded-md">
          <p className="text-xs text-destructive font-mono">{error}</p>
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
