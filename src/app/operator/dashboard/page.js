'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Cog,
  Zap,
  RefreshCw,
  Monitor,
  Server
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { api } from '@/lib/helper'

// Import new hooks
import { usePolling } from '@/hooks'

// Import new components
import { LoadingState, ErrorState, EmptyState, StatsCard } from '@/components/qc'

const POLL_INTERVAL = 30000 // 30 seconds

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
  const [weeklyPerformance, setWeeklyPerformance] = useState([
    { day: 'Mon', efficiency: 0, output: 0 },
    { day: 'Tue', efficiency: 0, output: 0 },
    { day: 'Wed', efficiency: 0, output: 0 },
    { day: 'Thu', efficiency: 0, output: 0 },
    { day: 'Fri', efficiency: 0, output: 0 },
    { day: 'Sat', efficiency: 0, output: 0 },
    { day: 'Sun', efficiency: 0, output: 0 },
  ])

  // Chart refs
  const statusChartRef = useRef(null)
  const performanceChartRef = useRef(null)
  const downtimeChartRef = useRef(null)
  const alertsChartRef = useRef(null)

  // Chart instances
  const statusChartInstance = useRef(null)
  const performanceChartInstance = useRef(null)
  const downtimeChartInstance = useRef(null)
  const alertsChartInstance = useRef(null)

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    const username = localStorage.getItem('username')
    if (!username) return null

    // Get user ID first
    const userResponse = await api(`/api/users/role/${username}`, 'GET')
    if (!userResponse.ok || !userResponse.data?._id) return null

    const userId = userResponse.data._id

    // Fetch operator dashboard stats
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
    if (data.weeklyPerformance) {
      setWeeklyPerformance(data.weeklyPerformance)
    }
  }, [])

  // Use polling hook for real-time updates
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

  const downtimeReasons = [
    { reason: 'Scheduled Maintenance', hours: 12 },
    { reason: 'Power Outage', hours: 3 },
    { reason: 'Sensor Fault', hours: 5 },
    { reason: 'Manual Pause', hours: 4 },
  ]

  const alertTrends = [
    { week: 'W1', warning: 8, critical: 3 },
    { week: 'W2', warning: 6, critical: 5 },
    { week: 'W3', warning: 10, critical: 2 },
    { week: 'W4', warning: 7, critical: 1 },
  ]

  // Status helpers - memoized
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'maintenance': return <Cog className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }, [])

  // Charts
  useEffect(() => {
    const destroyCharts = () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy()
      if (performanceChartInstance.current) performanceChartInstance.current.destroy()
      if (downtimeChartInstance.current) downtimeChartInstance.current.destroy()
      if (alertsChartInstance.current) alertsChartInstance.current.destroy()
    }

    destroyCharts()

    // Status Distribution Pie Chart
    if (statusChartRef.current) {
      statusChartInstance.current = new Chart(statusChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Running', 'Paused', 'Maintenance'],
          datasets: [{
            data: [10, 2, 2],
            backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
          }
        }
      })
    }

    // Performance Line Chart
    if (performanceChartRef.current) {
      performanceChartInstance.current = new Chart(performanceChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyPerformance.map(d => d.day),
          datasets: [
            {
              label: 'System Efficiency %',
              data: weeklyPerformance.map(d => d.efficiency),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Output Rate %',
              data: weeklyPerformance.map(d => d.output),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 80, max: 100, grid: { color: '#E5E7EB' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      })
    }

    // Downtime Bar Chart
    if (downtimeChartRef.current) {
      downtimeChartInstance.current = new Chart(downtimeChartRef.current, {
        type: 'bar',
        data: {
          labels: downtimeReasons.map(d => d.reason),
          datasets: [{
            label: 'Downtime (hours)',
            data: downtimeReasons.map(d => d.hours),
            backgroundColor: '#F59E0B'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#E5E7EB' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: false }
          }
        }
      })
    }

    // Alerts Trend Chart
    if (alertsChartRef.current) {
      alertsChartInstance.current = new Chart(alertsChartRef.current, {
        type: 'bar',
        data: {
          labels: alertTrends.map(d => d.week),
          datasets: [
            {
              label: 'Warning Alerts',
              data: alertTrends.map(d => d.warning),
              backgroundColor: '#F59E0B'
            },
            {
              label: 'Critical Alerts',
              data: alertTrends.map(d => d.critical),
              backgroundColor: '#EF4444'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#E5E7EB' } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      })
    }

    return destroyCharts
  }, [weeklyPerformance, recentOperations])

  // Loading state - using new component
  if (loading) {
    return <LoadingState message="Loading dashboard data..." spinnerColor="text-blue-600" />
  }

  // Error state - using new component
  if (error && !operationalStats.activeOperations && recentOperations.length === 0) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor field operations and equipment status</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Stats Grid - Using StatsCard Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          icon={Play}
          value={operationalStats.activeOperations}
          label="Active Operations"
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatsCard
          icon={Monitor}
          value={operationalStats.equipmentOnline}
          label="Equipment Online"
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          icon={AlertTriangle}
          value={operationalStats.criticalAlerts}
          label="Critical Alerts"
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatsCard
          icon={Clock}
          value={operationalStats.maintenanceDue}
          label="Maintenance Due"
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          icon={Zap}
          value={operationalStats.systemUptime}
          valueSuffix="%"
          label="System Uptime"
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status Distribution</h3>
          <div className="h-64">
            <canvas ref={statusChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Performance</h3>
          <div className="h-64">
            <canvas ref={performanceChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Downtime by Reason</h3>
          <div className="h-64">
            <canvas ref={downtimeChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Alert Trends (Last 4 Weeks)</h3>
          <div className="h-64">
            <canvas ref={alertsChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Recent Operations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Operations</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Equipment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Uptime</th>
                  <th className="pb-3">Last Check</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentOperations.length > 0 ? recentOperations.map((op) => (
                  <tr key={op.id} className="border-b border-gray-100">
                    <td className="py-4 font-medium text-gray-900">{op.name}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(op.status)}`}>
                        {getStatusIcon(op.status)}
                        <span className="capitalize">{op.status}</span>
                      </span>
                    </td>
                    <td className="py-4 text-gray-700">{op.uptime}</td>
                    <td className="py-4 text-gray-600 text-sm">{op.lastCheck}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        op.priority === 'high' ? 'bg-red-100 text-red-800' :
                        op.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {op.priority}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-8">
                      <EmptyState
                        size="sm"
                        icon={Server}
                        title="No Active Operations"
                        message="No active operations found at this time"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
