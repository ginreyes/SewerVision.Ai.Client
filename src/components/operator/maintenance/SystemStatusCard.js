'use client'

import { CheckCircle, Clock, Cpu, HardDrive, Database } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import ProgressBar from './ProgressBar'

const SystemStatusCard = ({ system }) => {
  const IconComponent = system.icon

  const getStatusStyles = (status) => {
    switch (status) {
      case 'healthy': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' }
      case 'warning': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' }
      case 'error': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' }
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' }
    }
  }

  const statusStyles = getStatusStyles(system.status)

  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyles.bg} ${statusStyles.text} border ${statusStyles.border}`}>
            <div className={`w-2 h-2 rounded-full ${statusStyles.dot} animate-pulse`} />
            {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{system.name}</h3>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            {system.uptime} uptime
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {system.lastCheck}
          </span>
        </div>

        <div className="space-y-3 mt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> CPU
              </span>
              <span className="font-medium text-gray-700">{system.cpu}%</span>
            </div>
            <ProgressBar value={system.cpu} showLabel={false} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Memory
              </span>
              <span className="font-medium text-gray-700">{system.memory}%</span>
            </div>
            <ProgressBar value={system.memory} showLabel={false} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 flex items-center gap-1">
                <Database className="w-3 h-3" /> Storage
              </span>
              <span className="font-medium text-gray-700">{system.storage}%</span>
            </div>
            <ProgressBar value={system.storage} color="purple" showLabel={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemStatusCard
