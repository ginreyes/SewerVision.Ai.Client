'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  FileText,
  Calendar,
  User,
  MapPin,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Info,
  Activity,
  Filter,
  Image as ImageIcon,
  Loader2,
  Copy,
  MoreHorizontal,
  TrendingUp,
  Hash,
  Flag,
  Zap,
  Shield,
  Target,
  BarChart3,
  Eye,
  Edit3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter, useParams } from 'next/navigation'
import reportsApi from '@/data/reportsApi'
import { qcApi } from '@/data/qcApi'
import Chart from 'chart.js/auto'

/* ─── Status config ─── */
const statusConfig = {
  completed: {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    icon: CheckCircle, label: 'Completed',
  },
  pending: {
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    icon: Clock, label: 'Pending',
  },
  'in-review': {
    bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200',
    icon: Eye, label: 'In Review',
  },
  in_review: {
    bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200',
    icon: Eye, label: 'In Review',
  },
  draft: {
    bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200',
    icon: FileText, label: 'Draft',
  },
}

const StatusPill = ({ status }) => {
  const key = status?.toLowerCase()?.replace(/\s/g, '_')
  const cfg = statusConfig[key] || statusConfig.draft
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

/* ─── Severity badge ─── */
const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    major: 'bg-orange-100 text-orange-800 border-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    minor: 'bg-green-100 text-green-800 border-green-200',
  }
  const s = severity?.toLowerCase()
  const cls = styles[s] || 'bg-gray-100 text-gray-800 border-gray-200'
  return <Badge className={`${cls} border`}>{severity || 'Unknown'}</Badge>
}

