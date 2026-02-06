'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Printer, 
  Share2, 
  BarChart3,
  RefreshCw,
  Loader2,
  User,
  Truck,
  TrendingUp,
  Zap,
  MoreVertical,
  ChevronRight,
  Activity
} from 'lucide-react'
import { api } from '@/lib/helper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAlert } from '@/components/providers/AlertProvider'
import GenerateReportModal from './components/GenerateReportModal'

// Status configuration matching operator design
const statusConfig = {
  completed: { 
    color: 'bg-green-100 text-green-700 border-green-200', 
    dot: 'bg-green-500',
    label: 'Completed',
    icon: CheckCircle
  },
  'in-review': { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    dot: 'bg-yellow-500 animate-pulse',
    label: 'In Review',
    icon: Clock
  },
  pending: { 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    dot: 'bg-blue-500',
    label: 'Pending',
    icon: AlertTriangle
  },
  draft: { 
    color: 'bg-gray-100 text-gray-600 border-gray-200', 
    dot: 'bg-gray-400',
    label: 'Draft',
    icon: FileText
  }
}

const ReportsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReports, setSelectedReports] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inReview: 0,
    totalFootage: 0
  })
  const { showAlert } = useAlert()
  
  // Generate Report Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportForm, setReportForm] = useState({
    projectId: '',
    reportTitle: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    reportType: 'PACP',
    footage: '',
    location: '',
    notes: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (showGenerateModal) {
      fetchProjects()
    }
  }, [showGenerateModal])

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
          inspectionId: report.reportId || `INS-${report._id.slice(-6)}`,
          location: report.project?.location || report.location || 'Unknown',
          date: report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A',
          time: report.createdAt ? new Date(report.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          status: report.status || 'pending',
          operator: report.createdBy?.first_name && report.createdBy?.last_name
            ? `${report.createdBy.first_name} ${report.createdBy.last_name}`
            : username,
          footage: report.totalFootage || '0 ft',
          aiDetections: report.aiDetections || 0,
          issues: report.defects?.map(d => d.type) || [],
          confidence: report.averageConfidence || 0,
          reportType: report.type || 'PACP',
          projectName: report.project?.name || 'N/A'
        }))
        
        setReports(formattedReports)
        
        // Calculate stats
        const totalFootage = formattedReports.reduce((sum, r) => {
          const footage = parseInt(r.footage) || 0
          return sum + footage
        }, 0)

        setStats({
          total: formattedReports.length,
          completed: formattedReports.filter(r => r.status === 'completed').length,
          inReview: formattedReports.filter(r => r.status === 'in-review').length,
          totalFootage: totalFootage
        })
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      showAlert('Failed to load reports', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchReports()
  }

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const username = localStorage.getItem('username')
      if (!username) return

      // Get user data
      const userResponse = await api(`/api/users/role/${username}`, 'GET')
      if (!userResponse.ok || !userResponse.data?._id) return

      const userId = userResponse.data._id

      // Fetch projects assigned to this operator
      const projectsResponse = await api(`/api/projects/get-all-project`, 'GET')
      if (projectsResponse.ok && projectsResponse.data) {
        // Filter projects where operator is assigned
        const operatorProjects = projectsResponse.data.filter(project => 
          project.assignedOperator?.userId === userId
        )
        setProjects(operatorProjects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      showAlert('Failed to load projects', 'error')
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      // Validation
      if (!reportForm.projectId) {
        showAlert('Please select a project', 'error')
        return
      }
      if (!reportForm.reportTitle) {
        showAlert('Please enter a report title', 'error')
        return
      }

      setGenerating(true)

      const username = localStorage.getItem('username')
      if (!username) {
        showAlert('User not found', 'error')
        return
      }

      // Get user ID
      const userResponse = await api(`/api/users/role/${username}`, 'GET')
      if (!userResponse.ok || !userResponse.data?._id) {
        showAlert('Failed to get user information', 'error')
        return
      }

      const operatorId = userResponse.data._id

      // Prepare report data
      const reportData = {
        projectId: reportForm.projectId,
        operator: operatorId,
        reportTitle: reportForm.reportTitle,
        location: reportForm.location || 'N/A',
        date: reportForm.inspectionDate,
        reportType: reportForm.reportType,
        footage: reportForm.footage || '0',
        status: 'draft',
        aiDetections: 0,
        confidence: 0,
        issues: [],
        notes: reportForm.notes || ''
      }

      // Create report
      const response = await api('/api/reports/create-report', 'POST', reportData)

      if (response.ok) {
        showAlert('Report generated successfully!', 'success')
        setShowGenerateModal(false)
        // Reset form
        setReportForm({
          projectId: '',
          reportTitle: '',
          inspectionDate: new Date().toISOString().split('T')[0],
          reportType: 'PACP',
          footage: '',
          location: '',
          notes: ''
        })
        // Refresh reports list
        fetchReports()
      } else {
        showAlert(response.message || 'Failed to generate report', 'error')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      showAlert('Failed to generate report', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter
    const matchesSearch = report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.projectName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleBulkDownload = () => {
    showAlert(`Downloading ${selectedReports.length} report(s)...`, 'info')
    // TODO: Implement bulk download
  }

  const handleBulkShare = () => {
    showAlert(`Sharing ${selectedReports.length} report(s)...`, 'info')
    // TODO: Implement bulk share
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inspection reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection Reports</h1>
            <p className="text-sm text-gray-600 mt-0.5">View and manage PACP inspection reports</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            size="sm"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid - Matching operator design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">All inspections</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                <p className="text-xs text-gray-400 mt-1">Delivered</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">In Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inReview}</p>
                <p className="text-xs text-gray-400 mt-1">QC pending</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Footage</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFootage}</p>
                <p className="text-xs text-gray-400 mt-1">Feet inspected</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Inspection ID, Location, or Project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus-visible:ring-blue-500"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-[160px] border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[160px] border-gray-300">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedReports.length > 0 && (
        <Card className="border-0 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium text-sm">
                {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button onClick={handleBulkDownload} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button onClick={handleBulkShare} size="sm" variant="outline" className="gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button 
                  onClick={() => setSelectedReports([])} 
                  size="sm" 
                  variant="ghost"
                  className="text-gray-600"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select All Card */}
      {filteredReports.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Select All ({filteredReports.length})</span>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Reports Cards */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const config = statusConfig[report.status] || statusConfig.pending
            const StatusIcon = config.icon
            const isSelected = selectedReports.includes(report.id)

            return (
              <Card 
                key={report.id} 
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectReport(report.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left Section - Report Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {report.inspectionId}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{report.projectName}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {report.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {report.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {report.operator}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Footage</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{report.footage}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">AI Detections</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{report.aiDetections}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Confidence</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {report.confidence ? `${report.confidence}%` : 'N/A'}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Type</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">{report.reportType}</p>
                            </div>
                          </div>

                          {/* Issues Found */}
                          {report.issues.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Issues Detected</p>
                              <div className="flex flex-wrap gap-2">
                                {report.issues.slice(0, 4).map((issue, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                                {report.issues.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{report.issues.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Status & Actions */}
                        <div className="lg:w-56 flex-shrink-0 space-y-3">
                          {/* Status Badge */}
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${config.color}`}>
                              <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                              {config.label}
                            </span>
                          </div>

                          {/* Action Dropdown */}
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full gap-2">
                                  <MoreVertical className="w-4 h-4" />
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Report
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print Report
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'No inspection reports available yet.'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI-Enhanced Reporting Info */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            AI-Enhanced PACP Reporting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-2">Automated Detection</h3>
              <p className="text-sm text-gray-600 text-center">AI identifies pipe issues with confidence scores</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-2">PACP Compliance</h3>
              <p className="text-sm text-gray-600 text-center">Reports meet all PACP certification standards</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-2">QC Review</h3>
              <p className="text-sm text-gray-600 text-center">Certified technicians validate all AI outputs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Modal */}
      <GenerateReportModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        projects={projects}
        loadingProjects={loadingProjects}
        reportForm={reportForm}
        setReportForm={setReportForm}
        onGenerate={handleGenerateReport}
        generating={generating}
      />
    </div>
  )
}

export default ReportsPage
