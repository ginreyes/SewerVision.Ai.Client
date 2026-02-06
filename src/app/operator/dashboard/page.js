'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Cog,
  Zap,
  RefreshCw,
  Monitor,
  Server,
  ChevronUp,
  ChevronDown,
  X,
  Battery,
  MapPin,
  Wifi,
  WifiOff,
  Info,
  Camera,
  Activity,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Calendar as CalendarIcon,
  Wrench
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { api } from '@/lib/helper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Import hooks
import { usePolling } from '@/hooks'

// Import components
import { LoadingState, ErrorState, EmptyState } from '@/components/qc'

const POLL_INTERVAL = 30000 // 30 seconds

// Compact Stat Card Component
const StatCard = ({ icon: Icon, value, label, trend, color = 'blue', suffix = '' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, color = 'blue' }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-${color}-200 transition-all bg-white group`}
  >
    <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
)

// Equipment Status Card
const EquipmentCard = ({ equipment, onClick }) => {
  const statusColors = {
    running: 'bg-green-500',
    recording: 'bg-green-500',
    online: 'bg-blue-500',
    paused: 'bg-yellow-500',
    maintenance: 'bg-orange-500',
    offline: 'bg-gray-400'
  }

  return (
    <div
      onClick={() => onClick(equipment)}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[equipment.status] || 'bg-gray-400'} ${equipment.status === 'recording' ? 'animate-pulse' : ''}`} />
        <div>
          <p className="font-medium text-gray-900 text-sm">{equipment.name}</p>
          <p className="text-xs text-gray-500 capitalize">{equipment.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {equipment.battery && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Battery className="w-3 h-3" />
            {equipment.battery}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

// Recent Activity Item
const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`p-1.5 rounded-lg ${activity.type === 'success' ? 'bg-green-100' :
        activity.type === 'warning' ? 'bg-yellow-100' :
          activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
      }`}>
      {activity.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
        activity.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
          <Activity className="w-4 h-4 text-blue-600" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900 truncate">{activity.message}</p>
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
  </div>
)

export default function OperatorDashboardContent() {
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [operationalStats, setOperationalStats] = useState({
    activeOperations: 0,
    equipmentOnline: 0,
    maintenanceDue: 0,
    systemUptime: 0,
    criticalAlerts: 0
  })
  const [recentOperations, setRecentOperations] = useState([])
  const [devices, setDevices] = useState([])
  const [weeklyPerformance, setWeeklyPerformance] = useState([
    { day: 'Mon', efficiency: 0, output: 0 },
    { day: 'Tue', efficiency: 0, output: 0 },
    { day: 'Wed', efficiency: 0, output: 0 },
    { day: 'Thu', efficiency: 0, output: 0 },
    { day: 'Fri', efficiency: 0, output: 0 },
    { day: 'Sat', efficiency: 0, output: 0 },
    { day: 'Sun', efficiency: 0, output: 0 },
  ])
  const [todayEvents, setTodayEvents] = useState([
    { id: 1, title: 'Downtown Sewer Inspection', time: '9:00 AM', location: 'Main St & 5th Ave', type: 'inspection' },
    { id: 2, title: 'Equipment Maintenance', time: '2:00 PM', location: 'Maintenance Bay', type: 'maintenance' },
    { id: 3, title: 'Team Meeting', time: '4:30 PM', location: 'Conference Room', type: 'meeting' }
  ])

  // Modal state
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)

  // Chart refs
  const performanceChartRef = useRef(null)
  const performanceChartInstance = useRef(null)

  // Recent activities (simulated)
  const recentActivities = [
    { id: 1, type: 'success', message: 'Camera 001 upload completed', time: '2 min ago' },
    { id: 2, type: 'info', message: 'AI processing started for Inspection #2847', time: '5 min ago' },
    { id: 3, type: 'warning', message: 'Camera 003 battery low (15%)', time: '12 min ago' },
    { id: 4, type: 'success', message: 'Inspection #2846 synced to cloud', time: '18 min ago' },
  ]

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    const username = localStorage.getItem('username')
    if (!username) return null

    const userResponse = await api(`/api/users/role/${username}`, 'GET')
    if (!userResponse.ok || !userResponse.data?._id) return null

    const userId = userResponse.data._id

    const response = await api(`/api/dashboard/operator/${userId}`, 'GET')
    if (response.ok && response.data?.data) {
      return response.data.data
    }
    throw new Error('Failed to load dashboard data')
  }, [])

  // Process dashboard data
  const processDashboardData = useCallback((data) => {
    if (!data) return

    setOperationalStats(data.operationalStats || operationalStats)
    setRecentOperations(data.recentOperations || [])
    setDevices(data.devices || [])
    if (data.weeklyPerformance) {
      setWeeklyPerformance(data.weeklyPerformance)
    }
  }, [])

  // Handle equipment click for modal
  const handleEquipmentClick = useCallback((equipment) => {
    const device = devices.find(d => d.id === equipment.id) || equipment
    setSelectedEquipment(device)
    setShowEquipmentModal(true)
  }, [devices])

  // Use polling hook
  const { refresh: pollingRefresh, lastUpdated } = usePolling(
    async () => {
      const data = await fetchDashboardData()
      processDashboardData(data)
      return data
    },
    POLL_INTERVAL,
    {
      enabled: true,
      immediate: true,
      onError: (err) => {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      },
      onSuccess: () => {
        setLoading(false)
        setError(null)
      }
    }
  )

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await pollingRefresh()
    } finally {
      setRefreshing(false)
    }
  }, [pollingRefresh])

  // Status helpers
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'running': case 'recording': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      case 'online': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'running': case 'recording': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'maintenance': return <Cog className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }, [])

  // Performance Chart
  useEffect(() => {
    if (performanceChartInstance.current) {
      performanceChartInstance.current.destroy()
    }

    if (performanceChartRef.current && weeklyPerformance.some(d => d.efficiency > 0)) {
      performanceChartInstance.current = new Chart(performanceChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyPerformance.map(d => d.day),
          datasets: [{
            label: 'Efficiency',
            data: weeklyPerformance.map(d => d.efficiency),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3B82F6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 70, max: 100, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      })
    }

    return () => {
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy()
      }
    }
  }, [weeklyPerformance])

  // Loading state
  if (loading) {
    return <LoadingState message="Loading dashboard..." spinnerColor="text-blue-600" />
  }

  // Error state
  if (error && !operationalStats.activeOperations && recentOperations.length === 0) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Monitor your field operations'}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid - Compact 4-column */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Play}
          value={operationalStats.activeOperations}
          label="Active Operations"
          color="green"
          trend={5}
        />
        <StatCard
          icon={Monitor}
          value={operationalStats.equipmentOnline}
          label="Equipment Online"
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          value={operationalStats.criticalAlerts}
          label="Active Alerts"
          color="orange"
        />
        <StatCard
          icon={Zap}
          value={operationalStats.systemUptime}
          suffix="%"
          label="Uptime"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Start Recording</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Sync Data</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <Cog className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Maintenance</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">View Alerts</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Equipment List */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Equipment Status</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {recentOperations.length} devices
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {recentOperations.length > 0 ? (
                recentOperations.slice(0, 5).map((op) => (
                  <EquipmentCard
                    key={op.id}
                    equipment={op}
                    onClick={handleEquipmentClick}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No equipment online</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 h-auto py-1"
                  onClick={() => window.location.href = '/operator/calendar'}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                    onClick={() => window.location.href = '/operator/calendar'}
                  >
                    <div className={`p-2 rounded-lg ${
                      event.type === 'inspection' ? 'bg-blue-100' :
                      event.type === 'maintenance' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {event.type === 'inspection' ? (
                        <Camera className={`w-4 h-4 ${event.type === 'inspection' ? 'text-blue-600' : ''}`} />
                      ) : event.type === 'maintenance' ? (
                        <Wrench className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No events scheduled today</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 mt-2"
                    onClick={() => window.location.href = '/operator/calendar'}
                  >
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Performance Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Weekly Performance</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <canvas ref={performanceChartRef}></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 h-auto py-1">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {showEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${selectedEquipment.status === 'recording' ? 'bg-green-400 animate-pulse' :
                      selectedEquipment.status === 'online' ? 'bg-blue-300' :
                        'bg-gray-300'
                    }`} />
                  <h3 className="text-lg font-semibold">{selectedEquipment.name}</h3>
                </div>
                <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Wifi className="w-3 h-3" />
                    Status
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEquipment.status)}`}>
                    {getStatusIcon(selectedEquipment.status)}
                    <span className="capitalize">{selectedEquipment.status}</span>
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Battery className="w-3 h-3" />
                    Battery
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedEquipment.battery || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">{selectedEquipment.location || 'Not set'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Zap className="w-3 h-3" />
                    Uptime
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedEquipment.uptime || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEquipmentModal(false)}>
                Close
              </Button>
              <Button>
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
