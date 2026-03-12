'use client'

const ProgressBar = ({ value, color = 'blue', size = 'md', showLabel = true }) => {
  const getColorClass = () => {
    if (value > 80) return 'bg-red-500'
    if (value > 60) return 'bg-yellow-500'
    return `bg-${color}-500`
  }

  const sizeClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-100 rounded-full ${sizeClass} overflow-hidden`}>
        <div
          className={`${getColorClass()} ${sizeClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-600 w-10 text-right">{value}%</span>}
    </div>
  )
}

export default ProgressBar
