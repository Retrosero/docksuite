// =============================================================================
// Faz N: UI/UX Iyilestirmeleri - Loading States ve Error Boundaries
// =============================================================================

import { Component, type ReactNode } from 'react'

/**
 * Loading Skeleton Bileseni
 */
export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px' }: {
  width?: string
  height?: string
  borderRadius?: string
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="skeleton-row">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <Skeleton height="16px" width={`${70 + Math.random() * 30}%`} />
        </td>
      ))}
    </tr>
  )
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="card skeleton-card">
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="40%" />
      <Skeleton height="48px" width="100%" />
      <div className="skeleton-footer">
        <Skeleton height="32px" width="80px" />
        <Skeleton height="32px" width="80px" />
      </div>
    </div>
  )
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <div className="dashboard-card skeleton-card">
      <div className="card-header">
        <Skeleton height="20px" width="50%" />
        <Skeleton height="16px" width="30%" />
      </div>
      <Skeleton height="40px" width="80%" />
      <Skeleton height="12px" width="60%" />
    </div>
  )
}

/**
 * Error Boundary - Global Hata Yakalayici
 */
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="error-boundary">
          <div className="error-icon">!</div>
          <h2>Bir hata olustu</h2>
          <p>Lutfen sayfayi yenileyin veya yoneticinize bildirin.</p>
          {typeof window !== 'undefined' && this.state.error && (
            <pre className="error-details">{this.state.error.message}</pre>
          )}
          <button onClick={() => window.location.reload()}>Sayfayi Yenile</button>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Async Loading Wrapper
 */
interface AsyncWrapperProps {
  isLoading: boolean
  isError?: boolean
  error?: string
  skeleton?: ReactNode
  children: ReactNode
}

export function AsyncWrapper({ isLoading, isError, error, skeleton, children }: AsyncWrapperProps) {
  if (isLoading) {
    return skeleton || <div className="loading-container"><div className="spinner" /></div>
  }
  if (isError) {
    return (
      <div className="error-message">
        <span className="error-icon">X</span>
        <span>{error || 'Bir hata olustu'}</span>
      </div>
    )
  }
  return <>{children}</>
}

/**
 * Page Loading Overlay
 */
export function LoadingOverlay({ message = 'Yukleniyor...' }: { message?: string }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner-large" />
        <span>{message}</span>
      </div>
    </div>
  )
}

/**
 * Empty State Bileseni
 */
export function EmptyState({
  icon = 'O',
  title = 'Veri yok',
  description,
  action,
}: {
  icon?: string
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  )
}

/**
 * Toast Notification Bileseni
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  // Auto dismiss
  if (duration > 0) {
    setTimeout(onClose, duration)
  }
  
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: 'X',
    warning: '!',
    info: 'i',
  }
  
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>X</button>
    </div>
  )
}

// CSS for skeleton animations
export const skeletonStyles = `
@keyframes skeleton-pulse {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  display: inline-block;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`