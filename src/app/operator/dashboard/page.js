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
  Info
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
  
  // New state for sorting and modal
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)

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
    setDevices(data.devices || [])
    if (data.weeklyPerformance) {
      setWeeklyPerformance(data.weeklyPerformance)
    }
  }, [])

  // Sorting function for operations table
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Sorted operations - memoized
  const sortedOperations = useMemo(() => {
    const sorted = [...recentOperations]
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]
      
      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [recentOperations, sortConfig])

  // Get sort indicator
  const getSortIndicator = useCallback((key) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />
  }, [sortConfig])

  // Handle equipment click for modal
  const handleEquipmentClick = useCallback((equipment) => {
    // Find full device details
    const device = devices.find(d => d.id === equipment.id) || equipment
    setSelectedEquipment(device)
    setShowEquipmentModal(true)
  }, [devices])

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

      {/* Recent Operations Table with Sorting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Operations</h3>
            <span className="text-sm text-gray-500">
              {sortedOperations.length} equipment{sortedOperations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th 
                    className="pb-3 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('name')}
                  >
                    Equipment {getSortIndicator('name')}
                  </th>
                  <th 
                    className="pb-3 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIndicator('status')}
                  </th>
                  <th 
                    className="pb-3 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('uptime')}
                  >
                    Uptime {getSortIndicator('uptime')}
                  </th>
                  <th 
                    className="pb-3 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('lastCheck')}
                  >
                    Last Check {getSortIndicator('lastCheck')}
                  </th>
                  <th 
                    className="pb-3 cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('priority')}
                  >
                    Priority {getSortIndicator('priority')}
                  </th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {sortedOperations.length > 0 ? sortedOperations.map((op) => (
                  <tr key={op.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          op.status === 'recording' ? 'bg-green-500 animate-pulse' :
                          op.status === 'online' ? 'bg-blue-500' :
                          op.status === 'maintenance' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900">{op.name}</span>
                      </div>
                    </td>
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
                      <button 
                        onClick={() => handleEquipmentClick(op)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Info className="w-4 h-4" />
                        View Details
                      </button>
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

      {/* Equipment Detail Modal */}
      {showEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedEquipment.status === 'recording' ? 'bg-green-400 animate-pulse' :
                    selectedEquipment.status === 'online' ? 'bg-blue-300' :
                    'bg-gray-300'
                  }`} />
                  <h3 className="text-xl font-semibold">{selectedEquipment.name}</h3>
                </div>
                <button 
                  onClick={() => setShowEquipmentModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-blue-100 mt-1 text-sm capitalize">{selectedEquipment.type || 'Camera'}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    {selectedEquipment.status === 'offline' ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                    Status
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEquipment.status)}`}>
                    {getStatusIcon(selectedEquipment.status)}
                    <span className="capitalize">{selectedEquipment.status}</span>
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Battery className="w-4 h-4" />
                    Battery
                  </div>
                  <p className="font-semibold text-gray-900">{selectedEquipment.battery || 'N/A'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <p className="font-semibold text-gray-900">{selectedEquipment.location || 'Not specified'}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Last Seen
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedEquipment.lastSeen 
                      ? new Date(selectedEquipment.lastSeen).toLocaleString() 
                      : selectedEquipment.lastCheck || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Zap className="w-4 h-4" />
                    Uptime
                  </div>
                  <p className="font-semibold text-gray-900">{selectedEquipment.uptime || 'N/A'}</p>
                </div>
              </div>

              {/* Priority Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-gray-500 text-sm">Priority Level</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedEquipment.priority === 'high' ? 'bg-red-100 text-red-800' :
                  selectedEquipment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEquipment.priority || 'Normal'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
