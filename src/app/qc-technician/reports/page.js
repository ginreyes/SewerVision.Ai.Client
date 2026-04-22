'use client'
import React, { useState, useEffect } from 'react'
import {
  FileText,
  Search,
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
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import { api } from '@/lib/helper'
import ReportCard from '@/components/qc/reports/ReportCard'
import NewReportModal from '@/components/qc/reports/NewReportModal'
import CreateTemplateModal from '@/components/qc/reports/CreateTemplateModal'
import EditTemplateModal from '@/components/qc/reports/EditTemplateModal'
import { SavedViewsDropdown, useSavedViewSync } from '@/components/shared/SavedViews'

const QualityReportPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, userData } = useUser()
  const { showAlert, showConfirm } = useAlert()
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30days')

  // Saved Views: two-way bind search/status/dateRange <-> selected SavedView + URL
  const {
    activeViewId,
    applyView,
    clearView,
    snapshot: snapshotFilters,
  } = useSavedViewSync({
    applyFilters: (v) => {
      if (typeof v.searchTerm === 'string') setSearchTerm(v.searchTerm)
      if (typeof v.filterStatus === 'string') setFilterStatus(v.filterStatus)
      if (typeof v.dateRange === 'string') setDateRange(v.dateRange)
    },
    captureFilters: () => ({ searchTerm, filterStatus, dateRange }),
  })

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

  // Fetch data
  useEffect(() => {
    if (userId) {
      fetchReports()
      fetchTemplates()
      fetchProjects()
    }
  }, [userId, filterStatus, searchTerm, dateRange])

  // Auto-open new report modal when navigated from QC review completion
  useEffect(() => {
    if (!searchParams) return
    const shouldCreateReport = searchParams.get('newReport') === 'true'
    const projectId = searchParams.get('projectId')
    if (shouldCreateReport && projects.length > 0) {
      // Pre-select the project from the review
      if (projectId) {
        const project = projects.find(p => {
          const pId = String(p._id?.toString() || p.id?.toString() || '')
          return pId === projectId
        })
        if (project) {
          setNewReportForm(prev => ({ ...prev, projectId }))
          setSelectedProject(project)
        }
      }
      setIsNewReportModalOpen(true)
      // Clean the URL to prevent re-opening on refresh
      router.replace('/qc-technician/reports', { scroll: false })
    }
  }, [searchParams, projects, router])

  const fetchReports = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)
      if (searchTerm) params.append('searchTerm', searchTerm)
      if (dateRange) params.append('dateRange', dateRange)
      const queryStr = params.toString()

      const response = await api(
        `/api/qc-technicians/reports-list/${userId}${queryStr ? `?${queryStr}` : ''}`,
        'GET'
      )

      if (response.ok) {
        const resData = response.data
        setReports(resData?.data || resData?.reports || [])
        setStats(resData?.stats || {
          total: (resData?.data || []).length,
          completed: (resData?.data || []).filter(r => r.status === 'completed').length,
          draft: (resData?.data || []).filter(r => r.status === 'draft').length,
          inReview: (resData?.data || []).filter(r => r.status === 'in-review' || r.status === 'in_review').length
        })
      } else {
        setReports([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      showAlert(error.message || 'Failed to fetch reports', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await api(`/api/qc-technicians/templates?userId=${userId}`, 'GET')
      if (response.ok) {
        setReportTemplates(response.data?.data || [])
      } else {
        setReportTemplates([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      showAlert(error.message || 'Failed to fetch templates', 'error')
    }
  }

  const fetchProjects = async () => {
    if (!userId) return
    try {
      const response = await api(`/api/qc-technicians/reports/projects/${userId}`, 'GET')
      if (response.ok) {
        setProjects(response.data?.data || [])
      } else {
        setProjects([])
      }
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
      const response = await api('/api/qc-technicians/reports', 'POST', {
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

      if (!response.ok) {
        throw new Error(response.data?.error || 'Failed to create report')
      }

      showAlert('Report created successfully! Defects and grade auto-calculated.', 'success')
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
      setCreateReportTab('project')
      fetchReports()

      // Navigate to the new report if created from QC review
      const newReport = response.data?.data
      if (newReport && (newReport._id || newReport.id)) {
        const reportId = newReport._id || newReport.id
        router.push(`/qc-technician/reports/${reportId}`)
      }
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
      const response = await api('/api/qc-technicians/templates', 'POST', {
        name: newTemplateForm.name,
        description: newTemplateForm.description,
        fields: newTemplateForm.fields,
        sections: newTemplateForm.sections,
        createdBy: userId
      })

      if (!response.ok) {
        throw new Error(response.data?.error || 'Failed to create template')
      }

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
      const response = await api(`/api/qc-technicians/templates/${editTemplateForm.id}`, 'PUT', {
        name: editTemplateForm.name,
        description: editTemplateForm.description,
        fields: editTemplateForm.fields,
        sections: editTemplateForm.sections
      })

      if (!response.ok) {
        throw new Error(response.data?.error || 'Failed to update template')
      }

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

  const handleDownloadReport = async (report) => {
    try {
      const reportId = report._id || report.id
      // Fetch the full report data with detections
      const response = await api(`/api/qc-technicians/reports/detail/${reportId}`, 'GET')

      if (!response.ok) {
        throw new Error(response.data?.error || 'Failed to fetch report for download')
      }

      const reportData = response.data?.data || report
      const detections = response.data?.detections || []
      const projectName = reportData.projectId?.name || report.projectId?.name || 'Unknown'

      // Build a comprehensive report document
      const downloadData = {
        reportInfo: {
          inspectionId: reportData.inspectionId || 'N/A',
          reportType: reportData.reportType || 'PACP Condition Assessment',
          status: reportData.status,
          overallGrade: reportData.overallGrade || 'N/A',
          date: reportData.date || reportData.createdAt,
          generatedAt: new Date().toISOString()
        },
        project: {
          name: projectName,
          location: reportData.projectId?.location || reportData.location || 'N/A',
          client: reportData.projectId?.client || 'N/A'
        },
        operator: reportData.operator
          ? `${reportData.operator.first_name || ''} ${reportData.operator.last_name || ''}`.trim() || 'N/A'
          : 'N/A',
        qcTechnician: reportData.qcTechnician
          ? `${reportData.qcTechnician.first_name || ''} ${reportData.qcTechnician.last_name || ''}`.trim() || 'N/A'
          : 'N/A',
        metrics: {
          totalDefects: reportData.totalDefects || 0,
          criticalDefects: reportData.criticalDefects || 0,
          aiDetections: reportData.aiDetections || 0,
          confidence: `${reportData.confidence || 0}%`,
          footage: reportData.footage || 'N/A'
        },
        issues: reportData.issues || [],
        detections: detections.map(d => ({
          type: d.type,
          severity: d.severity,
          confidence: `${d.confidence}%`,
          status: d.qcStatus,
          pacpCode: d.pacpCode || 'N/A',
          distance: d.distance || 'N/A'
        }))
      }

      // Create and download as JSON
      const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${projectName.replace(/\s+/g, '-')}-${reportData.date || 'unknown'}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showAlert('Report downloaded successfully', 'success')
    } catch (error) {
      console.error('Error downloading report:', error)
      showAlert(error.message || 'Failed to download report', 'error')
    }
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
      const reportId = report._id || report.id
      const response = await api(`/api/qc-technicians/reports/detail/${reportId}`, 'DELETE')
      if (!response.ok) {
        throw new Error(response.data?.error || 'Failed to delete report')
      }
      showAlert('Report deleted successfully', 'success')
      fetchReports()
    } catch (error) {
      console.error('Error deleting report:', error)
      showAlert(error.message || 'Failed to delete report', 'error')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
              <p className="text-sm text-gray-500 dark:!text-gray-300">Generate and manage PACP inspection reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SavedViewsDropdown
              entityType="report"
              activeViewId={activeViewId}
              onApply={applyView}
              onClear={clearView}
              snapshotFilters={snapshotFilters}
              accentColor="amber"
            />
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
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Completed</p>
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
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Draft</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-amber-500">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.avgAccuracy || 0}%</p>
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Avg Accuracy</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-amber-500">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Total Reports</p>
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
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
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
                      <ReportCard
                        key={report._id || report.id}
                        report={report}
                        onView={handleViewReport}
                        onEdit={handleEditReport}
                        onDownload={handleDownloadReport}
                        onShare={handleShareReport}
                        onDelete={handleDeleteReport}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            {/* Templates Tab Content */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Report Templates</h2>
                  <p className="text-sm text-gray-500 dark:!text-gray-300">Pre-configured templates for consistent reporting</p>
                </div>
                <Button onClick={() => setIsTemplateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Loading templates...</p>
                  </CardContent>
                </Card>
              ) : reportTemplates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
                    <p className="text-sm text-gray-500 dark:!text-gray-300 mb-4">Create your first template to get started</p>
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
                            <div className="p-2 bg-amber-50 rounded-lg">
                              <FileCheck className="w-5 h-5 text-red-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {template.name}
                                {template.isDefault && (
                                  <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                                )}
                              </h3>
                              <p className="text-xs text-gray-500 dark:!text-gray-400 line-clamp-2">{template.description || 'No description'}</p>
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
                          <span className="text-xs text-gray-500 dark:!text-gray-400">
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
                  <p className="text-sm text-gray-500 dark:!text-gray-300">Insights into your reporting performance and trends</p>
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
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Avg Report Accuracy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-amber-100 rounded-lg inline-flex mb-3">
                      <Clock className="w-6 h-6 text-red-700" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">2.3h</p>
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Avg Time to Complete</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="p-3 bg-amber-100 rounded-lg inline-flex mb-3">
                      <Target className="w-6 h-6 text-red-700" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">98.1%</p>
                    <p className="text-sm text-gray-500 dark:!text-gray-300">Client Approval Rate</p>
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
                        <p className="text-sm text-gray-500 dark:!text-gray-300">Monthly report generation chart</p>
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
                        <p className="text-sm text-gray-500 dark:!text-gray-300">Defect type breakdown chart</p>
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

      {/* New Report Modal */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onOpenChange={setIsNewReportModalOpen}
        projects={projects}
        reportTemplates={reportTemplates}
        loading={loading}
        newReportForm={newReportForm}
        setNewReportForm={setNewReportForm}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        createReportTab={createReportTab}
        setCreateReportTab={setCreateReportTab}
        onSubmit={handleCreateReport}
      />

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        newTemplateForm={newTemplateForm}
        setNewTemplateForm={setNewTemplateForm}
        createTemplateTab={createTemplateTab}
        setCreateTemplateTab={setCreateTemplateTab}
        onSubmit={handleCreateTemplate}
        onCancel={() => {
          setIsTemplateModalOpen(false)
          setCreateTemplateTab('info')
          setNewTemplateForm({ name: '', description: '', fields: [], sections: [] })
        }}
        onAddSection={handleAddNewSection}
        onRemoveSection={handleRemoveNewSection}
        onUpdateSection={handleUpdateNewSection}
      />

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={isEditTemplateModalOpen}
        onOpenChange={setIsEditTemplateModalOpen}
        editTemplateForm={editTemplateForm}
        setEditTemplateForm={setEditTemplateForm}
        onSubmit={handleUpdateTemplate}
        onCancel={() => {
          setIsEditTemplateModalOpen(false)
          setEditTemplateForm({ id: '', name: '', description: '', sections: [], fields: [], isDefault: false })
        }}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
        onUpdateSection={handleUpdateSection}
      />
    </div>
  )
}

export default QualityReportPage
