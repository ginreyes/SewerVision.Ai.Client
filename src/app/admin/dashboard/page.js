'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Camera, BarChart3, Brain, Shield, Loader2, RefreshCw } from 'lucide-react'
import dashboardApi from '@/data/dashboardApi'
import { useCharts } from '@/components/admin/dashboard/useCharts'
import OverviewTab from '@/components/admin/dashboard/OverviewTab'
import AiModelsTab from '@/components/admin/dashboard/AiModelsTab'
import QcReviewTab from '@/components/admin/dashboard/QcReviewTab'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ai-models', label: 'AI Models', icon: Brain },
  { id: 'qc-review', label: 'QC Review', icon: Shield },
]

const AdminDashboard = () => {
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

  // Chart management
  const { getCanvasRef } = useCharts({
    activeTab, aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData
  })

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">SewerVision.ai</h1>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">Dashboard</span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <OverviewTab projectStats={projectStats} recentProjects={recentProjects} getCanvasRef={getCanvasRef} />
        )}

        {activeTab === 'ai-models' && (
          <AiModelsTab aiDetections={aiDetections} getCanvasRef={getCanvasRef} />
        )}

        {activeTab === 'qc-review' && (
          <QcReviewTab qcReviewProjects={qcReviewProjects} projectStats={projectStats} recentProjects={recentProjects} />
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
