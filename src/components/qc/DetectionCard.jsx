'use client'

import React, { memo, useCallback } from 'react'
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight, Video, Clock, MapPin } from 'lucide-react'

/**
 * @typedef {Object} Detection
 * @property {string} id - Unique identifier for the detection
 * @property {string} type - Type of detection (e.g., 'Crack', 'Root Intrusion')
 * @property {string} severity - Severity level ('Critical', 'Major', 'Moderate', 'Minor')
 * @property {number} confidence - AI confidence percentage (0-100)
 * @property {string} frameTime - Timestamp in video where detection occurs
 * @property {string} location - Physical location or station reference
 * @property {string} description - Description of the detection
 * @property {boolean} needsReview - Whether detection needs QC review
 * @property {string} [qcStatus] - QC status ('pending', 'approved', 'rejected')
 * @property {string} [clockPosition] - Clock position reference (e.g., '12 o\'clock')
 */

/**
 * @typedef {Object} DetectionCardProps
 * @property {Detection} detection - Detection data object
 * @property {boolean} [isExpanded=false] - Whether the card is expanded
 * @property {boolean} [isSelected=false] - Whether the card is selected
 * @property {Function} [onSelect] - Callback when card is selected
 * @property {Function} [onToggleExpand] - Callback to toggle expand state
 * @property {Function} [onApprove] - Callback when approve button is clicked
 * @property {Function} [onReject] - Callback when reject button is clicked
 * @property {Function} [onJumpToFrame] - Callback when jump to frame is clicked
 * @property {Function} [getSeverityColor] - Function to get severity badge color classes
 * @property {Function} [getConfidenceColor] - Function to get confidence badge color classes
 * @property {boolean} [showActions=true] - Whether to show action buttons when expanded
 * @property {boolean} [showMetadata=true] - Whether to show additional metadata
 * @property {boolean} [disabled=false] - Whether the card is disabled
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Default severity color mapping
 * @param {string} severity - Severity level
 * @returns {string} - Tailwind CSS classes for the severity badge
 */
const defaultGetSeverityColor = (severity) => {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-700'
    case 'Major': return 'bg-orange-100 text-orange-700'
    case 'Moderate': return 'bg-yellow-100 text-yellow-700'
    case 'Minor': return 'bg-rose-100 text-rose-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Default confidence color mapping
 * @param {number} confidence - Confidence percentage
 * @returns {string} - Tailwind CSS classes for the confidence badge
 */
const defaultGetConfidenceColor = (confidence) => {
  if (confidence >= 85) return 'bg-green-100 text-green-700'
  if (confidence >= 70) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

/**
 * Reusable Detection Card Component for QC Workflow
 * 
 * Displays detection information with expand/collapse functionality,
 * approve/reject actions, and customizable styling.
 * 
 * @component
 * @param {DetectionCardProps} props - Component props
 * @returns {JSX.Element} Detection card component
 * 
 * @example
 * // Basic usage
 * <DetectionCard
 *   detection={{
 *     id: '1',
 *     type: 'Longitudinal Crack',
 *     severity: 'Major',
 *     confidence: 92,
 *     frameTime: '02:34:15',
 *     location: 'Station 150+25',
 *     description: 'Crack extending 6 inches',
 *     needsReview: true
 *   }}
 *   isExpanded={expandedId === '1'}
 *   onSelect={(detection) => setSelected(detection)}
 *   onToggleExpand={(id) => setExpandedId(id)}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 * />
 * 
 * @example
 * // With custom colors and disabled actions
 * <DetectionCard
 *   detection={detection}
 *   showActions={false}
 *   getSeverityColor={(s) => customColors[s]}
 *   className="border-2"
 * />
 */
const DetectionCard = memo(({
  detection,
  isExpanded = false,
  isSelected = false,
  onSelect,
  onToggleExpand,
  onApprove,
  onReject,
  onJumpToFrame,
  getSeverityColor = defaultGetSeverityColor,
  getConfidenceColor = defaultGetConfidenceColor,
  showActions = true,
  showMetadata = true,
  disabled = false,
  className = ''
}) => {
  // Handle card click
  const handleClick = useCallback(() => {
    if (disabled) return
    onSelect?.(detection)
    onToggleExpand?.(detection.id)
  }, [detection, disabled, onSelect, onToggleExpand])

  // Handle approve click
  const handleApprove = useCallback((e) => {
    e.stopPropagation()
    if (disabled) return
    onApprove?.(detection)
  }, [detection, disabled, onApprove])

  // Handle reject click
  const handleReject = useCallback((e) => {
    e.stopPropagation()
    if (disabled) return
    onReject?.(detection)
  }, [detection, disabled, onReject])

  // Handle jump to frame click
  const handleJumpToFrame = useCallback((e) => {
    e.stopPropagation()
    if (disabled) return
    onJumpToFrame?.(detection)
  }, [detection, disabled, onJumpToFrame])

  // Get QC status badge
  const getQCStatusBadge = () => {
    if (!detection.qcStatus || detection.qcStatus === 'pending') return null
    
    const statusConfig = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
    }
    
    const config = statusConfig[detection.qcStatus]
    if (!config) return null

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all border ${
        isSelected || isExpanded
          ? 'border-rose-500 bg-rose-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={isExpanded}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Type and Badges Row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-gray-900 text-sm truncate">{detection.type}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(detection.severity)}`}>
              {detection.severity}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(detection.confidence)}`}>
              {detection.confidence}%
            </span>
            {getQCStatusBadge()}
          </div>

          {/* Metadata Row */}
          {showMetadata && (
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {detection.frameTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {detection.location}
              </span>
              {detection.clockPosition && (
                <span className="text-gray-500">
                  @ {detection.clockPosition}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-gray-500 italic line-clamp-1">{detection.description}</p>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 ml-2">
          {detection.needsReview && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" title="Needs Review" />
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleApprove}
              disabled={disabled}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 
                         flex items-center justify-center gap-1 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Approve detection"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </button>
            <button
              onClick={handleReject}
              disabled={disabled}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 
                         flex items-center justify-center gap-1 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reject detection"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
          </div>

          {/* Jump to Frame Button */}
          <button
            onClick={handleJumpToFrame}
            disabled={disabled}
            className="w-full text-xs text-rose-600 hover:text-rose-800 font-medium 
                       flex items-center justify-center gap-1 py-1 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Jump to frame in video"
          >
            <Video className="h-3.5 w-3.5" /> Jump to Frame
          </button>
        </div>
      )}
    </div>
  )
})

DetectionCard.displayName = 'DetectionCard'

export default DetectionCard
