'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, Share2, Plus, Search, Filter, Calendar, MapPin,
  User, Camera, Brain, AlertTriangle, CheckCircle, Clock, Eye, MoreVertical,
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Zap,
  Settings, ArrowUpRight, ArrowDownRight, Play, Pause, RefreshCw,
  ExternalLink, Mail, Printer, Archive, Edit, Trash2, Loader2, X,
  Upload, FileUp, ChevronDown, LayoutGrid, List, Table2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAlert } from "@/components/providers/AlertProvider"
import reportsApi from '@/data/reportsApi'

// ─── Avatar Helper ───────────────────────────────────────────────
const getInitials = (firstName, lastName, username, email) => {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  if (username) return username[0].toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

const avatarColors = [
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
]

const getAvatarColor = (str = '') => avatarColors[str.charCodeAt(0) % avatarColors.length]

const getBaseUrl = () => typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL : ''
// Use backend avatar endpoint so the actual profile picture is always loaded (or server placeholder)
const avatarSrc = (user) => {
  const id = user?._id || user?.id
  if (!id) return null
  return `${getBaseUrl()}/api/users/avatar/${id}`
}

const UserAvatar = ({ user, size = 'md', showRole = false }) => {
  if (!user) return null
  const initials = getInitials(user.first_name, user.last_name, user.username, user.email)
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email || ''
  const color = user._avatarOverrideColor || getAvatarColor(name)
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const src = avatarSrc(user)

  const handleImgError = (e) => {
    e.target.style.display = 'none'
    const fallback = e.target.nextElementSibling
    if (fallback) fallback.classList.remove('hidden')
  }
  if (showRole) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden relative`}>
          {src ? (
            <>
              <img src={src} alt={name} className="w-full h-full rounded-full object-cover absolute inset-0" onError={handleImgError} />
              <span className="hidden">{initials}</span>
            </>
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name || '—'}</p>
          {user.role && <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden relative`} title={name}>
      {src ? (
        <>
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover absolute inset-0" onError={handleImgError} />
          <span className="hidden">{initials}</span>
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

// ─── Leader Select with Avatar ────────────────────────────────────
const LeaderOption = ({ leader }) => {
  const name = [leader.first_name, leader.last_name].filter(Boolean).join(' ') || leader.username || leader.email || ''
  return (
    <div className="flex items-center gap-2">
      <UserAvatar user={leader} size="sm" />
      <span className="text-sm">{name}</span>
    </div>
  )
}

const Reports = () => {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [filterLeaderId, setFilterLeaderId] = useState('')
  const [leaders, setLeaders] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [reportsView, setReportsView] = useState('grid') // 'grid' | 'table'

  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState({
    totalReports: 0, completedReports: 0, pendingReports: 0,
    inProgressReports: 0, totalInspectionLength: '0km', averageConfidence: 0,
    criticalIssues: 0, totalDefects: 0, averageProcessingTime: '0 hours',
    aiAccuracy: 0, monthlyGrowth: 0, reportTypes: { pacp: 0, condition: 0, analytics: 0 }
  })

  const [templates, setTemplates] = useState([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', sections: [] })
  const [creatingTemplate, setCreatingTemplate] = useState(false)

  const [isCreateForUserOpen, setIsCreateForUserOpen] = useState(false)
  const [createLeaderId, setCreateLeaderId] = useState('')
  const [createProjects, setCreateProjects] = useState([])
  const [createProjectId, setCreateProjectId] = useState('')
  const [createTemplateId, setCreateTemplateId] = useState('')
  const [createQcId, setCreateQcId] = useState('')
  const [creatingReport, setCreatingReport] = useState(false)
  const [importing, setImporting] = useState(false)

  const roseGradientClass = "bg-gradient-to-r from-[#D76A84] to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const [reportsResponse, analyticsResponse, templatesResponse] = await Promise.all([
        reportsApi.getReports({ status: filterStatus, searchTerm: searchQuery, dateRange: filterPeriod, ...(filterLeaderId ? { managerId: filterLeaderId } : {}) }),
        reportsApi.getReportsAnalytics(filterPeriod),
        reportsApi.getTemplates()
      ])
      const reportsList = Array.isArray(reportsResponse?.data) ? reportsResponse.data : (reportsResponse?.data?.data ?? [])
      const analyticsInfo = analyticsResponse?.data ?? null
      const templatesList = Array.isArray(templatesResponse?.data) ? templatesResponse.data : (templatesResponse?.data ?? [])
      setReports(reportsList)
      setTemplates(templatesList)
      if (analyticsInfo) setAnalytics(prev => ({ ...prev, ...analyticsInfo }))
    } catch (error) {
      console.error("Failed to fetch reports data:", error)
    } finally {
      if (isRefresh) setRefreshing(false)
      else setLoading(false)
    }
  }, [filterStatus, searchQuery, filterPeriod, filterLeaderId])

  useEffect(() => {
    reportsApi.getReportLeaders().then((list) => setLeaders(Array.isArray(list) ? list : [])).catch(() => setLeaders([]))
  }, [])

  useEffect(() => {
    if (!createLeaderId) { setCreateProjects([]); setCreateProjectId(''); return }
    reportsApi.getProjectsForReport(null, createLeaderId).then((list) => { setCreateProjects(Array.isArray(list) ? list : []); setCreateProjectId('') }).catch(() => setCreateProjects([]))
  }, [createLeaderId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreateReportForUser = async (e) => {
    e.preventDefault()
    if (!createProjectId) { showAlert('Please select a project', 'warning'); return }
    setCreatingReport(true)
    try {
      await reportsApi.createReport({ projectId: createProjectId, templateId: createTemplateId || undefined, qcTechnicianId: createQcId || undefined })
      setIsCreateForUserOpen(false)
      setCreateLeaderId(''); setCreateProjectId(''); setCreateTemplateId(''); setCreateQcId('')
      fetchData(true)
      showAlert('Report created successfully', 'success')
    } catch (error) {
      showAlert(error?.message || 'Failed to create report', 'error')
    } finally {
      setCreatingReport(false)
    }
  }

  const handleExportReports = () => {
    const leaderName = (r) => {
      const m = r.projectId?.managerId
      return m ? [m.first_name, m.last_name].filter(Boolean).join(' ') || m.username || m.email || '' : ''
    }
    const headers = ['Inspection ID', 'Location', 'Date', 'Status', 'Project', 'Leader', 'Operator', 'QC', 'Footage', 'Defects', 'Critical', 'Confidence']
    const rows = reports.map((r) => [r.inspectionId || '', r.location || '', r.date || '', r.status || '', (r.projectId && (r.projectId.name || r.projectId._id)) || '', leaderName(r), (r.operator && (r.operator.first_name + ' ' + r.operator.last_name)) || '', (r.qcTechnician && (r.qcTechnician.first_name + ' ' + r.qcTechnician.last_name)) || '', r.footage || '0', r.totalDefects ?? '', r.criticalDefects ?? '', r.confidence ?? ''])
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    showAlert('Report exported as CSV', 'success')
  }

  const handleImportReport = (e) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result
        const json = JSON.parse(text)
        const list = Array.isArray(json) ? json : (json.data ? (Array.isArray(json.data) ? json.data : [json.data]) : [json])
        let created = 0
        for (const item of list) {
          const projectId = item.projectId || item.project_id
          if (!projectId) continue
          await reportsApi.createReport({ projectId, templateId: item.templateId || item.template_id, qcTechnicianId: item.qcTechnicianId || item.qc_technician_id })
          created++
        }
        showAlert(`Imported ${created} report(s)`, 'success')
        fetchData(true)
      } catch (err) {
        showAlert(err?.message || 'Import failed. Use JSON with projectId.', 'error')
      } finally {
        setImporting(false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const addSection = () => setNewTemplate(prev => ({ ...prev, sections: [...(prev.sections || []), { name: '', fields: [], order: (prev.sections || []).length }] }))
  const removeSection = (index) => setNewTemplate(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }))
  const updateSectionName = (index, name) => setNewTemplate(prev => { const s = [...prev.sections]; s[index] = { ...s[index], name }; return { ...prev, sections: s } })
  const updateSectionFields = (index, fieldsString) => setNewTemplate(prev => { const s = [...prev.sections]; s[index] = { ...s[index], fields: fieldsString.split(',').map(f => f.trim()).filter(f => f) }; return { ...prev, sections: s } })

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    setCreatingTemplate(true)
    try {
      await reportsApi.createTemplate({ ...newTemplate, sections: newTemplate.sections || [] })
      setIsTemplateModalOpen(false)
      setNewTemplate({ name: '', description: '', sections: [] })
      showAlert('Template created successfully', 'success')
      fetchData(true)
    } catch (error) {
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

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-500'
      case 'pending': return 'bg-amber-500'
      case 'in-review':
      case 'in_progress': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // ─── Stat Card ──────────────────────────────────────────────────
  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )

  // ─── Report Card (Grid View) ─────────────────────────────────────
  const ReportCard = ({ report }) => {
    const reportId = report._id || report.id
    const projectName = report.projectId?.name || ''
    const operator = report.operator
    const qc = report.qcTechnician
    const leader = report.projectId?.managerId
    const createdBy = report.createdBy || operator

    return (
      <Card
        className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md cursor-pointer"
        onClick={() => reportId && router.push(`/admin/report/${reportId}`)}
      >
        {/* Color accent top bar */}
        <div className={`h-1 w-full ${report.status === 'completed' ? 'bg-emerald-400' : report.status === 'pending' ? 'bg-amber-400' : report.status === 'in-review' || report.status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-300'}`} />

        <CardContent className="p-5">
          {/* Header: ID + Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-rose-50 rounded-lg">
                  <FileText className="w-3.5 h-3.5 text-[#D76A84]" />
                </div>
                <span className="text-xs font-mono text-gray-400 truncate">{report.inspectionId || 'RPT-' + (reportId?.slice(-6) || '000000')}</span>
              </div>
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {projectName || report.location || 'Untitled Report'}
              </h3>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(report.status)}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(report.status)}`} />
              {report.status?.replace('_', ' ').replace(/-/g, ' ') || 'unknown'}
            </div>
          </div>

          {/* Location & Date */}
          <div className="flex items-center gap-3 mb-4">
            {report.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3 text-[#D76A84]" />
                <span className="truncate max-w-[120px]">{report.location}</span>
              </div>
            )}
            {(report.date || report.createdAt) && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{report.date || new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Metrics row (only if completed) */}
          {report.status === 'completed' && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-base font-bold text-gray-900">{report.totalDefects ?? 0}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Defects</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="text-base font-bold text-red-600">{report.criticalDefects ?? 0}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Critical</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <div className="text-base font-bold text-purple-600">{report.confidence != null ? Number(report.confidence).toFixed(1) : 0}%</div>
                <div className="text-[10px] text-gray-500 mt-0.5">AI Conf.</div>
              </div>
            </div>
          )}

          {/* People row */}
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center justify-between">
              {/* Operator + QC avatars stacked */}
              <div className="flex items-center">
                {/* Avatar stack */}
                <div className="flex -space-x-2">
                  {operator && (
                    <div title={`Operator: ${[operator.first_name, operator.last_name].filter(Boolean).join(' ') || operator.username}`}>
                      <UserAvatar user={operator} size="sm" />
                    </div>
                  )}
                  {qc && (
                    <div title={`QC: ${[qc.first_name, qc.last_name].filter(Boolean).join(' ') || qc.username}`}>
                      <UserAvatar user={{ ...qc, _avatarOverrideColor: 'bg-teal-500' }} size="sm" />
                    </div>
                  )}
                  {leader && (
                    <div title={`Leader: ${[leader.first_name, leader.last_name].filter(Boolean).join(' ') || leader.username}`}>
                      <UserAvatar user={leader} size="sm" />
                    </div>
                  )}
                </div>
                {/* Show role of first person */}
                {operator && (
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-700 leading-none">
                      {[operator.first_name, operator.last_name].filter(Boolean).join(' ') || operator.username || 'Operator'}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize mt-0.5">{operator.role || 'operator'}</p>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-[#D76A84] hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); reportId && router.push(`/admin/report/${reportId}`) }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── Report Table Row ────────────────────────────────────────────
  const ReportTableRow = ({ report }) => {
    const reportId = report._id || report.id
    const projectName = report.projectId?.name || '—'
    const operator = report.operator
    const leader = report.projectId?.managerId

    return (
      <tr
        className="group hover:bg-rose-50/40 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
        onClick={() => reportId && router.push(`/admin/report/${reportId}`)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <FileText className="w-3.5 h-3.5 text-[#D76A84]" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{report.inspectionId || 'RPT-' + (reportId?.slice(-6) || '000000')}</div>
              <div className="text-xs text-gray-400">{projectName}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {report.location || '—'}
          </div>
        </td>
        <td className="py-3 px-4">
          {operator ? (
            <UserAvatar user={operator} size="sm" showRole />
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
        </td>
        <td className="py-3 px-4">
          {leader ? (
            <UserAvatar user={leader} size="sm" showRole />
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
        <td className="py-3 px-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(report.status)}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(report.status)}`} />
            {report.status?.replace('_', ' ') || '—'}
          </div>
        </td>
        <td className="py-3 px-4 text-xs text-gray-500">
          {report.date || (report.createdAt && new Date(report.createdAt).toLocaleDateString()) || '—'}
        </td>
        <td className="py-3 px-4 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-[#D76A84] hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); reportId && router.push(`/admin/report/${reportId}`) }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        </td>
      </tr>
    )
  }

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

  const selectedLeader = leaders.find(l => l._id === filterLeaderId)

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
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="hover:bg-rose-50 hover:text-rose-600 border-gray-200"
                onClick={() => setIsCreateForUserOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create report for user
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className={roseGradientClass}>
                    Actions <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportReports}>
                    <Download className="w-4 h-4 mr-2" /> Export
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <label className="flex cursor-pointer items-center w-full">
                      <Upload className="w-4 h-4 mr-2" /> Import report
                      <input type="file" accept=".json" className="hidden" disabled={importing} onChange={handleImportReport} />
                    </label>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => fetchData(true)} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sync
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Create report for user modal */}
      <Dialog open={isCreateForUserOpen} onOpenChange={setIsCreateForUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create report for user</DialogTitle>
            <DialogDescription>Select a team leader and project to create an inspection report.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReportForUser} className="space-y-4 mt-4">
            {/* Leader select with preview */}
            <div className="space-y-2">
              <Label>Team leader</Label>
              <Select value={createLeaderId || '__none__'} onValueChange={(v) => setCreateLeaderId(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leader">
                    {createLeaderId && leaders.find(l => l._id === createLeaderId) ? (
                      <LeaderOption leader={leaders.find(l => l._id === createLeaderId)} />
                    ) : 'Select leader'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select leader</SelectItem>
                  {leaders.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      <LeaderOption leader={l} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Leader preview card */}
            {createLeaderId && leaders.find(l => l._id === createLeaderId) && (
              <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                <UserAvatar user={leaders.find(l => l._id === createLeaderId)} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {[leaders.find(l => l._id === createLeaderId)?.first_name, leaders.find(l => l._id === createLeaderId)?.last_name].filter(Boolean).join(' ') || leaders.find(l => l._id === createLeaderId)?.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{leaders.find(l => l._id === createLeaderId)?.role || 'Team Leader'}</p>
                  <p className="text-xs text-gray-400">{leaders.find(l => l._id === createLeaderId)?.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={createProjectId || '__none__'} onValueChange={(v) => setCreateProjectId(v === '__none__' ? '' : v)} disabled={!createLeaderId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select project</SelectItem>
                  {createProjects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>{p.name || p._id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select value={createTemplateId || '__none__'} onValueChange={(v) => setCreateTemplateId(v === '__none__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="No template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No template</SelectItem>
                  {templates.map((t) => (<SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsCreateForUserOpen(false)}>Cancel</Button>
              <Button type="submit" className={roseGradientClass} disabled={creatingReport || !createProjectId}>
                {creatingReport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-4 mb-8 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            {['overview', 'reports', 'analytics', 'templates'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-[#D76A84] data-[state=active]:text-white rounded-lg transition-all capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview Tab ─────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total Reports" value={analytics.totalReports} subtitle="This period" icon={FileText} color="bg-gradient-to-br from-blue-500 to-purple-600" trend={analytics.monthlyGrowth} />
              <StatCard title="Completed" value={analytics.completedReports} subtitle={`${analytics.pendingReports} pending`} icon={CheckCircle} color="bg-gradient-to-br from-green-500 to-emerald-600" />
              <StatCard title="AI Accuracy" value={`${analytics.aiAccuracy}%`} subtitle="Avg. Confidence" icon={Brain} color="bg-gradient-to-br from-[#D76A84] to-pink-600" />
              <StatCard title="Critical Issues" value={analytics.criticalIssues} subtitle="Needs Attention" icon={AlertTriangle} color="bg-gradient-to-br from-orange-500 to-red-600" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest generated inspection reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 8).map((report) => {
                    const operator = report.operator
                    const leader = report.projectId?.managerId
                    return (
                      <div
                        key={report._id || report.id}
                        className="flex items-center justify-between p-4 border border-gray-100 hover:border-rose-100 rounded-xl hover:bg-rose-50/30 transition-all cursor-pointer group"
                        onClick={() => (report._id || report.id) && router.push(`/admin/report/${report._id || report.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-lg text-white flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{report.inspectionId || report.projectId?.name || report.location || 'Untitled Report'}</h4>
                            <p className="text-xs text-gray-400">{report.location || '—'} · {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Operator avatar */}
                          {operator && (
                            <div className="hidden sm:flex items-center gap-2">
                              <UserAvatar user={operator} size="sm" />
                              <span className="text-xs text-gray-500">{[operator.first_name, operator.last_name].filter(Boolean).join(' ') || operator.username}</span>
                            </div>
                          )}
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                  {reports.length === 0 && <div className="text-center py-8 text-gray-400">No recent reports found</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Reports Tab ──────────────────────────────────────────── */}
          <TabsContent value="reports" className="space-y-5">
            {/* Filters card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 focus-visible:ring-[#D76A84]" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Period" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Leader filter with avatar preview */}
                  <Select value={filterLeaderId || 'all'} onValueChange={(v) => setFilterLeaderId(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Leader">
                        {selectedLeader ? (
                          <div className="flex items-center gap-2">
                            <UserAvatar user={selectedLeader} size="sm" />
                            <span className="text-sm truncate">
                              {[selectedLeader.first_name, selectedLeader.last_name].filter(Boolean).join(' ') || selectedLeader.username}
                            </span>
                          </div>
                        ) : 'All leaders'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All leaders</SelectItem>
                      {leaders.map((l) => (
                        <SelectItem key={l._id} value={l._id}>
                          <div className="flex items-center gap-2">
                            <UserAvatar user={l} size="sm" />
                            <span>{[l.first_name, l.last_name].filter(Boolean).join(' ') || l.username || l.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View toggle */}
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg flex-shrink-0">
                    <button
                      onClick={() => setReportsView('grid')}
                      className={`p-1.5 rounded-md transition-colors ${reportsView === 'grid' ? 'bg-white shadow-sm text-[#D76A84]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReportsView('table')}
                      className={`p-1.5 rounded-md transition-colors ${reportsView === 'table' ? 'bg-white shadow-sm text-[#D76A84]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Table2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results count */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-gray-500">
                {reports.length > 0 ? `Showing ${reports.length} report${reports.length !== 1 ? 's' : ''}` : ''}
              </p>
            </div>

            {/* Grid View */}
            {reportsView === 'grid' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {reports.map((report) => (
                  <ReportCard key={report._id || report.id} report={report} />
                ))}
                {reports.length === 0 && (
                  <div className="col-span-full text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <FileText className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium">No reports match your filters</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {reportsView === 'table' && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Report</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Location</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Operator</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Leader</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Date</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reports.map((report) => (
                        <ReportTableRow key={report._id || report.id} report={report} />
                      ))}
                    </tbody>
                  </table>
                  {reports.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                      <p className="font-medium">No reports match your filters</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ── Analytics Tab ────────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="w-4 h-4 text-[#D76A84]" />
                    Report Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'PACP Reports', value: analytics.reportTypes?.pacp || 0, color: 'bg-purple-500' },
                    { label: 'Condition Assessments', value: analytics.reportTypes?.condition || 0, color: 'bg-blue-500' },
                    { label: 'Analytics Reports', value: analytics.reportTypes?.analytics || 0, color: 'bg-emerald-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-sm text-gray-600">{label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-4 h-4 text-[#D76A84]" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: 'Average Processing Time', value: analytics.averageProcessingTime, progress: 75 },
                    { label: 'AI Accuracy Rate', value: `${analytics.aiAccuracy}%`, progress: analytics.aiAccuracy },
                    {
                      label: 'Report Completion Rate',
                      value: `${analytics.totalReports > 0 ? Math.round((analytics.completedReports / analytics.totalReports) * 100) : 0}%`,
                      progress: analytics.totalReports > 0 ? (analytics.completedReports / analytics.totalReports) * 100 : 0
                    },
                  ].map(({ label, value, progress }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Templates Tab ────────────────────────────────────────── */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured templates for different report types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                    <DialogTrigger asChild>
                      <Card className="border-dashed border-2 border-gray-200 hover:border-[#D76A84] transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[200px]">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-100 transition-colors">
                            <Plus className="w-6 h-6 text-[#D76A84]" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">Create New Template</h3>
                          <p className="text-sm text-gray-400">Design a custom report template</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Report Template</DialogTitle>
                        <DialogDescription>Define the structure and sections for your report.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateTemplate} className="space-y-6">
                        <div className="grid gap-3">
                          <Label htmlFor="t-name">Template Name</Label>
                          <Input id="t-name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="e.g., Structural Inspection V2" required />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="t-desc">Description</Label>
                          <Textarea id="t-desc" value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} placeholder="Brief description..." />
                        </div>
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Report Sections</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSection}>
                              <Plus className="w-4 h-4 mr-2" /> Add Section
                            </Button>
                          </div>
                          {newTemplate.sections?.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">No sections yet. Click "Add Section" to begin.</p>
                          )}
                          {newTemplate.sections?.map((section, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border relative">
                              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-gray-300 hover:text-red-500" onClick={() => removeSection(index)}>
                                <X className="w-4 h-4" />
                              </Button>
                              <div className="space-y-3">
                                <div className="grid gap-2">
                                  <Label>Section Name</Label>
                                  <Input value={section.name} onChange={(e) => updateSectionName(index, e.target.value)} placeholder="e.g., Site Conditions" className="bg-white" />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Fields (comma separated)</Label>
                                  <Input value={section.fields.join(', ')} onChange={(e) => updateSectionFields(index, e.target.value)} placeholder="e.g., Weather, Temperature, Surface Type" className="bg-white" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={creatingTemplate} className={roseGradientClass}>
                            {creatingTemplate && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Template
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {templates.map((template) => (
                    <Card key={template._id} className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm group">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                          <FileText className="w-6 h-6 text-[#D76A84]" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description || "No description provided."}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="text-xs">{template.sections?.length || 0} Sections</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {templates.length === 0 && (
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-purple-400">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Standard PACP Report</h3>
                        <p className="text-sm text-gray-400 mb-4">Comprehensive pipeline assessment following PACP standards</p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">System Default</Badge>
                      </CardContent>
                    </Card>
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