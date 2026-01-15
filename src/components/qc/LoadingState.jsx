'use client'

import React, { memo } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * @typedef {Object} LoadingStateProps
 * @property {string} [message='Loading...'] - Loading message to display
 * @property {string} [size='default'] - Size variant ('sm', 'default', 'lg')
 * @property {string} [variant='default'] - Visual variant ('default', 'minimal', 'overlay')
 * @property {string} [className] - Additional CSS classes
 * @property {string} [spinnerColor='text-rose-600'] - Tailwind color class for spinner
 */

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    container: 'h-32',
    spinner: 'w-5 h-5',
    text: 'text-sm',
    margin: 'mb-2'
  },
  default: {
    container: 'h-64',
    spinner: 'w-8 h-8',
    text: 'text-base',
    margin: 'mb-4'
  },
  lg: {
    container: 'h-96',
    spinner: 'w-12 h-12',
    text: 'text-lg',
    margin: 'mb-6'
  }
}

/**
 * Reusable Loading State Component
 * 
 * Displays a centered loading spinner with optional message.
 * Supports multiple size variants and visual styles.
 * 
 * @component
 * @param {LoadingStateProps} props - Component props
 * @returns {JSX.Element} Loading state component
 * 
 * @example
 * // Basic usage
 * <LoadingState message="Loading dashboard data..." />
 * 
 * @example
 * // Small variant
 * <LoadingState size="sm" message="Fetching..." />
 * 
 * @example
 * // Overlay variant
 * <LoadingState variant="overlay" message="Processing..." />
 */
const LoadingState = memo(({
  message = 'Loading...',
  size = 'default',
  variant = 'default',
  className = '',
  spinnerColor = 'text-rose-600'
}) => {
  const config = sizeConfig[size] || sizeConfig.default

  // Overlay variant wraps content in a full-screen overlay
  if (variant === 'overlay') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center">
          <Loader2 className={`${config.spinner} animate-spin ${spinnerColor} ${config.margin}`} />
          <p className={`${config.text} text-gray-600`}>{message}</p>
        </div>
      </div>
    )
  }

  // Minimal variant - just spinner and text inline
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`w-4 h-4 animate-spin ${spinnerColor}`} />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
    )
  }

  // Default centered loading state
  return (
    <div className={`flex items-center justify-center ${config.container} ${className}`}>
      <div className="text-center">
        <Loader2 className={`${config.spinner} animate-spin ${spinnerColor} mx-auto ${config.margin}`} />
        <p className={`${config.text} text-gray-600`}>{message}</p>
      </div>
    </div>
  )
})

LoadingState.displayName = 'LoadingState'

export default LoadingState
