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
  ChevronDown,
  Info,
  Activity,
  Filter,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter, useParams } from 'next/navigation'
import reportsApi from '@/data/reportsApi'
import { qcApi } from '@/data/qcApi'
import Chart from 'chart.js/auto'

// Helper for severity colors
const getSeverityColor = (severity) => {
  if (!severity) return 'secondary'
  const lowerSev = severity.toLowerCase()
  if (lowerSev === 'critical') return 'destructive'
  if (lowerSev === 'major') return 'default' // utilizing default (usually black or primary) or custom class
  if (lowerSev === 'moderate') return 'secondary' // yellow/orange usually handled via custom class if needed
  if (lowerSev === 'minor') return 'outline'
  return 'outline'
}

// Custom Severity Badger with specific colors matching dashboard
const SeverityBadge = ({ severity }) => {
  let className = "bg-gray-100 text-gray-800 hover:bg-gray-200"
  if (!severity) return <Badge variant="outline">Unknown</Badge>

  const s = severity.toLowerCase()
  if (s === 'critical') className = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
  else if (s === 'major') className = "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200"
  else if (s === 'moderate') className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
  else if (s === 'minor') className = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"

  return <Badge className={`${className} border`}>{severity}</Badge>
}

// Linear Pipe Graph Visualization
const LinearPipeGraph = ({ length, defects }) => {
  // Parse length string to number (e.g. "1,250 ft" -> 1250)
  const numericLength = length ? parseFloat(length.toString().replace(/[^0-9.]/g, '')) : 100
  if (!numericLength || isNaN(numericLength)) return null

  // Group defects by position %
  const getPositionPct = (location) => {
    const loc = parseFloat(location?.toString().replace(/[^0-9.]/g, '') || 0)
    return Math.min(Math.max((loc / numericLength) * 100, 0), 100)
  }

  return (
    <div className="w-full mt-8 mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Pipe Condition Map</h4>
      <div className="relative w-full h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center">
        {/* Pipe Body */}
        <div className="absolute left-0 right-0 h-4 bg-gray-300 rounded top-1/2 transform -translate-y-1/2 mx-2"></div>

        {/* Start/End Labels */}
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 font-medium">0 ft</div>
        <div className="absolute -bottom-6 right-0 text-xs text-gray-500 font-medium">{length}</div>

        {/* Defects Markers */}
        {defects.map((defect, idx) => {
          const pct = getPositionPct(defect.location)
          let color = "bg-green-500"
          if (defect.severity?.toLowerCase() === 'critical') color = "bg-red-600 z-30"
          else if (defect.severity?.toLowerCase() === 'major') color = "bg-orange-500 z-20"
          else if (defect.severity?.toLowerCase() === 'moderate') color = "bg-yellow-500 z-10"

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
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-red-600"></span> Critical
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span> Major
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Minor
        </div>
      </div>
    </div>
  )
}

const ReportDetailView = () => {
  const router = useRouter()
  // Use useParams to access the dynamic route segment
  const params = useParams()
  const { report_id } = params || {}

  const [report, setReport] = useState(null)
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Fetch Report Data
  useEffect(() => {
    const fetchData = async () => {
      if (!report_id) return

      try {
        setLoading(true)
        // 1. Fetch Report Metadata
        const reportData = await reportsApi.getReportById(report_id)

        let fetchedDefects = []
        // 2. Fetch Detections if project ID exists
        // Note: reportData might wrap the report in 'data' prop depending on API return in previous step
        // reports.controller returns { success: true, data: report }
        const actualReport = reportData

        if (actualReport.projectId) {
          const projectId = typeof actualReport.projectId === 'object' ? actualReport.projectId._id : actualReport.projectId
          if (projectId) {
            try {
              const detections = await qcApi.getProjectDetections(projectId)
              fetchedDefects = detections || []
            } catch (dErr) {
              console.warn("Could not fetch detections:", dErr)
            }
          }
        }

        setReport(actualReport) // The API returns the report object directly inside data property
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

  // Initialize/Update Charts
  useEffect(() => {
    if (loading || !report || !chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare chart data
    const severityCounts = {
      Critical: defects.filter(d => d.severity?.toLowerCase() === 'critical').length || report.criticalDefects || 0,
      Major: defects.filter(d => d.severity?.toLowerCase() === 'major').length || 0,
      Moderate: defects.filter(d => d.severity?.toLowerCase() === 'moderate').length || 0,
      Minor: defects.filter(d => d.severity?.toLowerCase() === 'minor').length || 0
    }

    // Fallback if no defects array but report has stats
    if (defects.length === 0 && report.totalDefects) {
      // use report stats if available
    }

    const ctx = chartRef.current.getContext('2d')
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'Major', 'Moderate', 'Minor'],
        datasets: [{
          data: [
            severityCounts.Critical,
            severityCounts.Major,
            severityCounts.Moderate,
            severityCounts.Minor
          ],
          backgroundColor: [
            '#ef4444', // Red
            '#f97316', // Orange
            '#eab308', // Yellow
            '#22c55e'  // Green
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, boxWidth: 6 }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [report, defects, loading])

  const handleDownload = () => {
    if (report_id) {
      // Logic to trigger PDF download
      reportsApi.downloadReport(report_id)
        .then(() => alert('Download started...'))
        .catch(err => alert('Failed to download: ' + err.message))
    }
  }

  const handlePrint = () => window.print()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
          <p className="text-gray-500 font-medium">Loading detailed report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
        <p className="text-gray-600 mb-6">{error || 'Report not found'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  // Safe accessors
  const projectName = report.projectId?.name || report.projectId?.title || "Unknown Project" // populated
  const operatorName = report.operator?.first_name ? `${report.operator.first_name} ${report.operator.last_name}` : "N/A"
  const qcTechName = report.qcTechnician?.first_name ? `${report.qcTechnician.first_name} ${report.qcTechnician.last_name}` : "N/A"
  const location = report.projectId?.location || report.location || "N/A"

  // Calculate defects if not strictly in report object
  const totalDefectsCount = defects.length > 0 ? defects.length : (report.totalDefects || 0)
  const criticalCount = defects.length > 0 ? defects.filter(d => d.severity?.toLowerCase() === 'critical').length : (report.criticalDefects || 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm print:hidden">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{projectName}</h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">{report.reportType || 'Condition Assessment'}</span>
                  <span className="text-gray-400">•</span>
                  <span>ID: {report._id?.substring(0, 8) || report.id}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload} className="bg-gradient-to-r from-rose-500 to-pink-600 border-none">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
              {report.status?.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <User className="h-4 w-4" />
              <span>Tech: {qcTechName}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Ruler className="h-4 w-4" />
              <span>{report.footage || '0'} ft</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 print:p-0">

        {/* Executive Summary & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Stats Card */}
          <Card className="md:col-span-2 shadow-sm border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
                  <span className="text-xs font-medium text-red-800 uppercase tracking-wide">Critical</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {defects.length ? defects.filter(d => d.severity?.toLowerCase() === 'major').length : 0}
                  </span>
                  <span className="text-xs font-medium text-orange-800 uppercase tracking-wide">Major</span>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-yellow-600">
                    {defects.length ? defects.filter(d => d.severity?.toLowerCase() === 'moderate').length : 0}
                  </span>
                  <span className="text-xs font-medium text-yellow-800 uppercase tracking-wide">Moderate</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-gray-700">{totalDefectsCount}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
              </div>

              {/* Pipe Graph Visualization */}
              <LinearPipeGraph length={report.footage || '0 ft'} defects={defects} />
            </CardContent>
          </Card>

          {/* Project Details & Chart */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Defect Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <canvas ref={chartRef}></canvas>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-right text-gray-900">{location}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Operator</span>
                  <span className="font-medium text-right text-gray-900">{operatorName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Pipe Material</span>
                  <span className="font-medium text-right text-gray-900">{report.pipeType || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Diameter</span>
                  <span className="font-medium text-right text-gray-900">{report.pipeDiameter || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Findings List */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Detailed Findings
                </CardTitle>
                <CardDescription>Comprehensive list of observed conditions and defects</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="h-4 w-4 mr-2" />
                Filter View
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {defects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No defects recorded for this report.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {defects.map((defect, index) => (
                  <div key={defect._id || index} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start">
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                      {/* Placeholder for image - assume defect might have 'image' or 'frame' url logic */}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={defect.severity} />
                            <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                            <span className="text-xs font-mono text-gray-500">{defect.timestamp || defect.frameTime}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">{defect.description || defect.type || 'Unknown Defect'}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{defect.location}</p>
                          <p className="text-xs text-gray-500">Distance</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {defect.notes || defect.recommendation || "No additional notes provided."}
                      </p>

                      {/* Metadata Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {defect.clockPosition && (
                          <Badge variant="outline" className="text-[10px] font-normal text-gray-500">
                            <Clock className="w-3 h-3 mr-1" /> {defect.clockPosition}
                          </Badge>
                        )}
                        {defect.confidence && (
                          <Badge variant="outline" className="text-[10px] font-normal text-gray-500">
                            <Target className="w-3 h-3 mr-1" /> {Math.round(defect.confidence)}% AI Conf.
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations / Next Steps (Derived from defects or Report 'issues') */}
        <Card className="border-gray-200 shadow-sm break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defects.some(d => d.severity?.toLowerCase() === 'critical') ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 flex gap-4">
                <div className="shrink-0 p-2 bg-red-100 rounded-full h-fit">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-900">Immediate Action Required</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Critical defects detected. It is recommended to schedule immediate repairs for the {defects.filter(d => d.severity === 'Critical').length} critical issues identified above to prevent structural failure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> No critical defects found. Routine maintenance recommended.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Suggested Action Plan:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Generate work orders for all Major and Critical defects.</li>
                <li>Re-inspect in 12 months for Moderate defects progression.</li>
                <li>Archive report and video footage for historical compliance.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default ReportDetailView