'use client'

import { Calendar, User } from 'lucide-react'
import ProgressBar from './ProgressBar'

const TaskRow = ({ task }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">{task.task}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <span className="font-mono">{task.id}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityStyles(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyles(task.status)}`}>
          {task.status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="w-4 h-4 text-gray-400" />
          {task.assignedTo}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 w-32">
          <ProgressBar value={task.progress} size="sm" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(task.estimatedCompletion).toLocaleDateString()}
        </div>
      </td>
    </tr>
  )
}

export default TaskRow
