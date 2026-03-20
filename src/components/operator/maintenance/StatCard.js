'use client'

import { Card, CardContent } from '@/components/ui/card'

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend.type === 'up' ? 'text-green-600' : trend.type === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                {trend.value}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default StatCard
