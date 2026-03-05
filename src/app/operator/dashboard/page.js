'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  X,
  Battery,
  MapPin,
  Wifi,
  Camera,
  Activity,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Calendar as CalendarIcon,
  Wrench,
  FolderOpen,
  Loader2
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { api } from '@/lib/helper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'

// Import components
import { LoadingState, ErrorState } from '@/components/qc'

const POLL_INTERVAL = 30000

// ─── Stat Card ───────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color = 'blue', suffix = '' }) => {
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
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// ─── Equipment Card ──────────────────────────────────────────────
const EquipmentCard = ({ equipment, onClick }) => {
  const statusColors = {
    running: 'bg-green-500',
    recording: 'bg-green-500',
    online: 'bg-blue-500',
    paused: 'bg-yellow-500',
    idle: 'bg-gray-400',
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
        {equipment.battery && equipment.battery !== 'N/A' && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Battery className="w-3 h-3" />
            {typeof equipment.battery === 'number' ? `${equipment.battery}%` : equipment.battery}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

// ─── Activity Item ───────────────────────────────────────────────
const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`p-1.5 rounded-lg ${
      activity.type === 'success' ? 'bg-green-100' :
      activity.type === 'warning' ? 'bg-yellow-100' :
      activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
    }`}>
      {activity.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
        activity.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
        activity.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
        <Activity className="w-4 h-4 text-blue-600" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-900 truncate">{activity.message}</p>
      <p className="text-xs text-gray-500">{activity.time}</p>
    </div>
  </div>
)

// ─── Project Row ─────────────────────────────────────────────────
const ProjectRow = ({ project, onClick }) => {
  const statusConfig = {
    'field-capture': { color: 'bg-blue-100 text-blue-700', label: 'Field Capture' },
    'uploading': { color: 'bg-indigo-100 text-indigo-700', label: 'Uploading' },
    'ai-processing': { color: 'bg-purple-100 text-purple-700', label: 'AI Processing' },
    'qc-review': { color: 'bg-amber-100 text-amber-700', label: 'QC Review' },
    'completed': { color: 'bg-green-100 text-green-700', label: 'Completed' },
    'planning': { color: 'bg-gray-100 text-gray-700', label: 'Planning' },
    'on-hold': { color: 'bg-red-100 text-red-700', label: 'On Hold' },
  }

  const config = statusConfig[project.status] || statusConfig['planning']

  return (
    <div
      onClick={() => onClick(project)}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-gray-900 text-sm truncate">{project.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {project.location && (
            <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {project.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
          {config.label}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════
export default function OperatorDashboardContent() {
  const router = useRouter()
  const { userId, userData } = useUser()
  const { showAlert } = useAlert()

  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dashboard data
  const [operationalStats, setOperationalStats] = useState({
    activeOperations: 0,
    equipmentOnline: 0,
    maintenanceDue: 0,
    systemUptime: 0,
    criticalAlerts: 0
  })
  const [recentOperations, setRecentOperations] = useState([])
  const [devices, setDevices] = useState([])
  const [weeklyPerformance, setWeeklyPerformance] = useState([])
  const [todayEvents, setTodayEvents] = useState([])
  const [projects, setProjects] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  // Modal state
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)

  // Chart refs
  const performanceChartRef = useRef(null)
  const performanceChartInstance = useRef(null)

  // Track last updated
  const [lastUpdated, setLastUpdated] = useState(null)

  // ─── Build activity feed from real data ────────────────────────
  const buildActivities = useCallback((devicesData, projectsData) => {
    const activities = []

    // Device-based activities
    if (devicesData?.length) {
      devicesData.forEach(d => {
        if (d.status === 'recording') {
          activities.push({
            id: `dev-rec-${d.id}`,
            type: 'success',
            message: `${d.name} is currently recording`,
            time: d.lastSeen ? formatRelativeTime(d.lastSeen) : 'Now'
          })
        } else if (d.status === 'offline') {
          activities.push({
            id: `dev-off-${d.id}`,
            type: 'warning',
            message: `${d.name} is offline`,
            time: d.lastSeen ? formatRelativeTime(d.lastSeen) : 'Unknown'
          })
        } else if (d.status === 'maintenance') {
          activities.push({
            id: `dev-maint-${d.id}`,
            type: 'warning',
            message: `${d.name} requires maintenance`,
            time: d.lastSeen ? formatRelativeTime(d.lastSeen) : 'Unknown'
          })
        }
      })
    }

    // Project-based activities
    if (projectsData?.length) {
      projectsData.slice(0, 3).forEach(p => {
        const statusMsg = {
          'ai-processing': { type: 'info', msg: `AI processing: ${p.name}` },
          'qc-review': { type: 'info', msg: `QC review pending: ${p.name}` },
          'completed': { type: 'success', msg: `Project completed: ${p.name}` },
          'field-capture': { type: 'info', msg: `Field capture active: ${p.name}` },
        }
        const info = statusMsg[p.status]
        if (info) {
          activities.push({
            id: `proj-${p._id}`,
            type: info.type,
            message: info.msg,
            time: p.updatedAt ? formatRelativeTime(p.updatedAt) : ''
          })
        }
      })
    }

    // If no activities at all, show a default message
    if (activities.length === 0) {
      activities.push({
        id: 'no-activity',
        type: 'info',
        message: 'No recent activity',
        time: ''
      })
    }

    return activities.slice(0, 6)
  }, [])

  // ─── Fetch all dashboard data ──────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return

    try {
      // Fetch dashboard stats, today's events, and projects in parallel
      const [dashResponse, eventsResponse, projectsResponse] = await Promise.all([
        api(`/api/dashboard/operator/${userId}`, 'GET'),
        api(`/api/operator/calendar/events/today?userId=${userId}`, 'GET'),
        api(`/api/projects/get-all-projects?assignedOperatorId=${userId}&limit=10`, 'GET'),
      ])

      // Process dashboard stats
      if (dashResponse.ok && dashResponse.data?.data) {
        const data = dashResponse.data.data
        setOperationalStats(data.operationalStats || operationalStats)
        setRecentOperations(data.recentOperations || [])
        setDevices(data.devices || [])
        if (data.weeklyPerformance) {
          setWeeklyPerformance(data.weeklyPerformance)
        }
      }

      // Process today's calendar events
      if (eventsResponse.ok && eventsResponse.data?.data) {
        const events = (eventsResponse.data.data || []).map(ev => ({
          id: ev._id,
          title: ev.title,
          time: new Date(ev.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: ev.location || ev.projectId?.location || '',
          type: ev.type || 'other',
          status: ev.status || 'scheduled'
        }))
        setTodayEvents(events)
      } else {
        setTodayEvents([])
      }

      // Process projects
      const projectsList = projectsResponse.ok ? (projectsResponse.data?.data || []) : []
      setProjects(projectsList)

      // Build real activity feed
      const devicesData = dashResponse.ok ? (dashResponse.data?.data?.devices || []) : []
      setRecentActivities(buildActivities(devicesData, projectsList))

      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [userId, buildActivities])

  // ─── Initial fetch and polling ─────────────────────────────────
  useEffect(() => {
    if (!userId) return

    fetchDashboardData()

    const intervalId = setInterval(fetchDashboardData, POLL_INTERVAL)
    return () => clearInterval(intervalId)
  }, [userId, fetchDashboardData])

  // ─── Manual refresh ────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchDashboardData()
    } finally {
      setRefreshing(false)
    }
  }, [fetchDashboardData])

  // ─── Equipment click for modal ─────────────────────────────────
  const handleEquipmentClick = useCallback((equipment) => {
    const device = devices.find(d => d.id === equipment.id) || equipment
    setSelectedEquipment(device)
    setShowEquipmentModal(true)
  }, [devices])

  // ─── Status helpers ────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': case 'recording': return 'bg-green-100 text-green-800'
      case 'paused': case 'idle': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      case 'online': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': case 'recording': return <Play className="w-3 h-3" />
      case 'paused': case 'idle': return <Pause className="w-3 h-3" />
      case 'maintenance': return <Cog className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  // ─── Performance Chart ─────────────────────────────────────────
  useEffect(() => {
    if (performanceChartInstance.current) {
      performanceChartInstance.current.destroy()
    }

    if (performanceChartRef.current && weeklyPerformance.length > 0 && weeklyPerformance.some(d => d.efficiency > 0 || d.output > 0)) {
      performanceChartInstance.current = new Chart(performanceChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyPerformance.map(d => d.day),
          datasets: [
            {
              label: 'Efficiency %',
              data: weeklyPerformance.map(d => d.efficiency),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#3B82F6'
            },
            {
              label: 'Uploads',
              data: weeklyPerformance.map(d => d.output),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              fill: false,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#10B981',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: {
              min: 70, max: 100,
              grid: { color: '#F3F4F6' },
              title: { display: true, text: 'Efficiency %', font: { size: 11 } }
            },
            y1: {
              position: 'right',
              min: 0,
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Uploads', font: { size: 11 } }
            },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
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

  // ─── Loading state ─────────────────────────────────────────────
  if (loading && !lastUpdated) {
    return <LoadingState message="Loading dashboard..." spinnerColor="text-blue-600" />
  }

  // ─── Error state ───────────────────────────────────────────────
  if (error && !lastUpdated) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  // ─── Project counts ────────────────────────────────────────────
  const activeProjectCount = projects.filter(p =>
    ['field-capture', 'uploading', 'ai-processing'].includes(p.status)
  ).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userData?.first_name ? `Welcome, ${userData.first_name}` : 'Operator Dashboard'}
          </h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FolderOpen}
          value={activeProjectCount}
          label="Active Projects"
          color="green"
        />
        <StatCard
          icon={Monitor}
          value={operationalStats.equipmentOnline}
          label="Equipment Online"
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          value={operationalStats.criticalAlerts + operationalStats.maintenanceDue}
          label="Alerts"
          color="orange"
        />
        <StatCard
          icon={Zap}
          value={operationalStats.systemUptime}
          suffix="%"
          label="Device Uptime"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/operator/equipement')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Equipment</span>
                </button>
                <button
                  onClick={() => router.push('/operator/project')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <FolderOpen className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Projects</span>
                </button>
                <button
                  onClick={() => router.push('/operator/maintenance')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <Cog className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Maintenance</span>
                </button>
                <button
                  onClick={() => router.push('/operator/notifications')}
                  className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Notifications</span>
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
                  {devices.length} devices
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {devices.length > 0 ? (
                devices.slice(0, 6).map((device) => (
                  <EquipmentCard
                    key={device.id}
                    equipment={device}
                    onClick={handleEquipmentClick}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No devices assigned</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 mt-2"
                    onClick={() => router.push('/operator/connect-device')}
                  >
                    Connect Device
                  </Button>
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
                  onClick={() => router.push('/operator/calendar')}
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
                    onClick={() => router.push('/operator/calendar')}
                  >
                    <div className={`p-2 rounded-lg ${
                      event.type === 'inspection' ? 'bg-blue-100' :
                      event.type === 'maintenance' ? 'bg-orange-100' :
                      event.type === 'meeting' ? 'bg-purple-100' :
                      event.type === 'deadline' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {event.type === 'inspection' ? (
                        <Camera className="w-4 h-4 text-blue-600" />
                      ) : event.type === 'maintenance' ? (
                        <Wrench className="w-4 h-4 text-orange-600" />
                      ) : event.type === 'deadline' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
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
                    onClick={() => router.push('/operator/calendar')}
                  >
                    View Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2/3 Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Projects */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Assigned Projects</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 h-auto py-1"
                  onClick={() => router.push('/operator/project')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <ProjectRow
                    key={project._id}
                    project={project}
                    onClick={() => router.push(`/operator/project`)}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Weekly Performance</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                {weeklyPerformance.length > 0 && weeklyPerformance.some(d => d.efficiency > 0 || d.output > 0) ? (
                  <canvas ref={performanceChartRef}></canvas>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No performance data yet</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 h-auto py-1"
                  onClick={() => router.push('/operator/notifications')}
                >
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
                  <div className={`w-3 h-3 rounded-full ${
                    selectedEquipment.status === 'recording' ? 'bg-green-400 animate-pulse' :
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
                  <p className="font-semibold text-gray-900 text-sm">
                    {selectedEquipment.battery && selectedEquipment.battery !== 'N/A'
                      ? (typeof selectedEquipment.battery === 'number' ? `${selectedEquipment.battery}%` : selectedEquipment.battery)
                      : 'N/A'}
                  </p>
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
                    <Monitor className="w-3 h-3" />
                    Type
                  </div>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{selectedEquipment.type || 'N/A'}</p>
                </div>
              </div>
              {selectedEquipment.lastSeen && (
                <p className="text-xs text-gray-500">
                  Last seen: {new Date(selectedEquipment.lastSeen).toLocaleString()}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEquipmentModal(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowEquipmentModal(false)
                router.push('/operator/equipement')
              }}>
                View Equipment Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helper: relative time formatting ────────────────────────────
function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}
