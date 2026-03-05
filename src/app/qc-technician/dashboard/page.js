'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  ChevronRight,
  TrendingUp,
  FileText,
  Calendar,
  ClipboardCheck,
  FolderOpen,
  Award
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { qcApi } from '@/data/qcApi'
import { useUser } from '@/components/providers/UserContext'
import { useRouter } from 'next/navigation'
import { usePolling } from '@/hooks'
import { LoadingState, ErrorState, EmptyState } from '@/components/qc'

const POLL_INTERVAL = 30000

// Compact Stat Card Component
const StatCard = ({ icon: Icon, value, label, trend, color = 'blue', suffix = '' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600',
    rose: 'from-rose-500 to-pink-600',
    yellow: 'from-yellow-400 to-orange-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} bg-opacity-10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
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
    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-${color}-200 transition-all bg-white group w-full`}
  >
    <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
)

const QCTechnicianDashboard = () => {
  const { userId, userData } = useUser()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  // Real data state
  const [dashboardStats, setDashboardStats] = useState(null)
  const [pendingProjects, setPendingProjects] = useState([])
  const [weeklyQCStats, setWeeklyQCStats] = useState([])
  const [detectionTypes, setDetectionTypes] = useState([])
  const [priorityDistribution, setPriorityDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Chart refs
  const qcStatsChartRef = useRef(null)
  const detectionTrendChartRef = useRef(null)
  const priorityDistributionRef = useRef(null)

  // Chart instances
  const qcStatsChartInstance = useRef(null)
  const detectionTrendChartInstance = useRef(null)
  const priorityDistributionInstance = useRef(null)

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    if (!userId) return null
    const stats = await qcApi.getDashboardStats(userId)
    return stats
  }, [userId])

  // Process dashboard data
  const processDashboardData = useCallback((stats) => {
    if (!stats) return

    setDashboardStats(stats)

    // Update pending projects
    if (stats.recentAssignments) {
      setPendingProjects(stats.recentAssignments.map(project => ({
        id: project.id,
        projectName: project.projectName,
        uploadDate: project.assignedAt ? new Date(project.assignedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        operator: project.operator || 'N/A',
        aiProcessingComplete: project.totalDetections > 0,
        totalDetections: project.totalDetections || 0,
        status: project.status === 'pending' ? 'pending_qc' :
          project.status === 'in-review' ? 'in_review' :
            project.status === 'completed' ? 'completed' : 'processing',
        pipeLength: project.pipeLength || 'N/A',
        priority: project.priority || 'medium'
      })))
    }

    // Update weekly stats
    if (stats.weeklyStats && stats.weeklyStats.length > 0) {
      setWeeklyQCStats(stats.weeklyStats)
    } else {
      setWeeklyQCStats([
        { week: 'W1', reviewed: 0, approved: 0, rejected: 0, pending: 0 },
        { week: 'W2', reviewed: 0, approved: 0, rejected: 0, pending: 0 },
        { week: 'W3', reviewed: 0, approved: 0, rejected: 0, pending: 0 },
        { week: 'W4', reviewed: 0, approved: 0, rejected: 0, pending: 0 }
      ])
    }

    // Update detection types
    if (stats.detectionTypes && stats.detectionTypes.length > 0) {
      setDetectionTypes(stats.detectionTypes)
    } else {
      setDetectionTypes([])
    }

    // Calculate priority distribution
    if (stats.recentAssignments) {
      const high = stats.recentAssignments.filter(p => p.priority === 'high').length
      const medium = stats.recentAssignments.filter(p => p.priority === 'medium').length
      const low = stats.recentAssignments.filter(p => p.priority === 'low').length
      setPriorityDistribution([
        { priority: 'High', count: high },
        { priority: 'Medium', count: medium },
        { priority: 'Low', count: low }
      ])
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
      enabled: !!userId,
      immediate: true,
      onError: (err) => {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      },
      onSuccess: () => {
        setLoading(false)
        setError(null)
      },
      dependencies: [userId]
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
      case 'pending_qc':
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'in_review':
      case 'in-review': return 'bg-rose-100 text-rose-700'
      case 'processing': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }, [])

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  // Update charts when data changes
  useEffect(() => {
    const destroyCharts = () => {
      if (qcStatsChartInstance.current) {
        qcStatsChartInstance.current.destroy()
        qcStatsChartInstance.current = null
      }
      if (detectionTrendChartInstance.current) {
        detectionTrendChartInstance.current.destroy()
        detectionTrendChartInstance.current = null
      }
      if (priorityDistributionInstance.current) {
        priorityDistributionInstance.current.destroy()
        priorityDistributionInstance.current = null
      }
    }

    destroyCharts()

    // Weekly QC Review Stats (Line Chart)
    if (qcStatsChartRef.current && weeklyQCStats.length > 0) {
      qcStatsChartInstance.current = new Chart(qcStatsChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyQCStats.map(d => d.week || 'W?'),
          datasets: [
            {
              label: 'Reviewed',
              data: weeklyQCStats.map(d => Number(d.reviewed) || 0),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Approved',
              data: weeklyQCStats.map(d => Number(d.approved) || 0),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Pending',
              data: weeklyQCStats.map(d => Number(d.pending) || 0),
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { stepSize: 5 } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      })
    }

    // Detection Type Distribution (Bar Chart)
    if (detectionTrendChartRef.current && detectionTypes.length > 0) {
      detectionTrendChartInstance.current = new Chart(detectionTrendChartRef.current, {
        type: 'bar',
        data: {
          labels: detectionTypes.map(d => d.type || 'Unknown'),
          datasets: [{
            label: 'Total Detections',
            data: detectionTypes.map(d => d.count || 0),
            backgroundColor: '#3B82F6',
            borderRadius: 4
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
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      })
    }

    // Priority Distribution (Pie Chart)
    if (priorityDistributionRef.current && priorityDistribution.length > 0) {
      priorityDistributionInstance.current = new Chart(priorityDistributionRef.current, {
        type: 'pie',
        data: {
          labels: priorityDistribution.map(p => p.priority),
          datasets: [{
            data: priorityDistribution.map(p => p.count),
            backgroundColor: ['#EF4444', '#F59E0B', '#6B7280'],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } }
          }
        }
      })
    }

    return destroyCharts
  }, [weeklyQCStats, detectionTypes, priorityDistribution])

  // Loading state
  if (loading && !dashboardStats) {
    return <LoadingState message="Loading dashboard data..." spinnerColor="text-rose-600" />
  }

  // Error state
  if (error && !dashboardStats) {
    return <ErrorState message={error} onRetry={handleRefresh} />
  }

  const stats = dashboardStats?.stats || {}
  const pendingCount = stats.pendingAssignments || 0
  const approvedCount = stats.totalApproved || 0
  const rejectedCount = stats.totalRejected || 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userData?.first_name ? `Welcome back, ${userData.first_name}` : 'QC Technician Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Overview of your quality control activity'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          value={pendingCount}
          label="Pending QC"
          color="rose"
        />
        <StatCard
          icon={CheckCircle}
          value={approvedCount}
          label="Approved"
          color="green"
        />
        <StatCard
          icon={XCircle}
          value={rejectedCount}
          label="Rejected"
          color="red"
        />
        <StatCard
          icon={Clock}
          value={stats.totalReviewed || 0}
          label="Total Reviewed"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Projects List */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                icon={ClipboardCheck}
                label="Quality Control"
                onClick={() => router.push('/qc-technician/quality-control')}
                color="rose"
              />
              <QuickAction
                icon={FolderOpen}
                label="Projects"
                onClick={() => router.push('/qc-technician/project')}
                color="blue"
              />
              <QuickAction
                icon={FileText}
                label="Reports"
                onClick={() => router.push('/qc-technician/reports')}
                color="green"
              />
              <QuickAction
                icon={Calendar}
                label="Calendar"
                onClick={() => router.push('/qc-technician/calendar')}
                color="purple"
              />
            </div>
          </div>

          {/* Assigned Projects List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Assigned Projects</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{pendingProjects.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {pendingProjects.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={Eye}
                  title="No Projects"
                  message="No projects assigned yet"
                />
              ) : (
                pendingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-xl cursor-pointer transition-all border border-gray-100 hover:border-rose-200 hover:bg-gray-50 group"
                    onClick={() => router.push('/qc-technician/quality-control')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{project.projectName}</h4>
                      {project.aiProcessingComplete ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{project.operator}</span>
                      <span>{project.uploadDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {project.totalDetections} detections
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-rose-400 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* QC Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">QC Activity</h3>
                <p className="text-sm text-gray-500">Weekly review performance</p>
              </div>
              <div className="flex space-x-2">
                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Reviewed</div>
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">Approved</div>
              </div>
            </div>
            <div className="h-64 relative z-10">
              <canvas ref={qcStatsChartRef}></canvas>
            </div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
          </div>

          {/* Charts Row - Detection Types & Priority Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detection Type Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">Detection Types</h3>
                <p className="text-sm text-gray-500">Distribution by category</p>
              </div>
              <div className="h-48">
                {detectionTypes.length > 0 ? (
                  <canvas ref={detectionTrendChartRef}></canvas>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    No detection data yet
                  </div>
                )}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">Priority Distribution</h3>
                <p className="text-sm text-gray-500">Projects by priority level</p>
              </div>
              <div className="h-48">
                {priorityDistribution.some(p => p.count > 0) ? (
                  <canvas ref={priorityDistributionRef}></canvas>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    No priority data yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Assignments</h3>
                <p className="text-sm text-gray-500">Latest project assignments</p>
              </div>
              <button
                onClick={() => router.push('/qc-technician/quality-control')}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {pendingProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push('/qc-technician/quality-control')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${project.status === 'completed' ? 'bg-green-500' :
                          project.status === 'in_review' ? 'bg-rose-500' : 'bg-yellow-500'
                        }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-xs text-gray-500">{project.operator} &middot; {project.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">{project.totalDetections} detections</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QCTechnicianDashboard
