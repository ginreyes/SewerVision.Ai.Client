'use client'
import React, { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  Play, 
  Pause, 
  Edit3, 
  Share2, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText, 
  Cloud, 
  Activity,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  BarChart3,
  Zap,
  Database,
  Camera,
  Brain,
  Shield
} from 'lucide-react'

// ✅ Import Chart.js with auto-registration
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState(null)
  
  // Chart refs
  const pieChartRef = useRef(null)
  const workflowChartRef = useRef(null)
  const productivityChartRef = useRef(null)
  const accuracyChartRef = useRef(null)
  const defectTrendChartRef = useRef(null)
  const aiPerformanceChartRef = useRef(null)
  
  // Chart instances
  const pieChartInstance = useRef(null)
  const workflowChartInstance = useRef(null)
  const productivityChartInstance = useRef(null)
  const accuracyChartInstance = useRef(null)
  const defectTrendChartInstance = useRef(null)
  const aiPerformanceChartInstance = useRef(null)

  // Mock data
  const projectStats = {
    totalProjects: 1247,
    activeInspections: 23,
    aiProcessing: 8,
    pendingQC: 15,
    completed: 1201,
    aiAccuracy: 94.2
  }

  const recentProjects = [
    { id: 1, name: "Downtown Main Street", status: "ai-processing", progress: 65, date: "2024-08-14", inspector: "John Davis", defects: 12 },
    { id: 2, name: "Industrial District Pipe A", status: "qc-review", progress: 90, date: "2024-08-13", inspector: "Sarah Wilson", defects: 8 },
    { id: 3, name: "Residential Area B-2", status: "completed", progress: 100, date: "2024-08-12", inspector: "Mike Johnson", defects: 3 },
    { id: 4, name: "Highway Underpass", status: "uploading", progress: 25, date: "2024-08-14", inspector: "Lisa Chen", defects: 0 },
  ]

  const aiDetections = [
    { type: "Fractures", count: 45, confidence: 92.3, trend: "+12%" },
    { type: "Cracks", count: 78, confidence: 89.7, trend: "+8%" },
    { type: "Broken Pipes", count: 23, confidence: 95.1, trend: "-3%" },
    { type: "Root Intrusion", count: 34, confidence: 87.9, trend: "+15%" },
  ]

  // Chart data
  const productivityData = [
    { month: 'Jan', manual: 45, ai: 78, accuracy: 89 },
    { month: 'Feb', manual: 52, ai: 89, accuracy: 91 },
    { month: 'Mar', manual: 48, ai: 95, accuracy: 92 },
    { month: 'Apr', manual: 61, ai: 112, accuracy: 93 },
    { month: 'May', manual: 55, ai: 125, accuracy: 94 },
    { month: 'Jun', manual: 67, ai: 142, accuracy: 94.2 },
  ]

  const workflowData = [
    { name: 'Upload & Store', value: 23, color: '#3B82F6' },
    { name: 'AI Processing', value: 8, color: '#8B5CF6' },
    { name: 'QC Review', value: 15, color: '#F59E0B' },
    { name: 'Completed', value: 54, color: '#10B981' },
  ]

  const defectTrendData = [
    { week: 'W1', fractures: 12, cracks: 18, broken: 5, roots: 8 },
    { week: 'W2', fractures: 15, cracks: 22, broken: 7, roots: 10 },
    { week: 'W3', fractures: 18, cracks: 25, broken: 6, roots: 12 },
    { week: 'W4', fractures: 14, cracks: 20, broken: 8, roots: 15 },
  ]

  const aiPerformanceData = [
    { metric: 'Overall Accuracy', value: 94.2 },
    { metric: 'Fracture Detection', value: 92.3 },
    { metric: 'Crack Detection', value: 89.7 },
    { metric: 'Broken Pipe Detection', value: 95.1 },
    { metric: 'Root Detection', value: 87.9 },
  ]

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']

  // Create charts
  useEffect(() => {
    // Destroy previous instances
    if (pieChartInstance.current) pieChartInstance.current.destroy()
    if (workflowChartInstance.current) workflowChartInstance.current.destroy()
    if (productivityChartInstance.current) productivityChartInstance.current.destroy()
    if (accuracyChartInstance.current) accuracyChartInstance.current.destroy()
    if (defectTrendChartInstance.current) defectTrendChartInstance.current.destroy()
    if (aiPerformanceChartInstance.current) aiPerformanceChartInstance.current.destroy()

    if (activeTab === 'overview') {
      // AI Detection Pie Chart
      if (pieChartRef.current) {
        pieChartInstance.current = new Chart(pieChartRef.current, {
          type: 'pie',
          data: {
            labels: aiDetections.map(d => d.type),
            datasets: [{
              data: aiDetections.map(d => d.count),
              backgroundColor: COLORS,
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ': ' + context.parsed + ' detected'
                  }
                }
              }
            }
          }
        })
      }

      // Workflow Status Doughnut Chart
      if (workflowChartRef.current) {
        workflowChartInstance.current = new Chart(workflowChartRef.current, {
          type: 'doughnut',
          data: {
            labels: workflowData.map(d => d.name),
            datasets: [{
              data: workflowData.map(d => d.value),
              backgroundColor: workflowData.map(d => d.color),
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              }
            }
          }
        })
      }

      // Productivity Bar Chart
      if (productivityChartRef.current) {
        productivityChartInstance.current = new Chart(productivityChartRef.current, {
          type: 'bar',
          data: {
            labels: productivityData.map(d => d.month),
            datasets: [
              {
                label: 'Manual Processing',
                data: productivityData.map(d => d.manual),
                backgroundColor: '#EF4444',
                borderRadius: 4
              },
              {
                label: 'AI Processing',
                data: productivityData.map(d => d.ai),
                backgroundColor: '#3B82F6',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#E5E7EB'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            }
          }
        })
      }

      // Accuracy Line Chart
      if (accuracyChartRef.current) {
        accuracyChartInstance.current = new Chart(accuracyChartRef.current, {
          type: 'line',
          data: {
            labels: productivityData.map(d => d.month),
            datasets: [{
              label: 'AI Accuracy %',
              data: productivityData.map(d => d.accuracy),
              borderColor: '#10B981',
              backgroundColor: '#10B981',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 85,
                max: 95,
                grid: {
                  color: '#E5E7EB'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        })
      }

      // Defect Trend Area Chart
      if (defectTrendChartRef.current) {
        defectTrendChartInstance.current = new Chart(defectTrendChartRef.current, {
          type: 'line',
          data: {
            labels: defectTrendData.map(d => d.week),
            datasets: [
              {
                label: 'Fractures',
                data: defectTrendData.map(d => d.fractures),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Cracks',
                data: defectTrendData.map(d => d.cracks),
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Broken Pipes',
                data: defectTrendData.map(d => d.broken),
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Root Intrusion',
                data: defectTrendData.map(d => d.roots),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#E5E7EB'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            }
          }
        })
      }
    }

    if (activeTab === 'ai-models') {
      // AI Performance Horizontal Bar Chart
      if (aiPerformanceChartRef.current) {
        aiPerformanceChartInstance.current = new Chart(aiPerformanceChartRef.current, {
          type: 'bar',
          data: {
            labels: aiPerformanceData.map(d => d.metric),
            datasets: [{
              label: 'Accuracy %',
              data: aiPerformanceData.map(d => d.value),
              backgroundColor: '#8B5CF6',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                min: 80,
                max: 100,
                grid: {
                  color: '#E5E7EB'
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        })
      }
    }
  }, [activeTab])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy()
      if (workflowChartInstance.current) workflowChartInstance.current.destroy()
      if (productivityChartInstance.current) productivityChartInstance.current.destroy()
      if (accuracyChartInstance.current) accuracyChartInstance.current.destroy()
      if (defectTrendChartInstance.current) defectTrendChartInstance.current.destroy()
      if (aiPerformanceChartInstance.current) aiPerformanceChartInstance.current.destroy()
    }
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ai-processing': return 'bg-blue-100 text-blue-800'
      case 'qc-review': return 'bg-yellow-100 text-yellow-800'
      case 'uploading': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'ai-processing': return <Brain className="w-4 h-4" />
      case 'qc-review': return <Eye className="w-4 h-4" />
      case 'uploading': return <Upload className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">SewerVision.ai</h1>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Bell className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              <Settings className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'projects', label: 'Projects', icon: Database },
              { id: 'ai-models', label: 'AI Models', icon: Brain },
              { id: 'qc-review', label: 'QC Review', icon: Shield },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map((tab) => (
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.totalProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-green-600 font-medium">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Processing</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.aiProcessing}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-blue-600 font-medium">Active now</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending QC</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.pendingQC}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-orange-600 font-medium">Needs attention</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.aiAccuracy}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-green-600 font-medium">+2.1% this week</span>
                </div>
              </div>
            </div>

            {/* AI Detection Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI Detection Distribution</h3>
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-64">
                  <canvas ref={pieChartRef}></canvas>
                </div>
              </div>

              {/* Workflow Status Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Current Workflow Status</h3>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-64">
                  <canvas ref={workflowChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Productivity & Accuracy Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI vs Manual Productivity</h3>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="h-80">
                  <canvas ref={productivityChartRef}></canvas>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI Accuracy Improvement</h3>
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div className="h-80">
                  <canvas ref={accuracyChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Defect Detection Trends */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Defect Detection Trends (Last 4 Weeks)</h3>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="h-96">
                <canvas ref={defectTrendChartRef}></canvas>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="pb-3">Project</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Progress</th>
                        <th className="pb-3">Inspector</th>
                        <th className="pb-3">Defects</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-3">
                      {recentProjects.map((project) => (
                        <tr key={project.id} className="border-b border-gray-100">
                          <td className="py-4">
                            <p className="font-medium text-gray-900">{project.name}</p>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="capitalize">{project.status.replace('-', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1">{project.progress}%</span>
                          </td>
                          <td className="py-4 text-gray-700">{project.inspector}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {project.defects}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600 text-sm">{project.date}</td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                <span>Upload New Inspection</span>
              </button>
            </div>
            
            {/* Project filters and tools */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {recentProjects.length} of {projectStats.totalProjects} projects
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">AI Model Management</h2>
              <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <Brain className="w-4 h-4" />
                <span>Train Model</span>
              </button>
            </div>
            
            {/* AI Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">AI Model Performance Metrics</h3>
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="h-80">
                <canvas ref={aiPerformanceChartRef}></canvas>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Training Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Training Data</span>
                    <span className="font-semibold text-blue-600">15,420 frames</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Validation Accuracy</span>
                    <span className="font-semibold text-green-600">92.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Training Epochs</span>
                    <span className="font-semibold text-purple-600">847/1000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84.7%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Thresholds</h3>
                <div className="space-y-4">
                  {aiDetections.map((detection, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{detection.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${detection.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{detection.confidence}%</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Adjust</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard