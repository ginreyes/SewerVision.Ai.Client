'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { BarChart3, Brain, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardSkeleton } from '@/components/shared/SkeletonLoading'
import dashboardApi from '@/data/dashboardApi'
import { useCharts } from '@/components/admin/dashboard/useCharts'
import OverviewTab from '@/components/admin/dashboard/OverviewTab'
import AiModelsTab from '@/components/admin/dashboard/AiModelsTab'
import QcReviewTab from '@/components/admin/dashboard/QcReviewTab'
import { useSocket } from '@/components/providers/SocketProvider'
import { useUser } from '@/components/providers/UserContext'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ai-models', label: 'AI Models', icon: Brain },
  { id: 'qc-review', label: 'QC Review', icon: Shield },
]

const AdminDashboard = () => {
  const socket = useSocket()
  const { userData } = useUser()
  const [activeTab, setActiveTab] = useState('overview')

  // Data state
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0, activeInspections: 0, aiProcessing: 0,
    pendingQC: 0, completed: 0, aiAccuracy: 0
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [qcReviewProjects, setQcReviewProjects] = useState([])
  const [aiDetections, setAiDetections] = useState([])
  const [productivityData, setProductivityData] = useState([])
  const [workflowData, setWorkflowData] = useState([])
  const [defectTrendData, setDefectTrendData] = useState([])
  const [aiPerformanceData, setAiPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.getDashboardStats()
      setProjectStats(data.projectStats)
      setRecentProjects(data.recentProjects || [])
      setQcReviewProjects(data.qcReviewProjects || [])
      setAiDetections(data.aiDetections || [])
      setProductivityData(data.productivityData || [])
      setWorkflowData(data.workflowData || [])
      setDefectTrendData(data.defectTrendData || [])
      setAiPerformanceData(data.aiPerformanceData || [])
    } catch (err) {
      const errorMsg = err?.message || 'Failed to load dashboard data'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboardData() }, [fetchDashboardData])

  // Auto-refresh when AI is processing
  useEffect(() => {
    if (projectStats.aiProcessing <= 0) return
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [projectStats.aiProcessing, fetchDashboardData])

  // Real-time Socket.IO dashboard updates
  useEffect(() => {
    if (!socket?.on) return
    const handleUpdate = () => fetchDashboardData()
    socket.on('dashboard-update', handleUpdate)
    socket.on('project-status-changed', handleUpdate)
    return () => { socket.off?.('dashboard-update', handleUpdate); socket.off?.('project-status-changed', handleUpdate) }
  }, [socket, fetchDashboardData])

  // Chart management
  const { getCanvasRef } = useCharts({
    activeTab, aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {userData?.first_name ? `Welcome, ${userData.first_name}` : 'Admin Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:!text-gray-300 mt-0.5">
            Monitor the platform at a glance
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-[#27272a]">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-gray-500 dark:!text-gray-300 hover:text-gray-700 dark:hover:!text-white hover:border-gray-300 dark:hover:border-[#3f3f46]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {loading && <DashboardSkeleton />}

      {!loading && activeTab === 'overview' && (
        <OverviewTab projectStats={projectStats} recentProjects={recentProjects} getCanvasRef={getCanvasRef} />
      )}

      {!loading && activeTab === 'ai-models' && (
        <AiModelsTab aiDetections={aiDetections} getCanvasRef={getCanvasRef} />
      )}

      {!loading && activeTab === 'qc-review' && (
        <QcReviewTab qcReviewProjects={qcReviewProjects} projectStats={projectStats} recentProjects={recentProjects} />
      )}
    </div>
  )
}

export default AdminDashboard
