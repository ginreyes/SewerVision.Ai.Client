'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Edit3,
  Share2,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  BarChart3,
  Zap,
  Database,
  Camera,
  Brain,
  Shield,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import dashboardApi from '@/data/dashboardApi'

// Lazy load Chart.js for better performance
const loadChart = async () => {
  const chartModule = await import('chart.js/auto');
  return chartModule.default || chartModule;
};

const AdminDashboard = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

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

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']
  const [ChartLoaded, setChartLoaded] = useState(false);

  // Data state
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeInspections: 0,
    aiProcessing: 0,
    pendingQC: 0,
    completed: 0,
    aiAccuracy: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [aiDetections, setAiDetections] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [workflowData, setWorkflowData] = useState([]);
  const [defectTrendData, setDefectTrendData] = useState([]);
  const [aiPerformanceData, setAiPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardApi.getDashboardStats();

      setProjectStats(data.projectStats);
      setRecentProjects(data.recentProjects || []);
      setAiDetections(data.aiDetections || []);
      setProductivityData(data.productivityData || []);
      setWorkflowData(data.workflowData || []);
      setDefectTrendData(data.defectTrendData || []);
      setAiPerformanceData(data.aiPerformanceData || []);
    } catch (err) {
      // Safely extract and log error
      try {
        const errorMsg = err?.message || err?.toString() || 'Failed to load dashboard data';
        // Use console.log instead of console.error to avoid Next.js error handler interception
        console.log('Error fetching dashboard data:', errorMsg);
        setError(errorMsg);
      } catch (logError) {
        // If we can't extract error, set a generic message
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard every 10 seconds when there are projects in AI processing
  useEffect(() => {
    const hasProcessingProjects = projectStats.aiProcessing > 0;

    if (!hasProcessingProjects) return; // Don't poll if nothing is processing

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [projectStats.aiProcessing, fetchDashboardData]);

  // Lazy load Chart.js
  useEffect(() => {
    loadChart().then((Chart) => {
      window.Chart = Chart;
      setChartLoaded(true);
    });
  }, []);

  // Memoize chart data
  const memoizedChartData = useMemo(() => ({
    aiDetections,
    workflowData,
    productivityData,
    defectTrendData,
    aiPerformanceData,
    COLORS
  }), [aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData]);

  // Create charts
  useEffect(() => {
    if (!ChartLoaded || !window.Chart) return;

    const Chart = window.Chart;

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
            labels: memoizedChartData.aiDetections.map(d => d.type),
            datasets: [{
              data: memoizedChartData.aiDetections.map(d => d.count),
              backgroundColor: memoizedChartData.COLORS,
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
                  label: function (context) {
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
            labels: memoizedChartData.workflowData.map(d => d.name),
            datasets: [{
              data: memoizedChartData.workflowData.map(d => d.value),
              backgroundColor: memoizedChartData.workflowData.map(d => d.color),
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
            labels: memoizedChartData.productivityData.map(d => d.month),
            datasets: [
              {
                label: 'Manual Processing',
                data: memoizedChartData.productivityData.map(d => d.manual),
                backgroundColor: '#EF4444',
                borderRadius: 4
              },
              {
                label: 'AI Processing',
                data: memoizedChartData.productivityData.map(d => d.ai),
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
            labels: memoizedChartData.productivityData.map(d => d.month),
            datasets: [{
              label: 'AI Accuracy %',
              data: memoizedChartData.productivityData.map(d => d.accuracy),
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
            labels: memoizedChartData.defectTrendData.map(d => d.week),
            datasets: [
              {
                label: 'Fractures',
                data: memoizedChartData.defectTrendData.map(d => d.fractures),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Cracks',
                data: memoizedChartData.defectTrendData.map(d => d.cracks),
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Broken Pipes',
                data: memoizedChartData.defectTrendData.map(d => d.broken),
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.3)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Root Intrusion',
                data: memoizedChartData.defectTrendData.map(d => d.roots),
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
            labels: memoizedChartData.aiPerformanceData.map(d => d.metric),
            datasets: [{
              label: 'Accuracy %',
              data: memoizedChartData.aiPerformanceData.map(d => d.value),
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
  }, [activeTab, ChartLoaded, memoizedChartData])

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

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ai-processing': return 'bg-blue-100 text-blue-800'
      case 'qc-review': return 'bg-yellow-100 text-yellow-800'
      case 'uploading': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'ai-processing': return <Brain className="w-4 h-4" />
      case 'qc-review': return <Eye className="w-4 h-4" />
      case 'uploading': return <Upload className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }, []);

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
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh Dashboard"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/admin/uploads')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </button>
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
              { id: 'ai-models', label: 'AI Models', icon: Brain },
              { id: 'qc-review', label: 'QC Review', icon: Shield },
              { id: 'reports', label: 'Reports', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                  <button
                    onClick={() => router.push('/admin/project')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
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
                      {recentProjects.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
                            No projects found
                          </td>
                        </tr>
                      ) : (
                        recentProjects.map((project) => (
                          <tr key={project.id} className="border-b border-gray-100">
                            <td className="py-4">
                              <p className="font-medium text-gray-900">{project.name}</p>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)}
                                <span className="capitalize">{project.status?.replace(/-/g, ' ') || 'Unknown'}</span>
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${project.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 mt-1">{project.progress || 0}%</span>
                            </td>
                            <td className="py-4 text-gray-700">{project.inspector || 'N/A'}</td>
                            <td className="py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {project.defects || 0}
                              </span>
                            </td>
                            <td className="py-4 text-gray-600 text-sm">{project.date || 'N/A'}</td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => router.push(`/admin/project?selectedProject=${project.id}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="View Project"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/admin/project/editProject/${project.id}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Edit Project"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-600" title="Share Project">
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

        {activeTab === 'qc-review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">QC Review Queue</h2>
              <button
                onClick={() => router.push('/admin/task')}
                className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>View All QC Tasks</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.pendingQC}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-amber-600 font-medium">Awaiting QC review</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Review</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {recentProjects.filter(p => p.status === 'qc-review').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-blue-600 font-medium">Currently being reviewed</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">QC approved</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Projects Pending QC Review</h3>
                </div>
              </div>
              <div className="p-6">
                {recentProjects.filter(p => p.status === 'qc-review' || p.status === 'ai-processing').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No projects pending QC review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects
                      .filter(p => p.status === 'qc-review' || p.status === 'ai-processing')
                      .slice(0, 5)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/admin/project/${project.id}`)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {project.inspector} • {project.date}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                                {project.defects || 0} defects found
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/project/${project.id}`)
                            }}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <button
                onClick={() => router.push('/admin/report')}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View All Reports</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.aiAccuracy}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{projectStats.totalProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Completed Projects</h3>
                  <button
                    onClick={() => router.push('/admin/report')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Reports →
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentProjects.filter(p => p.status === 'completed').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No completed projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProjects
                      .filter(p => p.status === 'completed')
                      .slice(0, 5)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/admin/project/${project.id}`)}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Completed by {project.inspector} • {project.date}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                {project.defects || 0} defects
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                Report ready
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/report`)
                            }}
                            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            View Report
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard