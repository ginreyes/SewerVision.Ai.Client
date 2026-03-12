'use client'

import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AlertItem = ({ alert, onDismiss }) => {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'error': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: XCircle,
        iconColor: 'text-red-500'
      }
      case 'warning': return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500'
      }
      case 'info': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: CheckCircle,
        iconColor: 'text-blue-500'
      }
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: AlertTriangle,
        iconColor: 'text-gray-500'
      }
    }
  }

  const styles = getAlertStyles(alert.type)
  const IconComponent = styles.icon

  return (
    <div className={`flex items-center p-4 ${styles.bg} border ${styles.border} rounded-xl transition-all hover:shadow-sm`}>
      <div className="flex-shrink-0 mr-3">
        <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
        <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {alert.timestamp}
          </span>
          <span className="text-gray-300">&bull;</span>
          <span className="capitalize font-medium">{alert.system.replace('-', ' ')}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 text-gray-400 hover:text-gray-600"
        onClick={() => onDismiss && onDismiss(alert.id)}
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default AlertItem
