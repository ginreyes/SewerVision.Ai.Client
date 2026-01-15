'use client'

import React, { memo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * @typedef {Object} StatsCardProps
 * @property {React.ComponentType} icon - Lucide icon component to display
 * @property {string|number} value - Main statistic value to display
 * @property {string} label - Label describing the statistic
 * @property {string} [iconColor='text-blue-600'] - Tailwind CSS class for icon color
 * @property {string} [bgColor='bg-blue-100'] - Tailwind CSS class for icon background
 * @property {number} [trend] - Percentage change from previous period (-100 to 100)
 * @property {string} [trendLabel] - Label for the trend (e.g., 'vs last week')
 * @property {boolean} [loading=false] - Whether the card is in loading state
 * @property {Function} [onClick] - Click handler for the card
 * @property {string} [className] - Additional CSS classes
 * @property {string} [size='default'] - Card size ('sm', 'default', 'lg')
 * @property {string} [valuePrefix] - Prefix for the value (e.g., '$')
 * @property {string} [valueSuffix] - Suffix for the value (e.g., '%')
 */

/**
 * Size configurations for the card
 */
const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconContainer: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    valueSize: 'text-xl',
    labelSize: 'text-xs',
    trendSize: 'text-xs'
  },
  default: {
    padding: 'p-6',
    iconContainer: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    valueSize: 'text-2xl',
    labelSize: 'text-sm',
    trendSize: 'text-xs'
  },
  lg: {
    padding: 'p-8',
    iconContainer: 'w-14 h-14',
    iconSize: 'w-7 h-7',
    valueSize: 'text-3xl',
    labelSize: 'text-base',
    trendSize: 'text-sm'
  }
}

/**
 * Reusable Stats Card Component for Dashboards
 * 
 * Displays a single statistic with icon, value, label, and optional trend indicator.
 * Supports loading states, click handlers, and multiple size variants.
 * 
 * @component
 * @param {StatsCardProps} props - Component props
 * @returns {JSX.Element} Stats card component
 * 
 * @example
 * // Basic usage
 * <StatsCard
 *   icon={Eye}
 *   value={42}
 *   label="Pending QC"
 *   iconColor="text-rose-600"
 *   bgColor="bg-rose-100"
 * />
 * 
 * @example
 * // With trend indicator
 * <StatsCard
 *   icon={CheckCircle}
 *   value={156}
 *   label="Approved"
 *   trend={12.5}
 *   trendLabel="vs last week"
 *   iconColor="text-green-600"
 *   bgColor="bg-green-100"
 * />
 * 
 * @example
 * // Loading state
 * <StatsCard
 *   icon={Activity}
 *   value={0}
 *   label="Active Operations"
 *   loading={true}
 * />
 * 
 * @example
 * // With prefix/suffix
 * <StatsCard
 *   icon={DollarSign}
 *   value={1250}
 *   valuePrefix="$"
 *   label="Revenue"
 * />
 */
const StatsCard = memo(({ 
  icon: Icon, 
  value, 
  label, 
  iconColor = 'text-blue-600', 
  bgColor = 'bg-blue-100',
  trend,
  trendLabel,
  loading = false,
  onClick,
  className = '',
  size = 'default',
  valuePrefix = '',
  valueSuffix = ''
}) => {
  const config = sizeConfig[size] || sizeConfig.default

  // Determine trend direction and styling
  const getTrendInfo = () => {
    if (trend === undefined || trend === null) return null
    
    if (trend > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        prefix: '+'
      }
    } else if (trend < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        prefix: ''
      }
    } else {
      return {
        icon: Minus,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        prefix: ''
      }
    }
  }

  const trendInfo = getTrendInfo()

  // Format the value for display
  const formatValue = (val) => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm ${config.padding} border border-gray-100 text-center 
                  transition-all duration-200
                  ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''}
                  ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {/* Icon Container */}
      <div className={`${config.iconContainer} ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
        {loading ? (
          <div className={`${config.iconSize} rounded-full border-2 border-gray-300 border-t-transparent animate-spin`} />
        ) : (
          <Icon className={`${config.iconSize} ${iconColor}`} />
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className={`${config.valueSize} font-bold text-gray-200 animate-pulse`}>--</div>
      ) : (
        <p className={`${config.valueSize} font-bold text-gray-900`}>
          {valuePrefix}{formatValue(value)}{valueSuffix}
        </p>
      )}

      {/* Label */}
      <p className={`${config.labelSize} text-gray-600 mt-1`}>{label}</p>

      {/* Trend Indicator */}
      {trendInfo && !loading && (
        <div className={`flex items-center justify-center gap-1 mt-2 ${config.trendSize} ${trendInfo.color}`}>
          <trendInfo.icon className="w-3 h-3" />
          <span className={`px-1.5 py-0.5 rounded ${trendInfo.bgColor}`}>
            {trendInfo.prefix}{Math.abs(trend).toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-gray-500 ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
})

StatsCard.displayName = 'StatsCard'

export default StatsCard
