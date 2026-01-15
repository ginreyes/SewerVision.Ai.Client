'use client'

import React, { memo } from 'react'
import { Inbox, Search, FileQuestion, FolderOpen, Plus } from 'lucide-react'

/**
 * @typedef {Object} EmptyStateProps
 * @property {string} [title='No data'] - Title to display
 * @property {string} [message='No items to display'] - Description message
 * @property {React.ComponentType} [icon] - Custom icon component
 * @property {string} [variant='default'] - Visual variant ('default', 'search', 'noResults', 'folder')
 * @property {Function} [onAction] - Action button callback
 * @property {string} [actionLabel] - Label for action button
 * @property {string} [size='default'] - Size variant ('sm', 'default', 'lg')
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    container: 'py-6',
    icon: 'w-8 h-8',
    iconContainer: 'w-12 h-12',
    title: 'text-sm font-medium',
    message: 'text-xs',
    button: 'px-3 py-1.5 text-xs'
  },
  default: {
    container: 'py-12',
    icon: 'w-10 h-10',
    iconContainer: 'w-16 h-16',
    title: 'text-base font-semibold',
    message: 'text-sm',
    button: 'px-4 py-2 text-sm'
  },
  lg: {
    container: 'py-20',
    icon: 'w-14 h-14',
    iconContainer: 'w-20 h-20',
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
    icon: Inbox,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-100',
    defaultTitle: 'No Data',
    defaultMessage: 'There are no items to display at this time.'
  },
  search: {
    icon: Search,
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-50',
    defaultTitle: 'No Results',
    defaultMessage: 'No results found for your search. Try adjusting your filters.'
  },
  noResults: {
    icon: FileQuestion,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    defaultTitle: 'Nothing Found',
    defaultMessage: 'We couldn\'t find what you\'re looking for.'
  },
  folder: {
    icon: FolderOpen,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-50',
    defaultTitle: 'Empty Folder',
    defaultMessage: 'This folder is empty. Add some items to get started.'
  }
}

/**
 * Reusable Empty State Component
 * 
 * Displays a friendly message when there's no data to show.
 * Supports multiple variants and optional action button.
 * 
 * @component
 * @param {EmptyStateProps} props - Component props
 * @returns {JSX.Element} Empty state component
 * 
 * @example
 * // Basic usage
 * <EmptyState
 *   title="No Projects"
 *   message="You don't have any projects yet"
 *   onAction={() => createProject()}
 *   actionLabel="Create Project"
 * />
 * 
 * @example
 * // Search variant
 * <EmptyState
 *   variant="search"
 *   message="No detections match your filters"
 * />
 * 
 * @example
 * // Custom icon
 * <EmptyState
 *   icon={Camera}
 *   title="No Images"
 *   message="No images have been uploaded yet"
 * />
 */
const EmptyState = memo(({
  title,
  message,
  icon: CustomIcon,
  variant = 'default',
  onAction,
  actionLabel = 'Add New',
  size = 'default',
  className = ''
}) => {
  const sizeStyles = sizeConfig[size] || sizeConfig.default
  const variantStyles = variantConfig[variant] || variantConfig.default
  const Icon = CustomIcon || variantStyles.icon

  const displayTitle = title || variantStyles.defaultTitle
  const displayMessage = message || variantStyles.defaultMessage

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeStyles.container} ${className}`}>
      {/* Icon */}
      <div className={`${sizeStyles.iconContainer} ${variantStyles.bgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`${sizeStyles.icon} ${variantStyles.iconColor}`} />
      </div>

      {/* Title */}
      <h3 className={`${sizeStyles.title} text-gray-900 mb-2`}>
        {displayTitle}
      </h3>

      {/* Message */}
      <p className={`${sizeStyles.message} text-gray-500 max-w-sm mb-4`}>
        {displayMessage}
      </p>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className={`${sizeStyles.button} bg-rose-600 text-white rounded-lg hover:bg-rose-700 
                     transition-colors inline-flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
