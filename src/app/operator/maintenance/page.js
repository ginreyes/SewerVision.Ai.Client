'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  Shield,
  Zap,
  Monitor,
  Wrench,
  Plus,
  Calendar,
  User,
  Loader2,
  ChevronRight,
  Filter,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import maintenanceApi from '@/data/maintenanceApi'

// Icon mapping for system categories
const categoryIcons = {
  cloud: Server,
  ai: Cpu,
  database: Database,
  streaming: Monitor,
  security: Shield,
}

// Stat Card Component - Reusable card for displaying metrics
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

// Progress Bar Component
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

// System Status Card Component
const SystemStatusCard = ({ system, onViewDetails }) => {
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
          <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform`}>
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

        {/* Resource Metrics */}
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

// Alert Item Component
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
          <span className="text-gray-300">•</span>
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

// Task Row Component  
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

// Main Component
const MaintenancePage = () => {
  const { userId, userData } = useUser()
  const { showAlert } = useAlert()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Data states
  const [systemStatus, setSystemStatus] = useState([])
  const [maintenanceTasks, setMaintenanceTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState({
    aiProcessingSpeed: '+15%',
    errorRate: '0.02%',
    avgResponseTime: '285ms',
  })
  const [securityStatus, setSecurityStatus] = useState({
    lastScan: new Date(),
    vulnerabilities: 0,
    firewallStatus: 'active',
  })
  const [resourceUsage, setResourceUsage] = useState({
    totalStorage: { used: 2.4, total: 5, unit: 'TB' },
    bandwidthPeak: '1.8 GB/s',
    activeConnections: 1247,
  })

  // Stats calculations
  const stats = {
    healthySystems: systemStatus.filter(s => s.status === 'healthy').length,
    totalSystems: systemStatus.length,
    activeTasks: maintenanceTasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: maintenanceTasks.filter(t => ['pending', 'scheduled'].includes(t.status)).length,
    completedTasks: maintenanceTasks.filter(t => t.status === 'completed').length,
    criticalAlerts: alerts.filter(a => a.type === 'error' || a.type === 'critical').length
  }

  // Fetch maintenance data from API
  const fetchMaintenanceData = useCallback(async () => {
    try {
      const { data, error } = await maintenanceApi.getOverview()

      if (error) {
        console.error('Error fetching maintenance data:', error)
        showAlert('Failed to load maintenance data', 'error')
        return
      }

      if (data?.data) {
        // Map systems with icons
        const systemsWithIcons = (data.data.systems || []).map(system => ({
          ...system,
          id: system.systemId,
          icon: categoryIcons[system.category] || Server,
          lastCheck: formatTimeAgo(system.lastCheck)
        }))
        setSystemStatus(systemsWithIcons)

        // Map tasks
        const mappedTasks = (data.data.tasks || []).map(task => ({
          ...task,
          id: task.taskId,
        }))
        setMaintenanceTasks(mappedTasks)

        // Map alerts
        const mappedAlerts = (data.data.alerts || []).map(alert => ({
          ...alert,
          id: alert.alertId,
          timestamp: formatTimeAgo(alert.createdAt)
        }))
        setAlerts(mappedAlerts)

        // Set additional metrics if available
        if (data.data.performanceMetrics) {
          setPerformanceMetrics(data.data.performanceMetrics)
        }
        if (data.data.securityStatus) {
          setSecurityStatus(data.data.securityStatus)
        }
        if (data.data.resourceUsage) {
          setResourceUsage(data.data.resourceUsage)
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
      showAlert('Failed to load maintenance data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)

    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    if (diffHr < 24) return `${diffHr} hr ago`
    return date.toLocaleDateString()
  }

  // Initial data load
  useEffect(() => {
    fetchMaintenanceData()
  }, [fetchMaintenanceData])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)

    try {
      const { data, error } = await maintenanceApi.refreshSystems()

      if (error) {
        showAlert('Failed to refresh status', 'error')
        return
      }

      // Refetch all data
      await fetchMaintenanceData()
      showAlert('System status refreshed successfully', 'success')
    } catch (error) {
      showAlert('Failed to refresh status', 'error')
    } finally {
      setRefreshing(false)
    }
  }, [showAlert, fetchMaintenanceData])

  // Handle alert dismiss
  const handleDismissAlert = async (alertId) => {
    try {
      const { error } = await maintenanceApi.deleteAlert(alertId)

      if (error) {
        showAlert('Failed to dismiss alert', 'error')
        return
      }

      setAlerts(prev => prev.filter(a => a.id !== alertId && a.alertId !== alertId))
      showAlert('Alert dismissed', 'success')
    } catch (error) {
      showAlert('Failed to dismiss alert', 'error')
    }
  }

  // Filter tasks
  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesSearch = task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 animate-pulse">Loading maintenance dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              System Maintenance
            </h1>
            <p className="text-gray-500 mt-1">
              SewerVision.ai Infrastructure Monitoring & Maintenance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="System Health"
            value={`${stats.healthySystems}/${stats.totalSystems}`}
            subtitle="Systems operational"
            icon={Activity}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
            trend={{ type: 'up', value: 'All healthy' }}
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            subtitle="In progress now"
            icon={Clock}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            subtitle="Scheduled maintenance"
            icon={Calendar}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            subtitle={stats.criticalAlerts > 0 ? 'Requires attention' : 'No critical issues'}
            icon={AlertTriangle}
            color={stats.criticalAlerts > 0 ? "bg-gradient-to-br from-red-500 to-red-700" : "bg-gradient-to-br from-gray-400 to-gray-600"}
          />
        </div>

        {/* System Status Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              System Status
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStatus.map((system) => (
              <SystemStatusCard key={system.id} system={system} />
            ))}
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                System Alerts
                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                  {alerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Maintenance Tasks Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="w-5 h-5 text-blue-600" />
                Maintenance Tasks
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ETA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No tasks found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Processing Speed</span>
                  <span className="text-green-600 font-semibold text-sm">+15% ↑</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="text-green-600 font-semibold text-sm">0.02%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="text-blue-600 font-semibold text-sm">285ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Security Scan</span>
                  <span className="text-green-600 font-semibold text-sm">2 hrs ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Critical Vulnerabilities</span>
                  <span className="text-green-600 font-semibold text-sm">0 found</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Firewall Status</span>
                  <span className="text-green-600 font-semibold text-sm">Active ✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resource Usage</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Storage</span>
                  <span className="text-blue-600 font-semibold text-sm">2.4 / 5 TB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bandwidth Peak</span>
                  <span className="text-purple-600 font-semibold text-sm">1.8 GB/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="text-yellow-600 font-semibold text-sm">1,247</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage