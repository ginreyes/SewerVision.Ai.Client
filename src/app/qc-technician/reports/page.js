'use client'
import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Share2,
  Edit3,
  RefreshCw,
  FileCheck,
  Award,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import reportsApi from '@/data/reportsApi'

const QualityReportPage = () => {
  const router = useRouter()
  const { userId, userData } = useUser()
  const { showAlert } = useAlert()
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30days')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [reportTemplates, setReportTemplates] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    draft: 0,
    inReview: 0
  })

  // New report form state
  const [newReportForm, setNewReportForm] = useState({
    projectId: '',
    templateId: ''
  })

  // Analytics date range state
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30days')

  // New template form state
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    description: '',
    fields: []
  })

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'default'
      case 'draft': return 'secondary'
      case 'pending_review': return 'outline'
      default: return 'outline'
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Grade 1': return 'bg-green-100 text-green-700'
      case 'Grade 2': return 'bg-yellow-100 text-yellow-700'
      case 'Grade 3': return 'bg-orange-100 text-orange-700'
      case 'Grade 4': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Fetch data
  useEffect(() => {
    if (userId) {
      fetchReports()
      fetchTemplates()
      fetchProjects()
    }
  }, [userId, filterStatus, searchTerm, dateRange])

  const fetchReports = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await reportsApi.getReports(userId, {
        status: filterStatus,
        searchTerm,
        dateRange
      })
      setReports(response.data || [])
      setStats(response.stats || stats)
    } catch (error) {
      console.error('Error fetching reports:', error)
      showAlert(error.message || 'Failed to fetch reports', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    if (!userId) return
    try {
      const templates = await reportsApi.getTemplates(userId)
      setReportTemplates(templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      showAlert(error.message || 'Failed to fetch templates', 'error')
    }
  }

  const fetchProjects = async () => {
    if (!userId) return
    try {
      const projectsData = await reportsApi.getProjectsForReport(userId)
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleCreateReport = async () => {
    if (!newReportForm.projectId || newReportForm.projectId === '') {
      showAlert('Please select a project', 'error')
      return
    }

    try {
      await reportsApi.createReport({
        projectId: newReportForm.projectId,
        templateId: (newReportForm.templateId && newReportForm.templateId !== '' && newReportForm.templateId !== 'no_template') ? newReportForm.templateId : undefined,
        qcTechnicianId: userId
      })
      showAlert('Report created successfully', 'success')
      setIsNewReportModalOpen(false)
      setNewReportForm({ projectId: '', templateId: '' })
      fetchReports()
    } catch (error) {
      console.error('Error creating report:', error)
      showAlert(error.message || 'Failed to create report', 'error')
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplateForm.name) {
      showAlert('Please enter a template name', 'error')
      return
    }

    try {
      await reportsApi.createTemplate({
        name: newTemplateForm.name,
        description: newTemplateForm.description,
        fields: newTemplateForm.fields,
        sections: [],
        createdBy: userId
      })
      showAlert('Template created successfully', 'success')
      setIsTemplateModalOpen(false)
      setNewTemplateForm({ name: '', description: '', fields: [] })
      fetchTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
      showAlert(error.message || 'Failed to create template', 'error')
    }
  }

  const handleViewReport = (report) => {
    router.push(`/qc-technician/reports/${report._id || report.id}`)
  }

  const handleDownloadReport = (report) => {
    alert(`Downloading report: ${report.projectId?.name || report.projectName}`)
  }

  const handleShareReport = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const ReportCard = ({ report }) => {
    const projectName = report.projectId?.name || report.projectName || 'Unknown Project'
    const operatorName = report.operator?.first_name && report.operator?.last_name
      ? `${report.operator.first_name} ${report.operator.last_name}`
      : report.operator || 'N/A'
    const qcTechName = report.qcTechnician?.first_name && report.qcTechnician?.last_name
      ? `${report.qcTechnician.first_name} ${report.qcTechnician.last_name}`
      : report.qcTechnician || 'N/A'

    return (
      <Card className="hover:shadow-md transition-all cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{projectName}</h3>
              <p className="text-sm text-gray-600">{report.reportType || 'PACP Condition Assessment'}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge variant={getStatusVariant(report.status)}>
                {report.status?.replace('_', ' ') || report.status}
              </Badge>
              {report.overallGrade && (
                <Badge className={getGradeColor(report.overallGrade)}>
                  {report.overallGrade}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-600">Operator:</span>
              <p className="font-medium text-gray-900">{operatorName}</p>
            </div>
            <div>
              <span className="text-gray-600">QC Tech:</span>
              <p className="font-medium text-gray-900">{qcTechName}</p>
            </div>
            <div>
              <span className="text-gray-600">Length:</span>
              <p className="font-medium text-gray-900">{report.footage || report.pipeLength || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-600">Defects:</span>
              <p className="font-medium text-gray-900">{report.totalDefects || report.aiDetections || 0} total</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Created: {new Date(report.createdAt || report.createdDate || Date.now()).toLocaleDateString()}</span>
              <span>Confidence: {report.confidence || 0}%</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewReport(report)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownloadReport(report)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShareReport(report)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
              <p className="text-sm text-gray-600">Generate and manage PACP inspection reports</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/qc-technician/reports/detailed')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Detailed 2-Day Report
            </Button>
            <Button
              className="bg-gradient-to-r from-[#D76A84] to-rose-500"
              onClick={() => setIsNewReportModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-500">
              <FileText className="h-4 w-4 mr-2" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-500">
              <FileCheck className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-rose-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab Content */}
          <TabsContent value="reports" className="p-6 space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchReports}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-600">+2</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">{stats.completed}</CardTitle>
                  <CardDescription>Completed Reports</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-600">1</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">{stats.draft}</CardTitle>
                  <CardDescription>Draft Reports</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-rose-600" />
                    </div>
                    <Badge className="bg-rose-100 text-rose-600">94%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">{stats.avgAccuracy || 0}%</CardTitle>
                  <CardDescription>Avg Accuracy</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Download className="h-6 w-6 text-pink-600" />
                    </div>
                    <Badge className="bg-pink-100 text-pink-600">+5</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">{stats.total}</CardTitle>
                  <CardDescription>Total Reports</CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Reports Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reports
                  .filter(report => filterStatus === 'all' || report.status === filterStatus)
                  .map((report) => (
                    <ReportCard key={report._id || report.id} report={report} />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab Content */}
          <TabsContent value="templates" className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Templates</CardTitle>
                    <CardDescription>Pre-configured templates for consistent reporting</CardDescription>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-[#D76A84] to-rose-500"
                    onClick={() => setIsTemplateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : reportTemplates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No templates found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <Card key={template._id || template.id} className="hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-lg flex items-center justify-center">
                          <FileCheck className="h-6 w-6 text-white" />
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Included Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {(template.fields || []).map((field, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-xs text-gray-500">
                          Last used: {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                        </span>
                        <Button size="sm" onClick={() => {
                          const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
                          setNewReportForm({ ...newReportForm, templateId })
                          setIsNewReportModalOpen(true)
                        }}>Use Template</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Analytics</CardTitle>
                    <CardDescription>Insights into your reporting performance and trends</CardDescription>
                  </div>
                  <Select value={analyticsDateRange} onValueChange={setAnalyticsDateRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="6months">Last 6 months</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Generation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Monthly report generation chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Defect Categories Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Defect type breakdown chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-green-600 mb-1">94.2%</h4>
                    <p className="text-sm text-gray-600">Average Report Accuracy</p>
                  </div>

                  <div className="text-center p-4 bg-rose-50 rounded-lg">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-rose-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-rose-600 mb-1">2.3h</h4>
                    <p className="text-sm text-gray-600">Avg Time to Complete</p>
                  </div>

                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-8 w-8 text-pink-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-pink-600 mb-1">98.1%</h4>
                    <p className="text-sm text-gray-600">Client Approval Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Report Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Share &quot;{selectedReport?.projectId?.name || selectedReport?.projectName}&quot; with team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="colleague@company.com" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message (Optional)</label>
              <Input placeholder="Add a message..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsModalOpen(false)
              showAlert('Report shared successfully!', 'success')
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Report Dialog */}
      <Dialog open={isNewReportModalOpen} onOpenChange={setIsNewReportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Select a project and optionally a template to create a new report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select
                value={newReportForm.projectId || ''}
                onValueChange={(value) => setNewReportForm({ ...newReportForm, projectId: value || '' })}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.filter(project => project && (project._id || project.id)).map((project) => {
                    const projectId = String(project._id?.toString() || project.id?.toString() || project._id || project.id || '');
                    if (!projectId || projectId === 'undefined' || projectId === 'null') {
                      return null;
                    }
                    return (
                      <SelectItem key={projectId} value={projectId}>
                        {project.name || 'Unnamed'} - {project.location || 'N/A'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {projects.length === 0 && !loading && (
                <p className="text-sm text-gray-500">No projects available</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template (Optional)</Label>
              <Select
                value={newReportForm.templateId || ''}
                onValueChange={(value) => setNewReportForm({ ...newReportForm, templateId: value || '' })}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_template">None</SelectItem>
                  {reportTemplates.filter(template => template && (template._id || template.id)).map((template) => {
                    const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
                    if (!templateId || templateId === 'undefined' || templateId === 'null') {
                      return null;
                    }
                    return (
                      <SelectItem key={templateId} value={templateId}>
                        {template.name || 'Unnamed Template'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewReportModalOpen(false)
              setNewReportForm({ projectId: '', templateId: '' })
            }}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#D76A84] to-rose-500"
              onClick={handleCreateReport}
              disabled={!newReportForm.projectId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Report Template</DialogTitle>
            <DialogDescription>
              Create a new template for consistent reporting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                placeholder="e.g., Standard PACP Report"
                value={newTemplateForm.name}
                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                placeholder="Describe what this template includes..."
                value={newTemplateForm.description}
                onChange={(e) => setNewTemplateForm({ ...newTemplateForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fields (comma-separated)</Label>
              <Input
                placeholder="e.g., Project Info, Defect Summary, Detailed Findings, Recommendations"
                value={newTemplateForm.fields.join(', ')}
                onChange={(e) => {
                  const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                  setNewTemplateForm({ ...newTemplateForm, fields })
                }}
              />
              <p className="text-xs text-gray-500">Enter field names separated by commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsTemplateModalOpen(false)
              setNewTemplateForm({ name: '', description: '', fields: [] })
            }}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#D76A84] to-rose-500"
              onClick={handleCreateTemplate}
              disabled={!newTemplateForm.name}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QualityReportPage