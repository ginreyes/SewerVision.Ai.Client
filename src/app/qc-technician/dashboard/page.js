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
  Loader2
} from 'lucide-react'

import Chart from 'chart.js/auto'
import { qcApi } from '@/data/qcApi'
import { useUser } from '@/components/providers/UserContext'

// Import new hooks
import { usePolling, useDebounce, useDebouncedCallback } from '@/hooks'

// Import new components
import { LoadingState, ErrorState, EmptyState, StatsCard, DetectionCard } from '@/components/qc'

const POLL_INTERVAL = 30000 // 30 seconds

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

  // Keyboard shortcuts
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
      if (qcStatsChartInstance.current) qcStatsChartInstance.current.destroy()
      if (detectionTrendChartInstance.current) detectionTrendChartInstance.current.destroy()
      if (priorityDistributionInstance.current) priorityDistributionInstance.current.destroy()
    }

    destroyCharts()

    // Weekly QC Review Stats (Line Chart)
    if (qcStatsChartRef.current && weeklyQCStats.length > 0) {
      qcStatsChartInstance.current = new Chart(qcStatsChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyQCStats.map(d => d.week),
          datasets: [
            {
              label: 'Reviewed',
              data: weeklyQCStats.map(d => d.reviewed || 0),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Approved',
              data: weeklyQCStats.map(d => d.approved || 0),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Pending',
              data: weeklyQCStats.map(d => d.pending || 0),
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
  const needsReviewCount = filteredDetections.filter(d => d.needsReview).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Technician Dashboard</h1>
          <p className="text-gray-600 mt-1">Review, annotate, and approve sewer inspection findings</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#D76A84] to-rose-500 text-white px-4 py-2 rounded-lg hover:from-[#D76A84]/90 hover:to-rose-500/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Stats Grid - Using StatsCard Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          icon={Eye}
          value={pendingCount}
          label="Pending QC"
          iconColor="text-rose-600"
          bgColor="bg-rose-100"
        />
        <StatsCard
          icon={CheckCircle}
          value={approvedCount}
          label="Approved"
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatsCard
          icon={XCircle}
          value={rejectedCount}
          label="Rejected"
          iconColor="text-red-600"
          bgColor="bg-red-100"
        />
        <StatsCard
          icon={AlertTriangle}
          value={needsReviewCount}
          label="Needs Review"
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          icon={Clock}
          value={stats.totalReviewed || 0}
          label="Total Reviewed"
          iconColor="text-pink-600"
          bgColor="bg-pink-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly QC Review Trends</h3>
          <div className="h-64">
            <canvas ref={qcStatsChartRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Detection Types</h3>
          <div className="h-64">
            <canvas ref={detectionTrendChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Priority Distribution</h3>
          <div className="h-64">
            <canvas ref={priorityDistributionRef}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Projects</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
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
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedProject?.id === project.id
                      ? 'border-rose-500 bg-rose-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{project.projectName}</h4>
                      <p className="text-xs text-gray-500 mt-1">{project.operator}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status === 'pending_qc' || project.status === 'pending' ? 'Pending QC' :
                           project.status === 'in_review' || project.status === 'in-review' ? 'In Review' : 
                           project.status === 'completed' ? 'Completed' : 'Processing'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-gray-700">{project.totalDetections} alerts</span>
                      {project.aiProcessingComplete ? (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-yellow-600">Processing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quality Control Review</h3>
              <p className="text-xs text-gray-500 mt-1">
                Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">A</kbd> Approve, 
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">R</kbd> Reject, 
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">↑↓</kbd> Navigate
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search detections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent w-48"
                />
              </div>
              
              {/* Severity Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Needs Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions Bar */}
          {selectedDetections.size > 0 && (
            <div className="mt-4 flex items-center justify-between bg-rose-50 rounded-lg p-3">
              <span className="text-sm text-rose-700 font-medium">
                {selectedDetections.size} detection{selectedDetections.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve All
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedDetections(new Set())}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex">
          {/* Left Panel: Detection List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto max-h-[600px]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* Select All Checkbox */}
                  {filteredDetections.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={selectedDetections.size === filteredDetections.length ? "Deselect all" : "Select all"}
                    >
                      {selectedDetections.size === filteredDetections.length && filteredDetections.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-rose-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <h4 className="font-medium text-gray-900">Detections ({filteredDetections.length})</h4>
                </div>
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                  {filteredDetections.filter(d => d.needsReview).length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {filteredDetections.length === 0 ? (
                  <EmptyState
                    size="sm"
                    variant={debouncedSearchTerm || filterSeverity !== 'all' ? 'search' : 'default'}
                    title={selectedProject ? 'No Detections' : 'Select a Project'}
                    message={
                      debouncedSearchTerm || filterSeverity !== 'all'
                        ? 'No detections match your filters' 
                        : selectedProject 
                          ? 'No detections found for this project' 
                          : 'Select a project to view detections'
                    }
                  />
                ) : (
                  filteredDetections.map((detection) => (
                    <div key={detection.id} className="flex items-start gap-2">
                      {/* Checkbox for bulk selection */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDetectionSelection(detection.id)
                        }}
                        className="mt-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      >
                        {selectedDetections.has(detection.id) ? (
                          <CheckSquare className="w-5 h-5 text-rose-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <DetectionCard
                          detection={detection}
                          isExpanded={expandedDetection === detection.id}
                          isSelected={selectedDetection?.id === detection.id}
                          onSelect={setSelectedDetection}
                          onToggleExpand={(id) => setExpandedDetection(expandedDetection === id ? null : id)}
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
          </div>

          {/* Right Panel: Preview + Tools */}
          <div className="flex-1 p-6">
            {selectedDetection ? (
              <>
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Detection Preview</h4>
                  <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center mb-4 relative">
                    <Image className="h-16 w-16 opacity-30" />
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
                      Frame: {selectedDetection.frameTime}
                    </div>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D76A84] to-rose-500 text-white px-2 py-1 rounded-full text-xs">
                      {selectedDetection.type}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Annotation Tools</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PACP Code</label>
                        <select className="w-full p-2 border border-gray-300 rounded text-sm">
                          <option>Select PACP Code</option>
                          <option>FJ - Joint Defect</option>
                          <option>FC - Circumferential Crack</option>
                          <option>FL - Longitudinal Crack</option>
                          <option>RO - Roots</option>
                          <option>CO - Corrosion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <select className="w-full p-2 border border-gray-300 rounded text-sm">
                          <option>Select Grade</option>
                          <option>1 - Minor</option>
                          <option>2 - Moderate</option>
                          <option>3 - Major</option>
                          <option>4 - Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded text-sm h-24 resize-none"
                          placeholder="Add observations, context, or recommendations..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => handleApproveDetection(selectedDetection)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" /> Finalize & Approve
                  </button>
                  <button
                    onClick={() => handleRejectDetection(selectedDetection)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" /> Reject & Flag
                  </button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Eye}
                title="Select a Detection to Review"
                message="Click on any detection in the list to view its details, preview the frame, and apply your QC decision."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QCTechnicianDashboard
