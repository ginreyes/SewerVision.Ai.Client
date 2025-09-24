'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Video,
  FileText,
  Clock,
  User,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react'

// Chart.js setup (ensure you've installed chart.js and react-chartjs-2)
import Chart from 'chart.js/auto'

const QCTechnicianDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [activeTab, setActiveTab] = useState('review')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedDetection, setExpandedDetection] = useState(null)
  const [selectedDetection, setSelectedDetection] = useState(null)

  // Chart refs
  const qcStatsChartRef = useRef(null)
  const detectionTrendChartRef = useRef(null)
  const priorityDistributionRef = useRef(null)

  // Chart instances
  const qcStatsChartInstance = useRef(null)
  const detectionTrendChartInstance = useRef(null)
  const priorityDistributionInstance = useRef(null)

  // Mock data for projects pending QC review
  const pendingProjects = [
    {
      id: 1,
      projectName: "Main St Pipeline - Section A",
      uploadDate: "2025-09-16",
      operator: "John Smith",
      aiProcessingComplete: true,
      totalDetections: 23,
      highConfidence: 18,
      mediumConfidence: 4,
      lowConfidence: 1,
      status: "pending_qc",
      duration: "45:30",
      pipeLength: "1,250 ft",
      priority: "high"
    },
    {
      id: 2,
      projectName: "Oak Ave Lateral Inspection",
      uploadDate: "2025-09-16",
      operator: "Sarah Johnson",
      aiProcessingComplete: true,
      totalDetections: 8,
      highConfidence: 6,
      mediumConfidence: 2,
      lowConfidence: 0,
      status: "in_review",
      duration: "22:15",
      pipeLength: "450 ft",
      priority: "medium"
    },
    {
      id: 3,
      projectName: "Industrial District - Line 3",
      uploadDate: "2025-09-15",
      operator: "Mike Torres",
      aiProcessingComplete: false,
      totalDetections: 0,
      status: "processing",
      duration: "68:42",
      pipeLength: "2,100 ft",
      priority: "low"
    }
  ]

  // Mock AI detections for selected project
  const aiDetections = [
    {
      id: 1,
      type: "Fracture",
      confidence: 92,
      frameTime: "12:34",
      location: "Station 245+15",
      severity: "Major",
      clockPosition: "3:00-9:00",
      description: "Circumferential fracture detected",
      needsReview: true,
      qcStatus: "pending"
    },
    {
      id: 2,
      type: "Root Intrusion",
      confidence: 87,
      frameTime: "15:22",
      location: "Station 267+42",
      severity: "Moderate",
      clockPosition: "12:00-4:00",
      description: "Fine root mass visible",
      needsReview: false,
      qcStatus: "approved"
    },
    {
      id: 3,
      type: "Crack",
      confidence: 76,
      frameTime: "18:45",
      location: "Station 289+08",
      severity: "Minor",
      clockPosition: "6:00",
      description: "Longitudinal crack",
      needsReview: true,
      qcStatus: "pending"
    },
    {
      id: 4,
      type: "Broken Pipe",
      confidence: 95,
      frameTime: "23:11",
      location: "Station 312+33",
      severity: "Critical",
      clockPosition: "Full circumference",
      description: "Complete pipe collapse",
      needsReview: false,
      qcStatus: "approved"
    }
  ]

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_qc': return 'bg-yellow-100 text-yellow-700'
      case 'in_review': return 'bg-blue-100 text-blue-700'
      case 'processing': return 'bg-gray-100 text-gray-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'bg-green-100 text-green-700'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700'
      case 'Major': return 'bg-orange-100 text-orange-700'
      case 'Moderate': return 'bg-yellow-100 text-yellow-700'
      case 'Minor': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock Charts Data
  const weeklyQCStats = [
    { week: 'W1', reviewed: 12, approved: 8, rejected: 2, pending: 2 },
    { week: 'W2', reviewed: 15, approved: 11, rejected: 1, pending: 3 },
    { week: 'W3', reviewed: 18, approved: 15, rejected: 0, pending: 3 },
    { week: 'W4', reviewed: 20, approved: 17, rejected: 2, pending: 1 },
  ]

  const detectionTypes = [
    { type: 'Fracture', count: 18 },
    { type: 'Root Intrusion', count: 12 },
    { type: 'Crack', count: 9 },
    { type: 'Broken Pipe', count: 5 },
    { type: 'Deposits', count: 7 },
    { type: 'Corrosion', count: 4 },
  ]

  const priorityDistribution = [
    { priority: 'High', count: 15 },
    { priority: 'Medium', count: 22 },
    { priority: 'Low', count: 8 },
  ]

  // Initialize Charts
  useEffect(() => {
    const destroyCharts = () => {
      if (qcStatsChartInstance.current) qcStatsChartInstance.current.destroy()
      if (detectionTrendChartInstance.current) detectionTrendChartInstance.current.destroy()
      if (priorityDistributionInstance.current) priorityDistributionInstance.current.destroy()
    }

    destroyCharts()

    // Weekly QC Review Stats (Line Chart)
    if (qcStatsChartRef.current) {
      qcStatsChartInstance.current = new Chart(qcStatsChartRef.current, {
        type: 'line',
        data: {
          labels: weeklyQCStats.map(d => d.week),
          datasets: [
            {
              label: 'Reviewed',
              data: weeklyQCStats.map(d => d.reviewed),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Approved',
              data: weeklyQCStats.map(d => d.approved),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 2
            },
            {
              label: 'Pending',
              data: weeklyQCStats.map(d => d.pending),
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
    if (detectionTrendChartRef.current) {
      detectionTrendChartInstance.current = new Chart(detectionTrendChartRef.current, {
        type: 'bar',
        data: {
          labels: detectionTypes.map(d => d.type),
          datasets: [{
            label: 'Total Detections',
            data: detectionTypes.map(d => d.count),
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
    if (priorityDistributionRef.current) {
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
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Technician Dashboard</h1>
          <p className="text-gray-600 mt-1">Review, annotate, and approve sewer inspection findings</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingProjects.filter(p => p.status === 'pending_qc').length}</p>
          <p className="text-sm text-gray-600">Pending QC</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{aiDetections.filter(d => d.qcStatus === 'approved').length}</p>
          <p className="text-sm text-gray-600">Approved</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{aiDetections.filter(d => d.qcStatus === 'rejected').length}</p>
          <p className="text-sm text-gray-600">Rejected</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{aiDetections.filter(d => d.needsReview).length}</p>
          <p className="text-sm text-gray-600">Needs Review</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">18m</p>
          <p className="text-sm text-gray-600">Avg Review Time</p>
        </div>
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
            {pendingProjects.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{project.projectName}</h4>
                    <p className="text-xs text-gray-500 mt-1">{project.operator} • {project.duration}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status === 'pending_qc' ? 'Pending QC' :
                         project.status === 'in_review' ? 'In Review' : 'Processing'}
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
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quality Control Review</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search detections..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Detections</option>
                <option value="pending">Needs Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Panel: Detection List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Detections ({aiDetections.length})</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {aiDetections.filter(d => d.needsReview).length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {aiDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      expandedDetection === detection.id || selectedDetection?.id === detection.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setExpandedDetection(expandedDetection === detection.id ? null : detection.id)
                      setSelectedDetection(detection)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm truncate">{detection.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(detection.severity)}`}>
                            {detection.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(detection.confidence)}`}>
                            {detection.confidence}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {detection.frameTime} | {detection.location}
                        </p>
                        <p className="text-xs text-gray-500 italic line-clamp-1">{detection.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {detection.needsReview && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {expandedDetection === detection.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {expandedDetection === detection.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex gap-2 mb-3">
                          <button className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                          <button className="flex-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center justify-center gap-1">
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </div>
                        <button className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1">
                          <Video className="h-3 w-3" /> Jump to Frame
                        </button>
                      </div>
                    )}
                  </div>
                ))}
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
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
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
                  <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Finalize & Approve
                  </button>
                  <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5" /> Reject & Flag
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Eye className="h-16 w-16 mb-4 opacity-40" />
                <h4 className="text-lg font-medium mb-2">Select a Detection to Review</h4>
                <p className="max-w-md">
                  Click on any detection in the list to view its details, preview the frame, and apply your QC decision.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QCTechnicianDashboard