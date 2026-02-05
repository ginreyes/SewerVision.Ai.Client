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
  Loader2,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import reportsApi from '@/data/reportsApi'

const QualityReportPage = () => {
  const router = useRouter()
  const { userId, userData } = useUser()
  const { showAlert, showConfirm } = useAlert()
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30days')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false)
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
    templateId: '',
    reportTitle: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    reportType: 'initial',
    priority: 'normal',
    weatherConditions: '',
    flowConditions: 'normal',
    preCleaningStatus: 'completed',
    equipmentUsed: '',
    initialNotes: ''
  })
  
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [createReportTab, setCreateReportTab] = useState('project')
  const [createTemplateTab, setCreateTemplateTab] = useState('info')

  // Navigation for Create Report
  const reportTabs = ['project', 'details', 'conditions', 'template', 'review']
  const getCurrentReportTabIndex = () => reportTabs.indexOf(createReportTab)
  const canGoNextReport = () => {
    const currentIndex = getCurrentReportTabIndex()
    if (currentIndex === 0 && !newReportForm.projectId) return false // Project required
    if (currentIndex === 1 && !newReportForm.reportTitle) return false // Title required
    return currentIndex < reportTabs.length - 1
  }
  const canGoBackReport = () => getCurrentReportTabIndex() > 0

  const handleNextReport = () => {
    const currentIndex = getCurrentReportTabIndex()
    if (currentIndex < reportTabs.length - 1) {
      setCreateReportTab(reportTabs[currentIndex + 1])
    }
  }

  const handleBackReport = () => {
    const currentIndex = getCurrentReportTabIndex()
    if (currentIndex > 0) {
      setCreateReportTab(reportTabs[currentIndex - 1])
    }
  }

  // Analytics date range state
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30days')

  // New template form state
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    description: '',
    fields: [],
    sections: []
  })

  // Edit template form state
  const [editTemplateForm, setEditTemplateForm] = useState({
    id: '',
    name: '',
    description: '',
    sections: [],
    fields: [],
    isDefault: false
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
    try {
      const templates = await reportsApi.getTemplates()
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

    if (!newReportForm.reportTitle || newReportForm.reportTitle.trim() === '') {
      showAlert('Please enter a report title', 'error')
      return
    }

    try {
      await reportsApi.createReport({
        projectId: newReportForm.projectId,
        templateId: (newReportForm.templateId && newReportForm.templateId !== '' && newReportForm.templateId !== 'no_template') ? newReportForm.templateId : undefined,
        qcTechnicianId: userId,
        reportTitle: newReportForm.reportTitle,
        inspectionDate: newReportForm.inspectionDate,
        reportType: newReportForm.reportType,
        priority: newReportForm.priority,
        weatherConditions: newReportForm.weatherConditions,
        flowConditions: newReportForm.flowConditions,
        preCleaningStatus: newReportForm.preCleaningStatus,
        equipmentUsed: newReportForm.equipmentUsed,
        initialNotes: newReportForm.initialNotes
      })

      showAlert('Report created successfully', 'success')
      setIsNewReportModalOpen(false)
      setNewReportForm({ 
        projectId: '', 
        templateId: '',
        reportTitle: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        reportType: 'initial',
        priority: 'normal',
        weatherConditions: '',
        flowConditions: 'normal',
        preCleaningStatus: 'completed',
        equipmentUsed: '',
        initialNotes: ''
      })
      setSelectedProject(null)
      setSelectedTemplate(null)
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

    if (newTemplateForm.sections.length > 0 && newTemplateForm.sections.some(s => !s.name || s.name.trim() === '')) {
      showAlert('Please fill in all section names', 'error')
      return
    }

    try {
      await reportsApi.createTemplate({
        name: newTemplateForm.name,
        description: newTemplateForm.description,
        fields: newTemplateForm.fields,
        sections: newTemplateForm.sections,
        createdBy: userId
      })
      showAlert('Template created successfully', 'success')
      setIsTemplateModalOpen(false)
      setNewTemplateForm({ name: '', description: '', fields: [], sections: [] })
      fetchTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
      showAlert(error.message || 'Failed to create template', 'error')
    }
  }

  const handleAddNewSection = () => {
    const newSection = {
      name: '',
      fields: [],
      order: newTemplateForm.sections.length + 1
    }
    setNewTemplateForm({
      ...newTemplateForm,
      sections: [...newTemplateForm.sections, newSection]
    })
  }

  const handleRemoveNewSection = (index) => {
    const updatedSections = newTemplateForm.sections.filter((_, i) => i !== index)
    setNewTemplateForm({
      ...newTemplateForm,
      sections: updatedSections
    })
  }

  const handleUpdateNewSection = (index, field, value) => {
    const updatedSections = [...newTemplateForm.sections]
    if (field === 'fields') {
      updatedSections[index][field] = value.split(',').map(f => f.trim()).filter(f => f)
    } else {
      updatedSections[index][field] = value
    }
    setNewTemplateForm({
      ...newTemplateForm,
      sections: updatedSections
    })
  }

  const handleEditTemplate = (template) => {
    const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
    setEditTemplateForm({
      id: templateId,
      name: template.name || '',
      description: template.description || '',
      sections: template.sections || [],
      fields: template.fields || [],
      isDefault: template.isDefault || false
    })
    setIsEditTemplateModalOpen(true)
  }

  const handleUpdateTemplate = async () => {
    if (!editTemplateForm.name) {
      showAlert('Please enter a template name', 'error')
      return
    }

    try {
      await reportsApi.updateTemplate(editTemplateForm.id, {
        name: editTemplateForm.name,
        description: editTemplateForm.description,
        fields: editTemplateForm.fields,
        sections: editTemplateForm.sections
      })
      showAlert('Template updated successfully', 'success')
      setIsEditTemplateModalOpen(false)
      setEditTemplateForm({ id: '', name: '', description: '', sections: [], fields: [], isDefault: false })
      fetchTemplates()
    } catch (error) {
      console.error('Error updating template:', error)
      showAlert(error.message || 'Failed to update template', 'error')
    }
  }

  const handleAddSection = () => {
    const newSection = {
      name: '',
      fields: [],
      order: editTemplateForm.sections.length + 1
    }
    setEditTemplateForm({
      ...editTemplateForm,
      sections: [...editTemplateForm.sections, newSection]
    })
  }

  const handleRemoveSection = (index) => {
    const updatedSections = editTemplateForm.sections.filter((_, i) => i !== index)
    setEditTemplateForm({
      ...editTemplateForm,
      sections: updatedSections
    })
  }

  const handleUpdateSection = (index, field, value) => {
    const updatedSections = [...editTemplateForm.sections]
    if (field === 'fields') {
      updatedSections[index][field] = value.split(',').map(f => f.trim()).filter(f => f)
    } else {
      updatedSections[index][field] = value
    }
    setEditTemplateForm({
      ...editTemplateForm,
      sections: updatedSections
    })
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

  const handleEditReport = (report) => {
    router.push(`/qc-technician/reports/${report._id || report.id}`)
  }

  const handleDeleteReport = async (report) => {
    const confirmed = await showConfirm({
      title: 'Delete Report',
      message: `Are you sure you want to delete the report for "${report.projectId?.name || 'Unknown Project'}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    })

    if (!confirmed) {
      return
    }

    try {
      await reportsApi.deleteReport(report._id || report.id)
      showAlert('Report deleted successfully', 'success')
      fetchReports()
    } catch (error) {
      console.error('Error deleting report:', error)
      showAlert(error.message || 'Failed to delete report', 'error')
    }
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
      <Card className="hover:shadow-md transition-all">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-rose-50 rounded-lg">
                <FileText className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{projectName}</h3>
                <p className="text-xs text-gray-500">{report.reportType || 'PACP Condition Assessment'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <Badge variant={getStatusVariant(report.status)} className="text-xs">
                {report.status?.replace('_', ' ') || report.status}
              </Badge>
              {report.overallGrade && (
                <Badge className={`${getGradeColor(report.overallGrade)} text-xs`}>
                  {report.overallGrade}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3 pb-3 border-b border-gray-100">
            <div>
              <span className="text-gray-500 text-xs">Operator</span>
              <p className="font-medium text-gray-900 text-sm truncate">{operatorName}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">QC Tech</span>
              <p className="font-medium text-gray-900 text-sm truncate">{qcTechName}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Length</span>
              <p className="font-medium text-gray-900 text-sm">{report.footage || report.pipeLength || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Defects</span>
              <p className="font-medium text-gray-900 text-sm">{report.totalDefects || report.aiDetections || 0} total</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(report.createdAt || report.createdDate || Date.now()).toLocaleDateString()}
              </span>
              {report.confidence > 0 && (
                <span>• {report.confidence}%</span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewReport(report)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditReport(report)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareReport(report)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteReport(report)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
              <p className="text-sm text-gray-500">Generate and manage PACP inspection reports</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/qc-technician/reports/detailed')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Detailed Report
            </Button>
            <Button onClick={() => setIsNewReportModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <Tabs defaultValue="reports" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                My Reports
              </TabsTrigger>
              <TabsTrigger value="templates">
                <FileCheck className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Reports Tab Content */}
            <TabsContent value="reports" className="space-y-6">
              {/* Quick Stats - Compact like dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                    <p className="text-sm text-gray-500">Draft</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.avgAccuracy || 0}%</p>
                    <p className="text-sm text-gray-500">Avg Accuracy</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Reports</p>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchReports}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Report Templates</h2>
                  <p className="text-sm text-gray-500">Pre-configured templates for consistent reporting</p>
                </div>
                <Button onClick={() => setIsTemplateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
                    <p className="text-sm text-gray-500">Loading templates...</p>
                  </CardContent>
                </Card>
              ) : reportTemplates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first template to get started</p>
                    <Button onClick={() => setIsTemplateModalOpen(true)} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTemplates.map((template) => (
                    <Card key={template._id || template.id} className="hover:shadow-md transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-rose-50 rounded-lg">
                              <FileCheck className="w-5 h-5 text-rose-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {template.name}
                                {template.isDefault && (
                                  <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-2">{template.description || 'No description'}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-gray-900"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>

                        {template.fields && template.fields.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">Included Sections:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {template.fields.slice(0, 3).map((field, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                              {template.fields.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.fields.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never used'}
                          </span>
                          <Button size="sm" onClick={() => {
                            const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
                            setNewReportForm({ ...newReportForm, templateId })
                            setIsNewReportModalOpen(true)
                          }}>Use</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab Content */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Report Analytics</h2>
                  <p className="text-sm text-gray-500">Insights into your reporting performance and trends</p>
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

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-green-100 rounded-lg inline-flex mb-3">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">94.2%</p>
                    <p className="text-sm text-gray-500">Avg Report Accuracy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-rose-100 rounded-lg inline-flex mb-3">
                      <Clock className="w-6 h-6 text-rose-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">2.3h</p>
                    <p className="text-sm text-gray-500">Avg Time to Complete</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">98.1%</p>
                    <p className="text-sm text-gray-500">Client Approval Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Report Generation Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Monthly report generation chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Defect Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <PieChart className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Defect type breakdown chart</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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

      {/* New Report Modal with Sidebar Tabs */}
      <Dialog open={isNewReportModalOpen} onOpenChange={setIsNewReportModalOpen}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-rose-50 to-orange-50">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Report</DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a category from the left sidebar to fill in report details
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Report Sections
                </p>
              </div>
              <nav className="space-y-2 flex-1">
                <button
                  onClick={() => setCreateReportTab('project')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createReportTab === 'project'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createReportTab === 'project' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Project Selection</span>
                  {createReportTab === 'project' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setCreateReportTab('details')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createReportTab === 'details'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createReportTab === 'details' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Report Details</span>
                  {createReportTab === 'details' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setCreateReportTab('conditions')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createReportTab === 'conditions'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createReportTab === 'conditions' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <Target className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Conditions</span>
                  {createReportTab === 'conditions' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setCreateReportTab('template')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createReportTab === 'template'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createReportTab === 'template' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Template</span>
                  {createReportTab === 'template' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setCreateReportTab('review')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createReportTab === 'review'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createReportTab === 'review' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Review & Create</span>
                  {createReportTab === 'review' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
              </nav>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-rose-100">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-rose-600">Tip:</span> Fill in all required fields marked with *
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ minHeight: '500px', maxHeight: '500px' }}>
              {/* Project Tab */}
              {createReportTab === 'project' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Getting Started</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Select the project you'll be inspecting from your assigned projects</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Only projects assigned to you will appear in the dropdown</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Review project details before proceeding to the next section</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <Label htmlFor="project" className="text-base font-semibold">Select Project *</Label>
                <Select
                  value={newReportForm.projectId || ''}
                  onValueChange={(value) => {
                    setNewReportForm({ ...newReportForm, projectId: value || '' })
                    const project = projects.find(p => {
                      const pId = String(p._id?.toString() || p.id?.toString() || p._id || p.id || '')
                      return pId === value
                    })
                    setSelectedProject(project || null)
                  }}
                >
                  <SelectTrigger id="project" className="h-11">
                    <SelectValue placeholder="Select a project to inspect" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter(project => project && (project._id || project.id)).map((project) => {
                      const projectId = String(project._id?.toString() || project.id?.toString() || project._id || project.id || '');
                      if (!projectId || projectId === 'undefined' || projectId === 'null') {
                        return null;
                      }
                      return (
                        <SelectItem key={projectId} value={projectId}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name || 'Unnamed'}</span>
                            <span className="text-xs text-gray-500">{project.location || 'N/A'}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {projects.length === 0 && !loading && (
                  <p className="text-sm text-gray-500">No projects assigned to you</p>
                )}

                {selectedProject && (
                  <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">{selectedProject.client || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <Badge variant="secondary">{selectedProject.status || 'N/A'}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{selectedProject.location || 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                </div>
              </div>
            )}

              {/* Details Tab */}
              {createReportTab === 'details' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Report Details</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Enter a descriptive title for easy identification</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Set the inspection date and report type (initial, follow-up, etc.)</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Assign priority level to help organize your workflow</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <div className="space-y-2">
                  <Label htmlFor="reportTitle">Report Title *</Label>
                  <Input
                    id="reportTitle"
                    placeholder="e.g., Main St Sewer Line Inspection"
                    value={newReportForm.reportTitle}
                    onChange={(e) => setNewReportForm({ ...newReportForm, reportTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspectionDate">Inspection Date *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={newReportForm.inspectionDate}
                    onChange={(e) => setNewReportForm({ ...newReportForm, inspectionDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={newReportForm.reportType}
                    onValueChange={(value) => setNewReportForm({ ...newReportForm, reportType: value })}
                  >
                    <SelectTrigger id="reportType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">Initial Assessment</SelectItem>
                      <SelectItem value="follow-up">Follow-up Inspection</SelectItem>
                      <SelectItem value="routine">Routine Maintenance</SelectItem>
                      <SelectItem value="emergency">Emergency Inspection</SelectItem>
                      <SelectItem value="pre-rehab">Pre-Rehabilitation</SelectItem>
                      <SelectItem value="post-rehab">Post-Rehabilitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={newReportForm.priority}
                    onValueChange={(value) => setNewReportForm({ ...newReportForm, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialNotes">Initial Notes</Label>
                  <Textarea
                    id="initialNotes"
                    placeholder="Add any initial observations, access notes, or special conditions..."
                    value={newReportForm.initialNotes}
                  onChange={(e) => setNewReportForm({ ...newReportForm, initialNotes: e.target.value })}
                  rows={4}
                />
              </div>
              </div>
              </div>
            )}

              {/* Conditions Tab */}
              {createReportTab === 'conditions' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Inspection Conditions</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Document environmental conditions during inspection</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Record flow conditions and pre-cleaning status for PACP compliance</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Specify equipment used for reference and quality control</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <div className="space-y-2">
                  <Label htmlFor="weatherConditions">Weather Conditions</Label>
                  <Select
                    value={newReportForm.weatherConditions}
                    onValueChange={(value) => setNewReportForm({ ...newReportForm, weatherConditions: value })}
                  >
                    <SelectTrigger id="weatherConditions">
                      <SelectValue placeholder="Select weather conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear/Sunny</SelectItem>
                      <SelectItem value="cloudy">Cloudy</SelectItem>
                      <SelectItem value="rainy">Rainy</SelectItem>
                      <SelectItem value="stormy">Stormy</SelectItem>
                      <SelectItem value="snowy">Snowy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flowConditions">Flow Conditions</Label>
                  <Select
                    value={newReportForm.flowConditions}
                    onValueChange={(value) => setNewReportForm({ ...newReportForm, flowConditions: value })}
                  >
                    <SelectTrigger id="flowConditions">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">Dry (No Flow)</SelectItem>
                      <SelectItem value="low">Low Flow</SelectItem>
                      <SelectItem value="normal">Normal Flow</SelectItem>
                      <SelectItem value="high">High Flow</SelectItem>
                      <SelectItem value="surcharge">Surcharge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preCleaningStatus">Pre-Cleaning Status</Label>
                  <Select
                    value={newReportForm.preCleaningStatus}
                    onValueChange={(value) => setNewReportForm({ ...newReportForm, preCleaningStatus: value })}
                  >
                    <SelectTrigger id="preCleaningStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="not-required">Not Required</SelectItem>
                      <SelectItem value="not-performed">Not Performed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentUsed">Equipment/Camera Used</Label>
                  <Input
                    id="equipmentUsed"
                    placeholder="e.g., CCTV Camera Model XYZ-500"
                    value={newReportForm.equipmentUsed}
                    onChange={(e) => setNewReportForm({ ...newReportForm, equipmentUsed: e.target.value })}
                  />
                </div>
              </div>
              </div>
            )}

              {/* Template Tab */}
              {createReportTab === 'template' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Report Template</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Choose a template for structured reporting (optional but recommended)</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>The default PACP template includes comprehensive sewer inspection sections</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Templates ensure consistency and compliance with industry standards</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <div className="space-y-2">
                  <Label htmlFor="template" className="text-base font-semibold">Select Template</Label>
                  <Select
                    value={newReportForm.templateId || ''}
                    onValueChange={(value) => {
                      setNewReportForm({ ...newReportForm, templateId: value || '' })
                      const template = reportTemplates.find(t => {
                        const tId = String(t._id?.toString() || t.id?.toString() || t._id || t.id || '')
                        return tId === value
                      })
                      setSelectedTemplate(template || null)
                    }}
                  >
                    <SelectTrigger id="template" className="h-11">
                      <SelectValue placeholder="Choose a report template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_template">No Template (Basic Report)</SelectItem>
                      {reportTemplates.filter(template => template && (template._id || template.id)).map((template) => {
                        const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
                        if (!templateId || templateId === 'undefined' || templateId === 'null') {
                          return null;
                        }
                        return (
                          <SelectItem key={templateId} value={templateId}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name || 'Unnamed Template'}</span>
                              {template.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Templates provide structured sections for comprehensive reporting</p>
                </div>

                {selectedTemplate && selectedTemplate.sections && selectedTemplate.sections.length > 0 && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Template Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        {selectedTemplate.sections.length} sections included:
                      </p>
                      <div className="space-y-1">
                        {selectedTemplate.sections.slice(0, 6).map((section, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                            <CheckCircle className="h-3 w-3" />
                            <span>{section.name}</span>
                          </div>
                        ))}
                        {selectedTemplate.sections.length > 6 && (
                          <div className="text-xs text-blue-700 font-medium">
                            +{selectedTemplate.sections.length - 6} more sections...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                </div>
              </div>
            )}

            {/* Review Tab */}
            {createReportTab === 'review' && (
              <div className="space-y-6">
                {/* Instructions Card */}
                <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm">
                        <Eye className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Review Your Report</h3>
                        <p className="text-sm text-gray-700">
                          Please review all the information below before creating your report. You can go back to any section to make changes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Project Information</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('project')}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Project</p>
                        <p className="font-medium">{selectedProject?.name || 'Not selected'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{selectedProject?.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">{selectedProject?.client || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <Badge variant="secondary">{selectedProject?.status || 'N/A'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Report Details</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('details')}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Report Title</p>
                        <p className="font-medium">{newReportForm.reportTitle || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Inspection Date</p>
                        <p className="font-medium">{newReportForm.inspectionDate || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Report Type</p>
                        <Badge variant="outline">{newReportForm.reportType || 'N/A'}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600">Priority</p>
                        <Badge variant="outline">{newReportForm.priority || 'N/A'}</Badge>
                      </div>
                    </div>
                    {newReportForm.initialNotes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-gray-600 mb-1">Initial Notes</p>
                        <p className="text-sm">{newReportForm.initialNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conditions */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Inspection Conditions</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('conditions')}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Weather</p>
                        <p className="font-medium">{newReportForm.weatherConditions || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Flow Conditions</p>
                        <p className="font-medium">{newReportForm.flowConditions || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pre-Cleaning</p>
                        <p className="font-medium">{newReportForm.preCleaningStatus || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Equipment</p>
                        <p className="font-medium">{newReportForm.equipmentUsed || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Template */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Template Selection</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('template')}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div>
                      <p className="text-gray-600">Template</p>
                      <p className="font-medium">
                        {selectedTemplate?.name || (newReportForm.templateId === 'no_template' ? 'No Template' : 'Not selected')}
                      </p>
                      {selectedTemplate?.description && (
                        <p className="text-xs text-gray-500 mt-1">{selectedTemplate.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            </div>
          </div>

          <DialogFooter className="px-8 py-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
            {createReportTab !== 'review' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleBackReport}
                  disabled={!canGoBackReport()}
                >
                  <X className="h-4 w-4 mr-2" />
                  {canGoBackReport() ? 'Back' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleNextReport}
                  disabled={!canGoNextReport()}
                >
                  Next
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleBackReport}
                >
                  <X className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCreateReport}
                  disabled={!newReportForm.projectId || !newReportForm.reportTitle}
                  className="min-w-[140px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Modal with Sidebar Tabs */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-rose-50 to-orange-50">
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Template</DialogTitle>
            <DialogDescription className="text-gray-600">
              Design your PACP inspection template using the sidebar sections
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Template Builder
                </p>
              </div>
              
              <nav className="space-y-2 flex-1">
                <button
                  onClick={() => setCreateTemplateTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createTemplateTab === 'info'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createTemplateTab === 'info' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Basic Information</span>
                  {createTemplateTab === 'info' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setCreateTemplateTab('sections')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    createTemplateTab === 'sections'
                      ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${createTemplateTab === 'sections' ? 'bg-white/20' : 'bg-rose-100'}`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Report Sections</span>
                  {createTemplateTab === 'sections' && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
              </nav>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-rose-100">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-rose-600">Tip:</span> Templates can be reused for consistent reporting
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ minHeight: '500px', maxHeight: '500px' }}>
              {/* Information Tab */}
              {createTemplateTab === 'info' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Template Information</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Give your template a descriptive name (e.g., "PACP Sewer Inspection")</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Add a clear description of what this template will be used for</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Quick reference fields help categorize your report structure</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName" className="text-base font-semibold">Template Name *</Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., Comprehensive PACP Inspection Report"
                    value={newTemplateForm.name}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea
                    id="templateDescription"
                    placeholder="Describe the purpose and scope of this template (e.g., 'Complete PACP condition assessment for sewer pipelines with AI-assisted defect detection')"
                    value={newTemplateForm.description}
                    onChange={(e) => setNewTemplateForm({ ...newTemplateForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quick Reference Fields</Label>
                  <Input
                    placeholder="e.g., Executive Summary, Pipeline Info, AI Detections"
                    value={newTemplateForm.fields.join(', ')}
                    onChange={(e) => {
                      const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                      setNewTemplateForm({ ...newTemplateForm, fields })
                    }}
                  />
                  <p className="text-xs text-gray-500">Comma-separated high-level categories</p>
                </div>

                <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <FileCheck className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">💡 Next Step</p>
                        <p className="text-xs text-gray-600">
                          After filling in the basic information, switch to the "Sections" tab to add detailed report sections.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

              {/* Sections Tab */}
              {createTemplateTab === 'sections' && (
                <div className="space-y-6">
                  {/* Instructions Card */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Building Template Sections</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Create sections like "Executive Summary", "Pipeline Specs", etc.</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Each section can have multiple fields (comma-separated)</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p>Use the PACP suggestions below for industry-standard templates</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Report Sections</Label>
                  <Button size="sm" variant="outline" onClick={handleAddNewSection}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Section
                  </Button>
                </div>
                {newTemplateForm.sections.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                      <div className="p-3 bg-gray-100 rounded-lg inline-flex mb-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No sections yet</h3>
                      <p className="text-sm text-gray-500 mb-4">Start building your template</p>
                      <Button size="sm" variant="outline" onClick={handleAddNewSection}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Section
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {newTemplateForm.sections.map((section, index) => (
                      <Card key={index} className="border-l-4 border-l-rose-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="bg-rose-600 text-xs whitespace-nowrap">
                                  #{index + 1}
                                </Badge>
                                <Input
                                  placeholder="Section Name"
                                  value={section.name}
                                  onChange={(e) => handleUpdateNewSection(index, 'name', e.target.value)}
                                  className="flex-1 font-medium"
                                />
                              </div>
                              <div>
                                <Textarea
                                  placeholder="Section fields (comma-separated)"
                                  value={section.fields.join(', ')}
                                  onChange={(e) => handleUpdateNewSection(index, 'fields', e.target.value)}
                                  rows={2}
                                  className="text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveNewSection(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {newTemplateForm.sections.length > 0 && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {newTemplateForm.sections.length} section{newTemplateForm.sections.length !== 1 ? 's' : ''}, {' '}
                            {newTemplateForm.sections.reduce((acc, s) => acc + s.fields.length, 0)} total fields
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <FileCheck className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">💡 PACP Sections</p>
                        <p className="text-xs text-gray-600">
                          Executive Summary, Project Info, Pipeline Specs, Methodology, AI Detections, 
                          Structural/O&M Assessment, Observations, Grading, Recommendations, QC Verification
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
            </div>
          </div>

          <DialogFooter className="px-8 py-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
            <Button variant="outline" onClick={() => {
              setIsTemplateModalOpen(false)
              setCreateTemplateTab('info')
              setNewTemplateForm({ name: '', description: '', fields: [], sections: [] })
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={!newTemplateForm.name || (newTemplateForm.sections.length > 0 && newTemplateForm.sections.some(s => !s.name))}
              className="min-w-[140px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditTemplateModalOpen} onOpenChange={setIsEditTemplateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Report Template</DialogTitle>
            <DialogDescription>
              Customize your {editTemplateForm.isDefault ? 'default ' : ''}template for sewer inspection reports
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTemplateName">
                  Template Name *
                  {editTemplateForm.isDefault && (
                    <span className="text-xs text-gray-500 ml-2">(Default template name cannot be changed)</span>
                  )}
                </Label>
                <Input
                  id="editTemplateName"
                  placeholder="e.g., PACP Sewer Inspection Report"
                  value={editTemplateForm.name}
                  onChange={(e) => setEditTemplateForm({ ...editTemplateForm, name: e.target.value })}
                  disabled={editTemplateForm.isDefault}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTemplateDescription">Description</Label>
                <Textarea
                  id="editTemplateDescription"
                  placeholder="Describe what this template includes..."
                  value={editTemplateForm.description}
                  onChange={(e) => setEditTemplateForm({ ...editTemplateForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Fields (comma-separated)</Label>
                <Input
                  placeholder="e.g., Executive Summary, Project Details, Pipeline Specifications"
                  value={editTemplateForm.fields.join(', ')}
                  onChange={(e) => {
                    const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f)
                    setEditTemplateForm({ ...editTemplateForm, fields })
                  }}
                />
                <p className="text-xs text-gray-500">Quick reference field names</p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Template Sections</Label>
                <Button size="sm" variant="outline" onClick={handleAddSection}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>

              {editTemplateForm.sections.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No sections yet. Click "Add Section" to create one.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {editTemplateForm.sections.map((section, index) => (
                    <Card key={index} className="border-l-4 border-l-rose-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Section {index + 1}
                              </Badge>
                              <Input
                                placeholder="Section Name (e.g., Executive Summary)"
                                value={section.name}
                                onChange={(e) => handleUpdateSection(index, 'name', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600 mb-1 block">
                                Fields (comma-separated)
                              </Label>
                              <Textarea
                                placeholder="e.g., Overall Condition Rating, Total Footage Inspected, Critical Defects"
                                value={section.fields.join(', ')}
                                onChange={(e) => handleUpdateSection(index, 'fields', e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSection(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {editTemplateForm.sections.length > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <FileCheck className="h-5 w-5 text-rose-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Template Summary</p>
                      <p className="text-sm text-gray-600">
                        {editTemplateForm.sections.length} section{editTemplateForm.sections.length !== 1 ? 's' : ''} with {editTemplateForm.sections.reduce((acc, s) => acc + s.fields.length, 0)} total fields
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditTemplateModalOpen(false)
              setEditTemplateForm({ id: '', name: '', description: '', sections: [], fields: [], isDefault: false })
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTemplate}
              disabled={!editTemplateForm.name || editTemplateForm.sections.some(s => !s.name)}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QualityReportPage