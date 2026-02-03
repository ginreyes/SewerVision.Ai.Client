'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Video,
  Clock,
  Search,
  RefreshCw,
  Image,
  Filter,
  CheckSquare,
  Square,
  Loader2,
  Play,
  Monitor,
  Zap,
  ChevronRight,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { qcApi } from '@/data/qcApi'
import { useUser } from '@/components/providers/UserContext'

// Import new hooks
import { usePolling, useDebounce, useDebouncedCallback } from '@/hooks'

// Import new components
import { LoadingState, ErrorState, EmptyState, DetectionCard } from '@/components/qc'

const POLL_INTERVAL = 30000 // 30 seconds

// Compact Stat Card Component (Matching Operator Dashboard)
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
  const [selectedProject, setSelectedProject] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all') // New severity filter
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDetection, setExpandedDetection] = useState(null)
  const [selectedDetection, setSelectedDetection] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Bulk action state
  const [selectedDetections, setSelectedDetections] = useState(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Real data state
  const [dashboardStats, setDashboardStats] = useState(null)
  const [pendingProjects, setPendingProjects] = useState([])
  const [aiDetections, setAiDetections] = useState([])
  const [weeklyQCStats, setWeeklyQCStats] = useState([])
  const [detectionTypes, setDetectionTypes] = useState([])
  const [priorityDistribution, setPriorityDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

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
  const { refresh: pollingRefresh, isPolling, lastUpdated } = usePolling(
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

  // Fetch project detections
  const fetchProjectDetections = useCallback(async (projectId) => {
    if (!projectId) return

    try {
      const detections = await qcApi.getProjectDetections(projectId, filterStatus === 'all' ? 'all' : filterStatus)

      if (detections && Array.isArray(detections)) {
        setAiDetections(detections.map(detection => ({
          id: detection._id || detection.id,
          type: detection.type || 'Unknown',
          confidence: detection.confidence || 0,
          frameTime: detection.frameTime || detection.timestamp || '00:00',
          location: detection.location || detection.station || 'N/A',
          severity: detection.severity || 'Minor',
          clockPosition: detection.clockPosition || 'N/A',
          description: detection.description || detection.notes || '',
          needsReview: !detection.qcStatus || detection.qcStatus === 'pending',
          qcStatus: detection.qcStatus || 'pending'
        })))
      } else {
        setAiDetections([])
      }
    } catch (err) {
      console.error('Error fetching project detections:', err)
      setAiDetections([])
    }
  }, [filterStatus])

  // Fetch detections when project is selected
  useEffect(() => {
    if (selectedProject?.id) {
      fetchProjectDetections(selectedProject.id)
    } else {
      setAiDetections([])
    }
  }, [selectedProject, fetchProjectDetections])

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await pollingRefresh()
    } finally {
      setRefreshing(false)
    }
  }, [pollingRefresh])

  // Filter detections based on search term and severity
  const filteredDetections = useMemo(() => {
    let filtered = aiDetections

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(d => d.severity.toLowerCase() === filterSeverity.toLowerCase())
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.type.toLowerCase().includes(searchLower) ||
        d.description.toLowerCase().includes(searchLower) ||
        d.location.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [aiDetections, debouncedSearchTerm, filterSeverity])

  // Toggle detection selection for bulk actions
  const toggleDetectionSelection = useCallback((detectionId) => {
    setSelectedDetections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(detectionId)) {
        newSet.delete(detectionId)
      } else {
        newSet.add(detectionId)
      }
      return newSet
    })
  }, [])

  // Select/deselect all visible detections
  const toggleSelectAll = useCallback(() => {
    if (selectedDetections.size === filteredDetections.length) {
      setSelectedDetections(new Set())
    } else {
      setSelectedDetections(new Set(filteredDetections.map(d => d.id)))
    }
  }, [filteredDetections, selectedDetections.size])

  // Bulk approve handler
  const handleBulkApprove = useCallback(async () => {
    if (selectedDetections.size === 0) return

    setBulkActionLoading(true)
    try {
      const promises = Array.from(selectedDetections).map(id =>
        qcApi.reviewDetection(id, { action: 'approved' })
      )
      await Promise.all(promises)
      await fetchProjectDetections(selectedProject.id)
      setSelectedDetections(new Set())
    } catch (err) {
      alert('Failed to approve some detections. Please try again.')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedDetections, fetchProjectDetections, selectedProject])

  // Bulk reject handler
  const handleBulkReject = useCallback(async () => {
    if (selectedDetections.size === 0) return

    setBulkActionLoading(true)
    try {
      const promises = Array.from(selectedDetections).map(id =>
        qcApi.reviewDetection(id, { action: 'rejected' })
      )
      await Promise.all(promises)
      await fetchProjectDetections(selectedProject.id)
      setSelectedDetections(new Set())
    } catch (err) {
      alert('Failed to reject some detections. Please try again.')
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedDetections, fetchProjectDetections, selectedProject])



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

  const getConfidenceColor = useCallback((confidence) => {
    if (confidence >= 85) return 'bg-green-100 text-green-700'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }, [])

  const getSeverityColor = useCallback((severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700'
      case 'Major': return 'bg-orange-100 text-orange-700'
      case 'Moderate': return 'bg-yellow-100 text-yellow-700'
      case 'Minor': return 'bg-rose-100 text-rose-700'
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

  // Detection action handlers
  const handleApproveDetection = useCallback(async (detection) => {
    try {
      await qcApi.reviewDetection(detection.id, { action: 'approved' })
      await fetchProjectDetections(selectedProject.id)
      setExpandedDetection(null)
      setSelectedDetection(null)
    } catch (err) {
      console.error('Error approving detection:', err)
      alert('Failed to approve detection. Please try again.')
    }
  }, [fetchProjectDetections, selectedProject])

  const handleRejectDetection = useCallback(async (detection) => {
    try {
      await qcApi.reviewDetection(detection.id, { action: 'rejected' })
      await fetchProjectDetections(selectedProject.id)
      setExpandedDetection(null)
      setSelectedDetection(null)
    } catch (err) {
      console.error('Error rejecting detection:', err)
      alert('Failed to reject detection. Please try again.')
    }
  }, [fetchProjectDetections, selectedProject])

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


  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when a detection is selected
      if (!selectedDetection) return

      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return

      // A key = Approve
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        handleApproveDetection(selectedDetection)
      }

      // R key = Reject
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleRejectDetection(selectedDetection)
      }

      // Escape = Deselect
      if (e.key === 'Escape') {
        setSelectedDetection(null)
        setExpandedDetection(null)
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const currentIndex = filteredDetections.findIndex(d => d.id === selectedDetection.id)
        if (currentIndex === -1) return

        let newIndex
        if (e.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : filteredDetections.length - 1
        } else {
          newIndex = currentIndex < filteredDetections.length - 1 ? currentIndex + 1 : 0
        }

        setSelectedDetection(filteredDetections[newIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDetection, filteredDetections, handleApproveDetection, handleRejectDetection])


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
  const needsReviewCount = filteredDetections.filter(d => d.needsReview).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Technician Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Review, annotate, and approve sewer inspection findings'}
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

      {/* Stats Grid - Compact 4-column */}
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
          trend={12}
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
                icon={FileText}
                label="New Report"
                onClick={() => { }}
                color="blue"
              />
              <QuickAction
                icon={Calendar}
                label="Schedule"
                onClick={() => { }}
                color="purple"
              />
              <QuickAction
                icon={RefreshCw}
                label="Sync Data"
                onClick={handleRefresh}
                color="green"
              />
              <QuickAction
                icon={Video}
                label="Uploads"
                onClick={() => { }}
                color="orange"
              />
            </div>
          </div>

          {/* Pending Projects List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
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
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedProject?.id === project.id
                      ? 'border-rose-500 bg-rose-50 shadow-sm'
                      : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50'
                      }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{project.projectName}</h4>
                      {project.aiProcessingComplete ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
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

                    <div className="mt-2 text-xs font-medium text-gray-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      {project.totalDetections} alerts
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Work Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* Performance Chart */}
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
            {/* Decorative background element */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
          </div>

          {/* QC Review Interface (The Work Area) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[700px]">
            {/* Review Header - Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">
                  {selectedProject ? 'Detection Review' : 'Select a Project'}
                </h3>
                {selectedProject && (
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-medium">
                    {selectedProject.projectName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="py-1.5 pl-2 pr-6 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                >
                  <option value="all">Severity</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Detection List */}
              <div className="w-1/3 border-r border-gray-100 flex flex-col">
                {/* Bulk Actions */}
                {selectedDetections.size > 0 && (
                  <div className="p-2 bg-rose-50 border-b border-rose-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-semibold text-rose-700">{selectedDetections.size} selected</span>
                      <button onClick={() => setSelectedDetections(new Set())} className="text-xs text-rose-600 hover:underline">Clear</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleBulkApprove} disabled={bulkActionLoading} className="flex-1 bg-white border border-rose-200 text-green-600 text-xs font-medium py-1.5 rounded hover:bg-green-50">Approve</button>
                      <button onClick={handleBulkReject} disabled={bulkActionLoading} className="flex-1 bg-white border border-rose-200 text-red-600 text-xs font-medium py-1.5 rounded hover:bg-red-50">Reject</button>
                    </div>
                  </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
                  {filteredDetections.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Search className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No detections found</p>
                    </div>
                  ) : (
                    filteredDetections.map((detection) => (
                      <div key={detection.id} className="flex items-start gap-2 group">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleDetectionSelection(detection.id); }}
                          className="mt-3 text-gray-300 hover:text-rose-500 transition-colors flex-shrink-0"
                        >
                          {selectedDetections.has(detection.id) ?
                            <CheckSquare className="w-4 h-4 text-rose-600" /> :
                            <Square className="w-4 h-4" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <DetectionCard
                            detection={detection}
                            isExpanded={false}
                            isSelected={selectedDetection?.id === detection.id}
                            onSelect={setSelectedDetection}
                            // Simplified card props for list view
                            onToggleExpand={() => setSelectedDetection(detection)} // Click expands/selects
                            onApprove={handleApproveDetection}
                            onReject={handleRejectDetection}
                            getSeverityColor={getSeverityColor}
                            getConfidenceColor={getConfidenceColor}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Preview & Annotation */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6 flex flex-col">
                {selectedDetection ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    {/* Preview Image Area */}
                    <div className="bg-black aspect-video relative flex items-center justify-center group">
                      {/* Placeholder for Video/Image */}
                      <div className="text-white/30 flex flex-col items-center">
                        <Image className="w-12 h-12 mb-2" />
                        <span className="text-xs">Frame Preview</span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-white text-sm font-medium">{selectedDetection.frameTime}</span>
                        <span className="bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded text-xs">Confidence: {Math.round(selectedDetection.confidence)}%</span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${selectedDetection.severity === 'Critical' ? 'bg-red-500 shadow-lg shadow-red-500/20' :
                            selectedDetection.severity === 'Major' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                          {selectedDetection.type}
                        </span>
                      </div>
                    </div>

                    {/* Annotation Form */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Annotation Details</h4>
                        <div className="flex gap-2">
                          <button onClick={() => { }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">PACP Code</label>
                          <select className="w-full text-sm border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500">
                            <option>Select Code...</option>
                            <option>FJ - Joint Defect</option>
                            <option>FC - Circumferential Crack</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Severity Grade</label>
                          <select className="w-full text-sm border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500">
                            <option>Select Grade...</option>
                            <option>1 - Minor</option>
                            <option>2 - Moderate</option>
                            <option>3 - Major</option>
                            <option>4 - Critical</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-6 flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Technician Notes</label>
                        <textarea
                          className="w-full h-full min-h-[100px] text-sm border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500 resize-none p-3"
                          placeholder="Add specific observations..."
                          defaultValue={selectedDetection.description}
                        ></textarea>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleRejectDetection(selectedDetection)}
                          className="flex-1 py-2.5 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveDetection(selectedDetection)}
                          className="flex-[2] py-2.5 bg-gradient-to-r from-[#D76A84] to-rose-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-rose-500/20 transition-all text-sm"
                        >
                          Confirm & Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Eye className="w-8 h-8 text-rose-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Detection Selected</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">Select a detection from the list to view details, video frame, and start annotation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QCTechnicianDashboard
