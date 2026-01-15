'use client'

import React, { memo } from 'react'
import { AlertTriangle, RefreshCw, XCircle, WifiOff, ServerCrash } from 'lucide-react'

/**
 * @typedef {Object} ErrorStateProps
 * @property {string} [message='Something went wrong'] - Error message to display
 * @property {string} [title] - Optional error title
 * @property {Function} [onRetry] - Retry callback function
 * @property {string} [retryLabel='Try Again'] - Label for retry button
 * @property {string} [size='default'] - Size variant ('sm', 'default', 'lg')
 * @property {string} [variant='default'] - Error type variant ('default', 'network', 'server', 'notFound')
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showDetails=false] - Whether to show additional error details
 * @property {string} [details] - Additional error details to show
 */

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    container: 'h-32',
    icon: 'w-6 h-6',
    title: 'text-sm font-medium',
    message: 'text-xs',
    button: 'px-3 py-1.5 text-xs'
  },
  default: {
    container: 'h-64',
    icon: 'w-8 h-8',
    title: 'text-base font-semibold',
    message: 'text-sm',
    button: 'px-4 py-2 text-sm'
  },
  lg: {
    container: 'h-96',
    icon: 'w-12 h-12',
    title: 'text-lg font-semibold',
    message: 'text-base',
    button: 'px-6 py-3 text-base'
  }
}

/**
 * Variant configurations
 */
const variantConfig = {
  default: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    defaultTitle: 'Error',
    defaultMessage: 'Something went wrong. Please try again.'
  },
  network: {
    icon: WifiOff,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    defaultTitle: 'Connection Error',
    defaultMessage: 'Unable to connect. Please check your internet connection.'
  },
  server: {
    icon: ServerCrash,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    defaultTitle: 'Server Error',
    defaultMessage: 'The server encountered an error. Please try again later.'
  },
  notFound: {
    icon: XCircle,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    defaultTitle: 'Not Found',
    defaultMessage: 'The requested resource could not be found.'
  }
}

/**
 * Reusable Error State Component
 * 
 * Displays an error message with optional retry functionality.
 * Supports multiple variants for different error types.
 * 
 * @component
 * @param {ErrorStateProps} props - Component props
 * @returns {JSX.Element} Error state component
 * 
 * @example
 * // Basic usage
 * <ErrorState
 *   message="Failed to load data"
 *   onRetry={() => refetch()}
 * />
 * 
 * @example
 * // Network error variant
 * <ErrorState
 *   variant="network"
 *   onRetry={() => refetch()}
 * />
 * 
 * @example
 * // With custom title and details
 * <ErrorState
 *   title="Authentication Failed"
 *   message="Your session has expired"
 *   showDetails={true}
 *   details="Error code: 401"
 *   onRetry={() => login()}
 *   retryLabel="Log In Again"
 * />
 */
const ErrorState = memo(({
  message,
  title,
  onRetry,
  retryLabel = 'Try Again',
  size = 'default',
  variant = 'default',
  className = '',
  showDetails = false,
  details
}) => {
  const sizeStyles = sizeConfig[size] || sizeConfig.default
  const variantStyles = variantConfig[variant] || variantConfig.default
  const Icon = variantStyles.icon

  const displayTitle = title || variantStyles.defaultTitle
  const displayMessage = message || variantStyles.defaultMessage

  return (
    <div className={`flex items-center justify-center ${sizeStyles.container} ${className}`}>
      <div className="text-center max-w-md px-4">
        {/* Icon */}
        <div className={`${variantStyles.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className={`${sizeStyles.icon} ${variantStyles.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className={`${sizeStyles.title} text-gray-900 mb-2`}>
          {displayTitle}
        </h3>

        {/* Message */}
        <p className={`${sizeStyles.message} text-gray-600 mb-4`}>
          {displayMessage}
        </p>

        {/* Details (collapsible) */}
        {showDetails && details && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-mono text-gray-500 break-all">
              {details}
            </p>
          </div>
        )}

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className={`${sizeStyles.button} bg-rose-600 text-white rounded-lg hover:bg-rose-700 
                       transition-colors inline-flex items-center gap-2`}
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
})

ErrorState.displayName = 'ErrorState'

export default ErrorState