/* ─── Info row ─── */
const InfoRow = ({ icon: Icon, label, value, subValue, iconColor = 'text-gray-400' }) => (
  <div className="flex items-start gap-3 py-3">
    <div className={`mt-0.5 p-2 rounded-lg bg-gray-50 ${iconColor}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
  </div>
)

/* ─── Timeline item ─── */
const TimelineItem = ({ icon: Icon, title, time, description, isLast, color = 'bg-rose-500' }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
    </div>
    <div className="pb-5">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      {description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>}
    </div>
  </div>
)

/* ─── Linear Pipe Graph ─── */
const LinearPipeGraph = ({ length, defects }) => {
  const numericLength = length ? parseFloat(length.toString().replace(/[^0-9.]/g, '')) : 100
  if (!numericLength || isNaN(numericLength)) return null

  const getPositionPct = (location) => {
    const loc = parseFloat(location?.toString().replace(/[^0-9.]/g, '') || 0)
    return Math.min(Math.max((loc / numericLength) * 100, 0), 100)
  }

  return (
    <div className="w-full mt-4 mb-2">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">Pipe Condition Map</p>
      <div className="relative w-full h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center">
        <div className="absolute left-0 right-0 h-4 bg-gray-300 rounded top-1/2 transform -translate-y-1/2 mx-2" />
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 font-medium">0 ft</div>
        <div className="absolute -bottom-6 right-0 text-xs text-gray-500 font-medium">{length}</div>
        {defects.map((defect, idx) => {
          const pct = getPositionPct(defect.location)
          let color = 'bg-green-500'
          if (defect.severity?.toLowerCase() === 'critical') color = 'bg-red-600 z-30'
          else if (defect.severity?.toLowerCase() === 'major') color = 'bg-orange-500 z-20'
          else if (defect.severity?.toLowerCase() === 'moderate') color = 'bg-yellow-500 z-10'
          return (
            <div
              key={idx}
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-white shadow-sm cursor-help hover:scale-150 transition-transform ${color}`}
              style={{ left: `${pct}%` }}
              title={`${defect.description} (${defect.location})`}
            />
          )
        })}
      </div>
      <div className="flex justify-center gap-4 mt-8">
        {[
          { label: 'Critical', color: 'bg-red-600' },
          { label: 'Major', color: 'bg-orange-500' },
          { label: 'Moderate', color: 'bg-yellow-500' },
          { label: 'Minor', color: 'bg-green-500' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
const ReportDetailView = () => {
  const router = useRouter()
  const params = useParams()
  const { report_id } = params || {}

  const [report, setReport] = useState(null)
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [defectFilter, setDefectFilter] = useState('all')
  const [isEditingMeta, setIsEditingMeta] = useState(false)
  const [savingMeta, setSavingMeta] = useState(false)
  const [editMeta, setEditMeta] = useState({
    status: 'draft',
    overallGrade: '',
    confidence: 0,
    footage: '',
    totalDefects: 0,
    criticalDefects: 0,
  })

  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!report_id) return
      try {
        setLoading(true)
        const reportData = await reportsApi.getReportById(report_id)
        const actualReport = reportData

        let fetchedDefects = []
        if (actualReport.projectId) {
          const projectId = typeof actualReport.projectId === 'object' ? actualReport.projectId._id : actualReport.projectId
          if (projectId) {
            try {
              const detections = await qcApi.getProjectDetections(projectId)
              fetchedDefects = detections || []
            } catch (dErr) {
              console.warn('Could not fetch detections:', dErr)
            }
          }
        }

        setReport(actualReport)
        setEditMeta({
          status: actualReport.status || 'draft',
          overallGrade: actualReport.overallGrade || '',
          confidence: actualReport.confidence ?? 0,
          footage: actualReport.footage || '',
          totalDefects: actualReport.totalDefects || 0,
          criticalDefects: actualReport.criticalDefects || 0,
        })
        setDefects(fetchedDefects)
      } catch (err) {
        console.error('Error loading report:', err)
        setError(err.message || 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [report_id])

  // Chart
  useEffect(() => {
    if (loading || !report || !chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const severityCounts = {
      Critical: defects.filter((d) => d.severity?.toLowerCase() === 'critical').length || report.criticalDefects || 0,
      Major: defects.filter((d) => d.severity?.toLowerCase() === 'major').length || 0,
      Moderate: defects.filter((d) => d.severity?.toLowerCase() === 'moderate').length || 0,
      Minor: defects.filter((d) => d.severity?.toLowerCase() === 'minor').length || 0,
    }

    const ctx = chartRef.current.getContext('2d')
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'Major', 'Moderate', 'Minor'],
        datasets: [{
          data: [severityCounts.Critical, severityCounts.Major, severityCounts.Moderate, severityCounts.Minor],
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 6 } },
        },
      },
    })

    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [report, defects, loading])

  const handleCopyId = () => {
    navigator.clipboard.writeText(report_id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (report_id) {
      reportsApi.downloadReport(report_id)
        .then(() => {})
        .catch((err) => console.error('Download failed:', err))
    }
  }

  const handleSaveMeta = async () => {
    if (!report_id) return
    try {
      setSavingMeta(true)
      const payload = {
        status: editMeta.status,
        overallGrade: editMeta.overallGrade || undefined,
        confidence: Number(editMeta.confidence) || 0,
        footage: editMeta.footage,
        totalDefects: Number(editMeta.totalDefects) || 0,
        criticalDefects: Number(editMeta.criticalDefects) || 0,
      }
      const updated = await reportsApi.updateReport(report_id, payload)
      const updatedReport = updated?.data || updated
      setReport((prev) => ({ ...(prev || {}), ...(updatedReport || payload) }))
      setIsEditingMeta(false)
    } catch (err) {
      console.error('Failed to update report metadata:', err)
    } finally {
      setSavingMeta(false)
    }
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
          <p className="text-gray-900 font-medium">Loading report details</p>
          <p className="text-gray-400 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    )
  }

  /* ─── Error ─── */
  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
        <p className="text-gray-400 mb-6">{error || 'Report not found'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    )
  }

  /* ─── Derived values ─── */
  const projectName = report.projectId?.name || report.projectId?.title || 'Unknown Project'
  const operatorName = report.operator?.first_name ? `${report.operator.first_name} ${report.operator.last_name}` : '—'
  const qcTechName = report.qcTechnician?.first_name ? `${report.qcTechnician.first_name} ${report.qcTechnician.last_name}` : '—'
  const location = report.projectId?.location || report.location || '—'
  const createdAt = report.createdAt ? new Date(report.createdAt) : null
  const updatedAt = report.updatedAt ? new Date(report.updatedAt) : null
  const reportDate = report.date ? new Date(report.date) : null

  const totalDefectsCount = defects.length > 0 ? defects.length : (report.totalDefects || 0)
  const criticalCount = defects.length > 0 ? defects.filter((d) => d.severity?.toLowerCase() === 'critical').length : (report.criticalDefects || 0)
  const majorCount = defects.filter((d) => d.severity?.toLowerCase() === 'major').length
  const moderateCount = defects.filter((d) => d.severity?.toLowerCase() === 'moderate').length
  const minorCount = defects.filter((d) => d.severity?.toLowerCase() === 'minor').length

  const shortId = report._id?.substring(0, 8) || report.id || '—'

  // Filtered defects
  const filteredDefects = defectFilter === 'all'
    ? defects
    : defects.filter((d) => d.severity?.toLowerCase() === defectFilter)

  // Timeline
  const timeline = []
  if (createdAt) {
    timeline.push({
      icon: FileText, title: 'Report created', color: 'bg-gray-400',
      time: createdAt.toLocaleString(),
      description: `Type: ${report.reportType || 'Condition Assessment'}`,
    })
  }
  if (report.operator) {
    timeline.push({
      icon: User, title: `Operator: ${operatorName}`, color: 'bg-sky-500',
      time: createdAt ? createdAt.toLocaleString() : '—',
      description: null,
    })
  }
  if (report.qcTechnician) {
    timeline.push({
      icon: Shield, title: `QC Tech: ${qcTechName}`, color: 'bg-violet-500',
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: null,
    })
  }
  if (report.status?.toLowerCase() === 'completed') {
    timeline.push({
      icon: CheckCircle, title: 'Report completed', color: 'bg-emerald-500',
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: report.overallGrade ? `Grade: ${report.overallGrade}` : null,
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 pb-20">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0 mt-0.5 h-9 w-9 border-gray-200 hover:bg-gray-50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {shortId}
              </span>
              <span className="text-xs text-gray-400">
                {report.reportType || 'Condition Assessment'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {projectName}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusPill status={report.status} />
              {report.overallGrade && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                  <Target className="w-3 h-3" />
                  Grade {report.overallGrade}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-gray-200 hover:bg-gray-50 rounded-lg hidden sm:flex"
            onClick={handleCopyId}
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-200 hover:bg-gray-50 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ─── Quick stats strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Footage',
            value: `${report.footage || 0} ft`,
            icon: Ruler,
            iconBg: 'bg-sky-50 text-sky-600',
          },
          {
            label: 'Total Defects',
            value: totalDefectsCount,
            icon: AlertTriangle,
            iconBg: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Critical',
            value: criticalCount,
            icon: Flag,
            iconBg: 'bg-red-50 text-red-600',
          },
          {
            label: 'AI Confidence',
            value: `${report.confidence != null ? Number(report.confidence).toFixed(1) : 0}%`,
            icon: Zap,
            iconBg: 'bg-violet-50 text-violet-600',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── Left column ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Executive Summary */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Severity breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Critical', count: criticalCount, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', sub: 'text-red-800' },
                  { label: 'Major', count: majorCount, bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', sub: 'text-orange-800' },
                  { label: 'Moderate', count: moderateCount, bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', sub: 'text-yellow-800' },
                  { label: 'Minor', count: minorCount, bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', sub: 'text-green-800' },
                ].map((item) => (
                  <div key={item.label} className={`p-3 ${item.bg} rounded-xl border ${item.border} text-center`}>
                    <span className={`text-2xl font-bold ${item.text}`}>{item.count}</span>
                    <p className={`text-xs font-medium ${item.sub} uppercase tracking-wide mt-0.5`}>{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Pipe condition map */}
              <LinearPipeGraph length={report.footage || '0 ft'} defects={defects} />
            </CardContent>
          </Card>

          {/* Project & Location */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Project & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="pr-0 sm:pr-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow icon={MapPin} label="Location" value={location} iconColor="text-emerald-500" />
                  <InfoRow icon={User} label="Operator" value={operatorName} iconColor="text-sky-500" />
                </div>
                <div className="pl-0 sm:pl-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow icon={Ruler} label="Pipe Material" value={report.pipeType || '—'} iconColor="text-amber-500" />
                  <InfoRow icon={Target} label="Diameter" value={report.pipeDiameter || '—'} iconColor="text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Details */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="pr-0 sm:pr-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Calendar}
                    label="Inspection Date"
                    value={reportDate ? reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    iconColor="text-sky-500"
                  />
                  <InfoRow
                    icon={Hash}
                    label="Report ID"
                    value={<span className="font-mono text-xs">{shortId}</span>}
                    iconColor="text-gray-400"
                  />
                </div>
                <div className="pl-0 sm:pl-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Shield}
                    label="QC Technician"
                    value={qcTechName}
                    iconColor="text-violet-500"
                  />
                  <InfoRow
                    icon={Activity}
                    label="Last Updated"
                    value={updatedAt ? updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    subValue={updatedAt ? updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null}
                    iconColor="text-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Findings */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Detailed Findings ({filteredDefects.length})
                </CardTitle>
                {/* Filter pills */}
                <div className="flex items-center gap-1">
                  {['all', 'critical', 'major', 'moderate', 'minor'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setDefectFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        defectFilter === f
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDefects.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {defectFilter === 'all' ? 'No defects recorded for this report.' : `No ${defectFilter} defects found.`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredDefects.map((defect, index) => (
                    <div key={defect._id || index} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start">
                      {/* Thumbnail */}
                      <div className="w-full md:w-28 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge severity={defect.severity} />
                              <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                              {defect.timestamp || defect.frameTime ? (
                                <span className="text-xs font-mono text-gray-400">{defect.timestamp || defect.frameTime}</span>
                              ) : null}
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {defect.description || defect.type || 'Unknown Defect'}
                            </h4>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-base font-bold text-gray-900">{defect.location || '—'}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Distance</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {defect.notes || defect.recommendation || 'No additional notes provided.'}
                        </p>
                        {/* Tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {defect.clockPosition && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] text-gray-500">
                              <Clock className="w-3 h-3" /> {defect.clockPosition}
                            </span>
                          )}
                          {defect.confidence && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] text-gray-500">
                              <Zap className="w-3 h-3" /> {Math.round(defect.confidence)}% AI
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {criticalCount > 0 ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                  <div className="shrink-0 p-2 bg-red-100 rounded-lg h-fit">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">Immediate Action Required</h4>
                    <p className="text-xs text-red-800 mt-1 leading-relaxed">
                      Critical defects detected. Schedule immediate repairs for the {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} to prevent structural failure.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-emerald-800 text-sm font-medium">No critical defects found. Routine maintenance recommended.</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Action Plan</h4>
                <div className="space-y-2">
                  {[
                    'Generate work orders for all Major and Critical defects.',
                    'Re-inspect in 12 months for Moderate defects progression.',
                    'Archive report and video footage for historical compliance.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-gray-500">{i + 1}</span>
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right column (sidebar) ─── */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {[
                { label: 'Export PDF', icon: Download, color: 'text-sky-600', bg: 'hover:bg-sky-50', onClick: handleDownload },
                { label: 'Print Report', icon: Printer, color: 'text-violet-600', bg: 'hover:bg-violet-50', onClick: () => window.print() },
                { label: 'Share Report', icon: Share2, color: 'text-emerald-600', bg: 'hover:bg-emerald-50', onClick: null },
                { label: 'Filter View', icon: Filter, color: 'text-amber-600', bg: 'hover:bg-amber-50', onClick: null },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 ${action.bg} transition-colors`}
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Edit Metadata */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4 flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gray-400" />
                Edit Report Metadata
              </CardTitle>
              <Button
                variant="outline"
                size="xs"
                className="h-7 px-2 text-[11px]"
                onClick={() => setIsEditingMeta((v) => !v)}
              >
                {isEditingMeta ? 'Close' : 'Edit'}
              </Button>
            </CardHeader>
            {isEditingMeta && (
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <p className="font-medium text-gray-700">Status</p>
                  <select
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white"
                    value={editMeta.status}
                    onChange={(e) => setEditMeta({ ...editMeta, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="in-review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-700">Overall Grade</p>
                  <select
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white"
                    value={editMeta.overallGrade || ''}
                    onChange={(e) => setEditMeta({ ...editMeta, overallGrade: e.target.value })}
                  >
                    <option value="">Not set</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-700">AI Confidence (%)</p>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs"
                    value={editMeta.confidence}
                    onChange={(e) => setEditMeta({ ...editMeta, confidence: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-700">Footage</p>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs"
                    value={editMeta.footage}
                    onChange={(e) => setEditMeta({ ...editMeta, footage: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700">Total Defects</p>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs"
                      value={editMeta.totalDefects}
                      onChange={(e) => setEditMeta({ ...editMeta, totalDefects: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-700">Critical Defects</p>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs"
                      value={editMeta.criticalDefects}
                      onChange={(e) => setEditMeta({ ...editMeta, criticalDefects: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setEditMeta({
                        status: report.status || 'draft',
                        overallGrade: report.overallGrade || '',
                        confidence: report.confidence ?? 0,
                        footage: report.footage || '',
                        totalDefects: report.totalDefects || 0,
                        criticalDefects: report.criticalDefects || 0,
                      })
                      setIsEditingMeta(false)
                    }}
                    disabled={savingMeta}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs"
                    onClick={handleSaveMeta}
                    disabled={savingMeta}
                  >
                    {savingMeta ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Defect Distribution Chart */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Defect Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-48 relative">
                <canvas ref={chartRef} />
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {timeline.length > 0 ? (
                <div>
                  {timeline.map((item, i) => (
                    <TimelineItem
                      key={i}
                      icon={item.icon}
                      title={item.title}
                      time={item.time}
                      description={item.description}
                      color={item.color}
                      isLast={i === timeline.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ReportDetailView