'use client'
import React, { useState, useEffect } from 'react'
import { FileText, Download, Eye, Filter, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Search, Printer, Share2, BarChart3 } from 'lucide-react'
import { api } from '@/lib/helper'

const ReportsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [dateRange, setDateRange] = useState('week')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReports, setSelectedReports] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inReview: 0,
    totalFootage: 0
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) return

        // Get user ID
        const userResponse = await api(`/api/users/role/${username}`, 'GET')
        if (!userResponse.ok || !userResponse.data?._id) return

        const userId = userResponse.data._id

        // Fetch operator reports
        const reportsResponse = await api(`/api/reports/get-operator-reports/${userId}`, 'GET')
        if (reportsResponse.ok && reportsResponse.data?.data) {
          const reportsData = reportsResponse.data.data
          
          const formattedReports = reportsData.map(report => ({
            id: report._id,
            inspectionId: report.inspectionId || `INS-${report._id.slice(-6)}`,
            location: report.location || 'Unknown',
            date: report.date || new Date().toISOString().split('T')[0],
            status: report.status || 'pending',
            operator: report.operator?.first_name && report.operator?.last_name
              ? `${report.operator.first_name} ${report.operator.last_name}`
              : username,
            footage: report.footage || '0 ft',
            aiDetections: report.aiDetections || 0,
            issues: report.issues || [],
            confidence: report.confidence || 0,
            reportType: report.reportType || 'PACP',
            truck: report.truck || 'N/A'
          }))
          
          setReports(formattedReports)
          
          if (reportsResponse.data.stats) {
            setStats(reportsResponse.data.stats)
          }
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const mockReports = [
    {
      id: 1,
      inspectionId: 'INS-2024-001',
      location: 'Main St & 1st Ave',
      date: '2024-08-20',
      status: 'completed',
      operator: 'John Smith',
      footage: '250 ft',
      aiDetections: 12,
      issues: ['Cracks', 'Root Intrusion'],
      confidence: 94.2,
      reportType: 'PACP',
      truck: 'Truck A'
    },
    {
      id: 2,
      inspectionId: 'INS-2024-002',
      location: 'Oak Ave Pipeline',
      date: '2024-08-20',
      status: 'in-review',
      operator: 'Sarah Johnson',
      footage: '180 ft',
      aiDetections: 8,
      issues: ['Fractures', 'Debris'],
      confidence: 89.7,
      reportType: 'PACP',
      truck: 'Truck B'
    },
    {
      id: 3,
      inspectionId: 'INS-2024-003',
      location: 'Broadway Segment 1-3',
      date: '2024-08-19',
      status: 'completed',
      operator: 'Mike Davis',
      footage: '420 ft',
      aiDetections: 23,
      issues: ['Broken Pipe', 'Offset Joints'],
      confidence: 96.8,
      reportType: 'PACP',
      truck: 'Truck C'
    },
    {
      id: 4,
      inspectionId: 'INS-2024-004',
      location: 'Pine St Lateral',
      date: '2024-08-19',
      status: 'pending',
      operator: 'John Smith',
      footage: '95 ft',
      aiDetections: 3,
      issues: ['Minor Cracks'],
      confidence: 87.3,
      reportType: 'PACP',
      truck: 'Truck A'
    },
    {
      id: 5,
      inspectionId: 'INS-2024-005',
      location: 'Elm St Main Line',
      date: '2024-08-18',
      status: 'completed',
      operator: 'Sarah Johnson',
      footage: '380 ft',
      aiDetections: 15,
      issues: ['Root Intrusion', 'Scaling'],
      confidence: 92.1,
      reportType: 'PACP',
      truck: 'Truck B'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-review': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter
    const matchesSearch = report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.inspectionId.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(r => r.id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading reports data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspection Reports</h1>
              <p className="text-gray-600 mt-1">View and manage PACP inspection reports</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Footage</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalFootage} ft</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-review">In Review</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReports.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analysis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues Found</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => handleSelectReport(report.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.inspectionId}</div>
                        <div className="text-sm text-gray-500">{report.date} • {report.operator}</div>
                        <div className="text-sm text-gray-500">{report.truck} • {report.footage}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{report.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">{report.status.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.aiDetections} detections</div>
                        <div className="text-sm text-gray-500">{report.confidence}% confidence</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {report.issues.map((issue, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* AI-Enhanced Reporting Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">AI-Enhanced PACP Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Automated Detection</h3>
              <p className="text-sm text-gray-600">AI identifies pipe issues with confidence scores</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">PACP Compliance</h3>
              <p className="text-sm text-gray-600">Reports meet all PACP certification standards</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">QC Review</h3>
              <p className="text-sm text-gray-600">Certified technicians validate all AI outputs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage