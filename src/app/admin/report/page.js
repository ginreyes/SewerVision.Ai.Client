'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText, Download, Share2, Plus, Search, Filter, Calendar, MapPin,
  User, Camera, Brain, AlertTriangle, CheckCircle, Clock, Eye, MoreVertical,
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Zap,
  Settings, ArrowUpRight, ArrowDownRight, Play, Pause, RefreshCw,
  ExternalLink, Mail, Printer, Archive, Edit, Trash2, Loader2, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAlert } from "@/components/providers/AlertProvider"
import reportsApi from '@/data/reportsApi'

const Reports = () => {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  // Real data state
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    totalInspectionLength: '0km',
    averageConfidence: 0,
    criticalIssues: 0,
    totalDefects: 0,
    averageProcessingTime: '0 hours',
    aiAccuracy: 0,
    monthlyGrowth: 0,
    reportTypes: { pacp: 0, condition: 0, analytics: 0 }
  })

  /* Templates State */
  const [templates, setTemplates] = useState([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', sections: [] }) // Added sections
  const [creatingTemplate, setCreatingTemplate] = useState(false)

  // Generate Report State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    location: '',
    reportType: 'PACP Condition Assessment',
    inspector: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)

  // Rose Gradient Class
  const roseGradientClass = "bg-gradient-to-r from-[#D76A84] to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"

  // Fetch Data (Multi-threaded approach via Promise.all)
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      // Concurrent fetching for better performance
      const [reportsResponse, analyticsResponse, templatesResponse] = await Promise.all([
        reportsApi.getReports({
          status: filterStatus,
          searchTerm: searchQuery,
          dateRange: filterPeriod
        }),
        reportsApi.getReportsAnalytics(filterPeriod),
        reportsApi.getTemplates() // Added templates fetch
      ])

      // Extract actual data arrays/objects from the API response wrappers
      // Backend returns { success: true, data: [...] }
      const reportsList = reportsResponse?.data || []
      const analyticsInfo = analyticsResponse?.data || null
      const templatesList = templatesResponse?.data || []

      setReports(reportsList)
      setTemplates(templatesList) // Set templates

      if (analyticsInfo) {
        setAnalytics(prev => ({
          ...prev,
          ...analyticsInfo
        }))
      }

      // Fetch templates independently
      try {
        const templatesData = await reportsApi.getTemplates();
        if (templatesData) setTemplates(templatesData);
      } catch (err) {
        console.warn('Failed to load templates:', err);
      }

    } catch (error) {
      console.error("Failed to fetch reports data:", error)
      // Fallback toast or error handling could go here
    } finally {
      if (isRefresh) setRefreshing(false)
      else setLoading(false)
    }
  }, [filterStatus, searchQuery, filterPeriod])

  // Initial Load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateReport = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      // Add necessary fields for the backend
      const reportPayload = {
        ...newReport,
        date: new Date().toISOString(),
        status: 'pending',
        aiDetections: 0,
        confidence: 0,
        footage: '0'
      }

      await reportsApi.createReport(reportPayload)

      setIsGenerateOpen(false)
      setNewReport({
        title: '',
        location: '',
        reportType: 'PACP Condition Assessment',
        inspector: '',
        description: ''
      })

      // Refresh list
      fetchData(true)
      showAlert('Report created successfully', 'success')

    } catch (error) {
      console.error("Failed to create report:", error)
      showAlert('Failed to create report', 'error')
    } finally {
      setCreating(false)
    }
  }

  // Template Helpers
  const addSection = () => {
    setNewTemplate(prev => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { name: '', fields: [], order: (prev.sections || []).length }
      ]
    }))
  }

  const removeSection = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const updateSectionName = (index, name) => {
    setNewTemplate(prev => {
      const newSections = [...prev.sections]
      newSections[index] = { ...newSections[index], name }
      return { ...prev, sections: newSections }
    })
  }

  const updateSectionFields = (index, fieldsString) => {
    setNewTemplate(prev => {
      const newSections = [...prev.sections]
      // Split by comma and trim
      const fields = fieldsString.split(',').map(f => f.trim()).filter(f => f)
      newSections[index] = { ...newSections[index], fields }
      return { ...prev, sections: newSections }
    })
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    setCreatingTemplate(true)
    try {
      await reportsApi.createTemplate({
        ...newTemplate,
        // Ensure sections are properly formatted if needed
        sections: newTemplate.sections || []
      })

      setIsTemplateModalOpen(false)
      setNewTemplate({ name: '', description: '', sections: [] })
      showAlert('Template created successfully', 'success')
      fetchData(true) // Refresh to get new template

    } catch (error) {
      console.error("Failed to create template:", error)
      showAlert('Failed to create template', 'error')
    } finally {
      setCreatingTemplate(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in-review':
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <div className="flex items-center mt-1">
                <p className="text-xs text-gray-500">{subtitle}</p>
                {trend !== undefined && (
                  <div className={`flex items-center ml-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span className="text-xs ml-1">{Math.abs(trend)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ReportCard = ({ report }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-[#D76A84]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{report.title || report.location}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {report.reportType || 'Standard'}
              </Badge>
              <Badge variant="outline" className={getStatusColor(report.status)}>
                {report.status?.replace('_', ' ').replace(/-/g, ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-[#D76A84]" />
                {report.location}
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1 text-[#D76A84]" />
                Inspector: {report.inspector || 'Unassigned'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-[#D76A84]" />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {report.status === 'completed' && (
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{report.totalDefects || 0}</div>
              <div className="text-xs text-gray-600">Defects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{report.criticalDefects || 0}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{report.confidence?.toFixed(1) || 0}%</div>
              <div className="text-xs text-gray-600">AI Conf.</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {report.footage ? `${report.footage} ft` : ''}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="hover:border-[#D76A84] hover:text-[#D76A84]">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading && !refreshing && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#D76A84]" />
          <p className="text-gray-500 font-medium">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D76A84] to-rose-600">
                Reports & Analytics
              </h1>
              <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-sm font-medium">
                {analytics.totalReports} Total
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="hover:bg-rose-50 hover:text-rose-600 border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogTrigger asChild>
                  <Button className={roseGradientClass}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Generate New Report</DialogTitle>
                    <DialogDescription>
                      Create a new inspection report. The AI will process uploaded footage.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateReport} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Main Street Inspection"
                        required
                        value={newReport.title}
                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g. Sector 7-G"
                        required
                        value={newReport.location}
                        onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newReport.reportType}
                          onValueChange={(val) => setNewReport({ ...newReport, reportType: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PACP Condition Assessment">PACP Assessment</SelectItem>
                            <SelectItem value="Maintenance Log">Maintenance Log</SelectItem>
                            <SelectItem value="Quick Scan">Quick Scan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inspector">Inspector</Label>
                        <Input
                          id="inspector"
                          placeholder="Investigator Name"
                          value={newReport.inspector}
                          onChange={(e) => setNewReport({ ...newReport, inspector: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea
                        id="desc"
                        placeholder="Additional notes..."
                        value={newReport.description}
                        onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      />
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                      <Button type="submit" className={roseGradientClass} disabled={creating}>
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                          </>
                        ) : (
                          'Create Report'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-4 mb-8 bg-white p-1 rounded-xl border border-gray-100">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#D76A84] data-[state=active]:text-white rounded-lg transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-[#D76A84] data-[state=active]:text-white rounded-lg transition-all"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#D76A84] data-[state=active]:text-white rounded-lg transition-all"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-[#D76A84] data-[state=active]:text-white rounded-lg transition-all"
            >
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Reports"
                value={analytics.totalReports}
                subtitle="This period"
                icon={FileText}
                color="bg-gradient-to-br from-blue-500 to-purple-600"
                trend={analytics.monthlyGrowth}
              />
              <StatCard
                title="Completed"
                value={analytics.completedReports}
                subtitle={`${analytics.pendingReports} pending`}
                icon={CheckCircle}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                title="AI Accuracy"
                value={`${analytics.aiAccuracy}%`}
                subtitle="Avg. Confidence"
                icon={Brain}
                color="bg-gradient-to-br from-[#D76A84] to-pink-600"
              />
              <StatCard
                title="Critical Issues"
                value={analytics.criticalIssues}
                subtitle="Needs Attention"
                icon={AlertTriangle}
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest generated inspection reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report._id || report.id} className="flex items-center justify-between p-4 border border-gray-100 hover:border-rose-100 rounded-lg hover:bg-rose-50/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-lg text-white">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{report.title || 'Untitled Report'}</h4>
                          <p className="text-sm text-gray-500">{report.location} • {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <div className="text-center py-6 text-gray-500">No recent reports found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 focus-visible:ring-[#D76A84]"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Time period" />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <ReportCard key={report._id || report.id} report={report} />
              ))}
              {reports.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No reports match your filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-[#D76A84]" />
                    <span>Report Types Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">PACP Reports</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes?.pacp || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Condition Assessments</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes?.condition || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Analytics Reports</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes?.analytics || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-[#D76A84]" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Processing Time</span>
                        <span>{analytics.averageProcessingTime}</span>
                      </div>
                      <Progress value={75} className="h-2 bg-gray-100" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>AI Accuracy Rate</span>
                        <span>{analytics.aiAccuracy}%</span>
                      </div>
                      <Progress value={analytics.aiAccuracy} className="h-2 bg-gray-100" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Report Completion Rate</span>
                        <span>
                          {analytics.totalReports > 0
                            ? Math.round((analytics.completedReports / analytics.totalReports) * 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.totalReports > 0 ? (analytics.completedReports / analytics.totalReports) * 100 : 0}
                        className="h-2 bg-gray-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured templates for different report types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Create New Template Card/Modal */}
                  <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                    <DialogTrigger asChild>
                      <Card className="border-dashed border-2 border-gray-300 hover:border-[#D76A84] transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[200px]">
                        <CardContent className="p-6 text-center">
                          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-[#D76A84] transition-colors" />
                          <h3 className="font-medium text-gray-900 mb-2">Create New Template</h3>
                          <p className="text-sm text-gray-600">Design a custom report template</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Report Template</DialogTitle>
                        <DialogDescription>Define the structure and sections for your report.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTemplate} className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="t-name">Template Name</Label>
                            <Input
                              id="t-name"
                              value={newTemplate.name}
                              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                              placeholder="e.g., Structural Inspection V2"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="t-desc">Description</Label>
                            <Textarea
                              id="t-desc"
                              value={newTemplate.description}
                              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                              placeholder="Brief description of when to use this template..."
                            />
                          </div>

                          <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">Report Sections</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Section
                              </Button>
                            </div>

                            {newTemplate.sections?.length === 0 && (
                              <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded">
                                No sections added. Click "Add Section" to begin.
                              </p>
                            )}

                            {newTemplate.sections?.map((section, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg border relative group">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                  onClick={() => removeSection(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>

                                <div className="space-y-3">
                                  <div className="grid gap-2">
                                    <Label>Section Name</Label>
                                    <Input
                                      value={section.name}
                                      onChange={(e) => updateSectionName(index, e.target.value)}
                                      placeholder="e.g., Site Conditions"
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Fields (Comma separated)</Label>
                                    <Input
                                      value={section.fields.join(', ')}
                                      onChange={(e) => updateSectionFields(index, e.target.value)}
                                      placeholder="e.g., Weather, Temperature, Surface Type"
                                      className="bg-white"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Enter field names separated by commas.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={creatingTemplate} className="bg-[#D76A84] hover:bg-[#C0556D]">
                            {creatingTemplate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Template
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Fetched Templates */}
                  {templates.map((template) => (
                    <Card key={template._id} className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-[#D76A84]">
                      <CardContent className="p-6">
                        <FileText className="w-12 h-12 text-[#D76A84] mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description || "No description provided."}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <Badge variant="secondary" className="text-xs">
                            {template.sections?.length || 0} Sections
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Fallback Static Templates if List is Empty */}
                  {templates.length === 0 && (
                    <>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-purple-500">
                        <CardContent className="p-6">
                          <FileText className="w-12 h-12 text-purple-600 mb-4" />
                          <h3 className="font-medium text-gray-900 mb-2">Standard PACP Report</h3>
                          <p className="text-sm text-gray-600 mb-4">Comprehensive pipeline assessment following PACP standards</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">System Default</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default Reports