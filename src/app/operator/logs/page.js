'use client'
import React, { useState, useEffect } from 'react'
import { Search, Filter, Upload, Play, Eye, CheckCircle, Clock, AlertCircle, Download, Share2 } from 'lucide-react'
import { api } from '@/lib/helper'

const LogsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [inspectionLogs, setInspectionLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    qcReview: 0,
    completed: 0
  })

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) return

        // Fetch uploads for this operator
        const uploadsResponse = await api(`/api/uploads/get-all-uploads?uploadedBy=${username}&limit=100`, 'GET')
        if (uploadsResponse.ok && uploadsResponse.data?.data?.uploads) {
          const uploads = uploadsResponse.data.data.uploads
          
          const formattedLogs = uploads.map((upload, index) => ({
            id: upload._id,
            pipelineId: upload.location || `PL-${upload._id.slice(-6)}`,
            location: upload.location || 'Unknown',
            date: new Date(upload.uploadedAt).toISOString().split('T')[0],
            time: new Date(upload.uploadedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            operator: username,
            status: upload.status || 'uploaded',
            aiProcessingStatus: upload.aiStatus === 'processed' ? 'completed' : upload.aiStatus === 'pending' ? 'in-progress' : 'pending',
            qcReviewStatus: upload.qcStatus === 'approved' ? 'completed' : upload.qcStatus === 'pending' ? 'pending' : 'pending',
            videoSize: upload.size || '0 MB',
            duration: upload.duration || 'N/A',
            issuesDetected: upload.defectsFound || 0,
            confidenceScore: upload.confidence || 0,
            deliveryStatus: upload.status === 'completed' ? 'delivered' : 'pending',
            customerNotified: upload.qcStatus === 'approved'
          }))
          
          setInspectionLogs(formattedLogs)
          
          // Calculate stats
          setStats({
            total: formattedLogs.length,
            processing: formattedLogs.filter(l => l.aiProcessingStatus === 'in-progress').length,
            qcReview: formattedLogs.filter(l => l.qcReviewStatus === 'pending').length,
            completed: formattedLogs.filter(l => l.status === 'completed').length
          })
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // Mock data for inspection logs
  const mockInspectionLogs = [
    {
      id: 'INS-2024-001',
      pipelineId: 'PL-Main-Street-001',
      location: 'Main Street & 5th Ave',
      date: '2024-08-30',
      time: '09:15 AM',
      operator: 'John Smith',
      status: 'completed',
      aiProcessingStatus: 'completed',
      qcReviewStatus: 'completed',
      videoSize: '2.4 GB',
      duration: '45:32',
      issuesDetected: 8,
      confidenceScore: 94.2,
      deliveryStatus: 'delivered',
      customerNotified: true
    },
    {
      id: 'INS-2024-002',
      pipelineId: 'PL-Oak-Avenue-012',
      location: 'Oak Avenue Commercial District',
      date: '2024-09-01',
      time: '11:30 AM',
      operator: 'Sarah Johnson',
      status: 'processing',
      aiProcessingStatus: 'in-progress',
      qcReviewStatus: 'pending',
      videoSize: '3.1 GB',
      duration: '52:18',
      issuesDetected: 12,
      confidenceScore: 91.8,
      deliveryStatus: 'pending',
      customerNotified: false
    },
    {
      id: 'INS-2024-003',
      pipelineId: 'PL-Industrial-Zone-005',
      location: 'Industrial Zone East',
      date: '2024-09-01',
      time: '02:45 PM',
      operator: 'Mike Rodriguez',
      status: 'uploaded',
      aiProcessingStatus: 'queued',
      qcReviewStatus: 'pending',
      videoSize: '1.8 GB',
      duration: '38:45',
      issuesDetected: 0,
      confidenceScore: 0,
      deliveryStatus: 'pending',
      customerNotified: false
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'uploaded': case 'queued': case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'delivered': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': case 'delivered': return <CheckCircle size={16} />
      case 'processing': case 'in-progress': return <Clock size={16} className="animate-spin" />
      case 'uploaded': case 'queued': case 'pending': return <AlertCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const filteredLogs = inspectionLogs.filter(log => {
    const matchesFilter = selectedFilter === 'all' || log.status === selectedFilter
    const matchesSearch = log.pipelineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.operator.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading logs data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inspection Logs Dashboard</h1>
          <p className="text-gray-600">Operator workflow management for SewerVision.ai Cloud Platform</p>
        </div>

        {/* Workflow Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">QC Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.qcReview}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by Pipeline ID, Location, or Operator..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="uploaded">Uploaded</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspection Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator & Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Analysis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.pipelineId}</div>
                        <div className="text-sm text-gray-500">{log.location}</div>
                        <div className="text-xs text-gray-400">ID: {log.id}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.operator}</div>
                        <div className="text-sm text-gray-500">{log.date}</div>
                        <div className="text-xs text-gray-400">{log.time}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">Size: {log.videoSize}</div>
                        <div className="text-sm text-gray-500">Duration: {log.duration}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">Issues: {log.issuesDetected}</div>
                        <div className="text-sm text-gray-500">
                          Confidence: {log.confidenceScore ? `${log.confidenceScore}%` : 'Pending'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {/* Upload Status */}
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="ml-1">Upload: {log.status}</span>
                        </div>
                        
                        {/* AI Processing Status */}
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.aiProcessingStatus)}`}>
                          {getStatusIcon(log.aiProcessingStatus)}
                          <span className="ml-1">AI: {log.aiProcessingStatus}</span>
                        </div>
                        
                        {/* QC Review Status */}
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.qcReviewStatus)}`}>
                          {getStatusIcon(log.qcReviewStatus)}
                          <span className="ml-1">QC: {log.qcReviewStatus}</span>
                        </div>
                        
                        {/* Customer Notification */}
                        {log.customerNotified && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                            <CheckCircle size={12} />
                            <span className="ml-1">Customer Notified</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Stream Video">
                          <Play size={18} />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="View Report">
                          <Eye size={18} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Download">
                          <Download size={18} />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" title="Share">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Workflow Progress Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Workflow Process Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-sm">Upload & Store</h4>
              <p className="text-xs text-gray-500 mt-1">Field capture to cloud</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-sm">AI Processing</h4>
              <p className="text-xs text-gray-500 mt-1">Detect fractures, cracks, roots</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm">QC Review</h4>
              <p className="text-xs text-gray-500 mt-1">PACP certified validation</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-sm">Final Review</h4>
              <p className="text-xs text-gray-500 mt-1">Quality assurance</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Share2 className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-medium text-sm">Delivery</h4>
              <p className="text-xs text-gray-500 mt-1">Customer notification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogsPage