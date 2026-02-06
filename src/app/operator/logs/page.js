'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Upload, 
  Play, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Share2,
  FileText,
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  User,
  Video,
  Zap,
  MoreVertical,
  ChevronRight
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

// Status configuration
const statusConfig = {
  completed: { 
    color: 'bg-green-100 text-green-700 border-green-200', 
    dot: 'bg-green-500',
    label: 'Completed'
  },
  'in-progress': { 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    dot: 'bg-blue-500 animate-pulse',
    label: 'In Progress'
  },
  processing: { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    dot: 'bg-yellow-500 animate-pulse',
    label: 'Processing'
  },
  uploaded: { 
    color: 'bg-purple-100 text-purple-700 border-purple-200', 
    dot: 'bg-purple-500',
    label: 'Uploaded'
  },
  pending: { 
    color: 'bg-gray-100 text-gray-600 border-gray-200', 
    dot: 'bg-gray-400',
    label: 'Pending'
  },
  queued: { 
    color: 'bg-orange-100 text-orange-700 border-orange-200', 
    dot: 'bg-orange-500',
    label: 'Queued'
  }
}

const LogsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [inspectionLogs, setInspectionLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    qcReview: 0,
    completed: 0
  })

  useEffect(() => {
    fetchLogs()
  }, [])

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
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLogs()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inspection logs...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Inspection Logs</h1>
            <p className="text-sm text-gray-600 mt-0.5">Track your uploads and workflow status</p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2 border-gray-300"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid - Matching operator design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Inspections</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">All uploads</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">AI Processing</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processing}</p>
                <p className="text-xs text-gray-400 mt-1">In queue</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">QC Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.qcReview}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Eye className="w-6 h-6 text-white" />
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
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Pipeline ID, Location, or Operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus-visible:ring-blue-500"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-[180px] border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Logs Cards */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left Section - Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex-shrink-0">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {log.pipelineId}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {log.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.operator}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Play Video
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Video Info & Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Video Size</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{log.videoSize}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{log.duration}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Issues Found</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{log.issuesDetected}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">AI Confidence</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {log.confidenceScore ? `${log.confidenceScore}%` : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status Pipeline */}
                  <div className="lg:w-64 flex-shrink-0">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Workflow Status</p>
                      
                      {/* Upload Status */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">Upload</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[log.status]?.color || statusConfig.pending.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[log.status]?.dot || statusConfig.pending.dot}`} />
                          {statusConfig[log.status]?.label || 'Pending'}
                        </span>
                      </div>

                      {/* AI Processing Status */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">AI Analysis</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[log.aiProcessingStatus]?.color || statusConfig.pending.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[log.aiProcessingStatus]?.dot || statusConfig.pending.dot}`} />
                          {statusConfig[log.aiProcessingStatus]?.label || 'Pending'}
                        </span>
                      </div>

                      {/* QC Review Status */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">QC Review</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[log.qcReviewStatus]?.color || statusConfig.pending.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[log.qcReviewStatus]?.dot || statusConfig.pending.dot}`} />
                          {statusConfig[log.qcReviewStatus]?.label || 'Pending'}
                        </span>
                      </div>

                      {/* Customer Notification */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">Delivery</span>
                        {log.customerNotified ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspection logs found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'No inspections have been uploaded yet.'}
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

      {/* AI Workflow Process Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            AI Workflow Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Upload</h4>
              <p className="text-xs text-gray-500 mt-1">Field to cloud</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">AI Processing</h4>
              <p className="text-xs text-gray-500 mt-1">Defect detection</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">QC Review</h4>
              <p className="text-xs text-gray-500 mt-1">PACP validation</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Final Review</h4>
              <p className="text-xs text-gray-500 mt-1">Quality check</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Delivery</h4>
              <p className="text-xs text-gray-500 mt-1">Customer notify</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogsPage
