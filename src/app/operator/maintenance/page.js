'use client'

import React, { useState, useMemo } from 'react'
import {
  Settings,
  Server,
  Database,
  Cpu,
  Monitor,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  Shield,
  Wrench,
  Calendar,
  Loader2,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  useMaintenanceOverview,
  useRefreshMaintenanceSystems,
  useDismissMaintenanceAlert,
} from '@/hooks/useQueryHooks'
import { StatCard, SystemStatusCard, AlertItem, TaskRow } from '@/components/operator/maintenance'
import { DashboardSkeleton } from '@/components/shared/SkeletonLoading';

const categoryIcons = {
  cloud: Server,
  ai: Cpu,
  database: Database,
  streaming: Monitor,
  security: Shield,
}

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

// Main Component
const MaintenancePage = () => {
  const { userId, userData } = useUser()
  const { showAlert } = useAlert()

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Data fetching via TanStack Query ──
  const { data: overviewData, isLoading: loading } = useMaintenanceOverview()
  const refreshMutation = useRefreshMaintenanceSystems()
  const dismissAlertMutation = useDismissMaintenanceAlert()

  const refreshing = refreshMutation.isPending

  // Derive state from query data
  const { systemStatus, maintenanceTasks, alerts, performanceMetrics, securityStatus, resourceUsage } = useMemo(() => {
    if (!overviewData) return {
      systemStatus: [],
      maintenanceTasks: [],
      alerts: [],
      performanceMetrics: { aiProcessingSpeed: '+15%', errorRate: '0.02%', avgResponseTime: '285ms' },
      securityStatus: { lastScan: new Date(), vulnerabilities: 0, firewallStatus: 'active' },
      resourceUsage: { totalStorage: { used: 2.4, total: 5, unit: 'TB' }, bandwidthPeak: '1.8 GB/s', activeConnections: 1247 },
    }

    const systemsWithIcons = (overviewData.systems || []).map(system => ({
      ...system,
      id: system.systemId,
      icon: categoryIcons[system.category] || Server,
      lastCheck: formatTimeAgo(system.lastCheck)
    }))

    const mappedTasks = (overviewData.tasks || []).map(task => ({
      ...task,
      id: task.taskId,
    }))

    const mappedAlerts = (overviewData.alerts || []).map(alert => ({
      ...alert,
      id: alert.alertId,
      timestamp: formatTimeAgo(alert.createdAt)
    }))

    return {
      systemStatus: systemsWithIcons,
      maintenanceTasks: mappedTasks,
      alerts: mappedAlerts,
      performanceMetrics: overviewData.performanceMetrics || { aiProcessingSpeed: '+15%', errorRate: '0.02%', avgResponseTime: '285ms' },
      securityStatus: overviewData.securityStatus || { lastScan: new Date(), vulnerabilities: 0, firewallStatus: 'active' },
      resourceUsage: overviewData.resourceUsage || { totalStorage: { used: 2.4, total: 5, unit: 'TB' }, bandwidthPeak: '1.8 GB/s', activeConnections: 1247 },
    }
  }, [overviewData])

  // Stats calculations
  const stats = {
    healthySystems: systemStatus.filter(s => s.status === 'healthy').length,
    totalSystems: systemStatus.length,
    activeTasks: maintenanceTasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: maintenanceTasks.filter(t => ['pending', 'scheduled'].includes(t.status)).length,
    completedTasks: maintenanceTasks.filter(t => t.status === 'completed').length,
    criticalAlerts: alerts.filter(a => a.type === 'error' || a.type === 'critical').length
  }

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync()
      showAlert('System status refreshed successfully', 'success')
    } catch (error) {
      showAlert('Failed to refresh status', 'error')
    }
  }

  // Handle alert dismiss
  const handleDismissAlert = async (alertId) => {
    try {
      await dismissAlertMutation.mutateAsync(alertId)
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

  if (isLoading) return (<DashboardSkeleton />)
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
                  <span className="text-green-600 font-semibold text-sm">{performanceMetrics.aiProcessingSpeed} &#8593;</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="text-green-600 font-semibold text-sm">{performanceMetrics.errorRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="text-blue-600 font-semibold text-sm">{performanceMetrics.avgResponseTime}</span>
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
                  <span className="text-green-600 font-semibold text-sm">{formatTimeAgo(securityStatus.lastScan)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Critical Vulnerabilities</span>
                  <span className="text-green-600 font-semibold text-sm">{securityStatus.vulnerabilities} found</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Firewall Status</span>
                  <span className="text-green-600 font-semibold text-sm">{securityStatus.firewallStatus === 'active' ? 'Active' : securityStatus.firewallStatus}</span>
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
                  <span className="text-blue-600 font-semibold text-sm">
                    {resourceUsage.totalStorage?.used} / {resourceUsage.totalStorage?.total} {resourceUsage.totalStorage?.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bandwidth Peak</span>
                  <span className="text-purple-600 font-semibold text-sm">{resourceUsage.bandwidthPeak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Connections</span>
                  <span className="text-yellow-600 font-semibold text-sm">{resourceUsage.activeConnections?.toLocaleString()}</span>
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
