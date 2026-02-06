'use client'
import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  User,
  Target,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import reportsApi from '@/data/reportsApi'

const DetailedReportPage = () => {
  const router = useRouter()
  const { userId, userData } = useUser()
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (userId) {
      fetchDetailedReport()
    }
  }, [userId, dateRange])

  const fetchDetailedReport = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await reportsApi.getDetailed2DayReport(
        userId,
        dateRange.start,
        dateRange.end
      )
      setReportData(data)
    } catch (error) {
      console.error('Error fetching detailed report:', error)
      showAlert(error.message || 'Failed to load detailed report', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!reportData) return

    const reportText = generateTextReport(reportData)

    const blob = new Blob([reportText], { type: 'text/plain' })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = url
    a.download = `Detailed_Report_${dateRange.start}_to_${dateRange.end}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showAlert('Report downloaded successfully', 'success')
  }

  const generateTextReport = (data) => {
    let report = ''
    report += '='.repeat(80) + '\n'
    report += 'DETAILED 2-DAY QC ACTIVITY REPORT\n'
    report += '='.repeat(80) + '\n\n'

    if (data.reportInfo) {
      report += `Report Type: ${data.reportInfo.reportType}\n`
      report += `Generated At: ${new Date(data.reportInfo.generatedAt).toLocaleString()}\n`
      report += `Date Range: ${data.reportInfo.dateRange.start.split('T')[0]} to ${data.reportInfo.dateRange.end.split('T')[0]}\n`
      report += `Days Covered: ${data.reportInfo.dateRange.days}\n`
      if (data.reportInfo.qcTechnician) {
        report += `QC Technician: ${data.reportInfo.qcTechnician.name}\n`
        report += `Email: ${data.reportInfo.qcTechnician.email}\n`
        if (data.reportInfo.qcTechnician.certification) {
          report += `Certification: ${data.reportInfo.qcTechnician.certification}\n`
        }
      }
      report += '\n' + '='.repeat(80) + '\n\n'
    }

    if (data.summary) {
      report += 'EXECUTIVE SUMMARY\n'
      report += '-'.repeat(80) + '\n\n'

      report += 'PROJECTS:\n'
      report += `  Total Projects: ${data.summary.projects.total}\n`
      report += `  Completed: ${data.summary.projects.completed}\n`
      report += `  In Review: ${data.summary.projects.inReview}\n`
      report += `  Pending: ${data.summary.projects.pending}\n`
      report += `  Completion Rate: ${data.summary.projects.completionRate}%\n\n`

      report += 'DETECTIONS:\n'
      report += `  Total Detections: ${data.summary.detections.total}\n`
      report += `  Pending Review: ${data.summary.detections.pending}\n`
      report += `  Approved: ${data.summary.detections.approved}\n`
      report += `  Rejected: ${data.summary.detections.rejected}\n`
      report += `  Needs Review: ${data.summary.detections.needsReview}\n`
      report += `  Approval Rate: ${data.summary.detections.approvalRate}%\n\n`

      report += 'REVIEWS:\n'
      report += `  Total Reviews: ${data.summary.reviews.total}\n`
      report += `  Approved: ${data.summary.reviews.approved}\n`
      report += `  Rejected: ${data.summary.reviews.rejected}\n`
      report += `  Modified: ${data.summary.reviews.modified}\n`
      report += `  Average Per Day: ${data.summary.reviews.averagePerDay}\n\n`

      report += 'REPORTS:\n'
      report += `  Total Reports: ${data.summary.reports.total}\n`
      report += `  Completed: ${data.summary.reports.completed}\n`
      report += `  Draft: ${data.summary.reports.draft}\n\n`

      report += 'FOOTAGE:\n'
      report += `  Total Footage: ${data.summary.footage.total}\n`
      report += `  Average Per Project: ${data.summary.footage.averagePerProject}\n\n`

      report += 'QUALITY METRICS:\n'
      report += `  Average Confidence: ${data.summary.quality.averageConfidence}%\n\n`

      if (data.summary.quality.detectionByType) {
        report += 'Detections by Type:\n'
        Object.entries(data.summary.quality.detectionByType).forEach(([type, count]) => {
          report += `  ${type}: ${count}\n`
        })
        report += '\n'
      }

      if (data.summary.quality.detectionBySeverity) {
        report += 'Detections by Severity:\n'
        Object.entries(data.summary.quality.detectionBySeverity).forEach(([severity, count]) => {
          report += `  ${severity}: ${count}\n`
        })
        report += '\n'
      }

      report += '\n' + '='.repeat(80) + '\n\n'
    }

    if (data.dailyBreakdown && data.dailyBreakdown.length > 0) {
      report += 'DAILY BREAKDOWN\n'
      report += '-'.repeat(80) + '\n\n'
      data.dailyBreakdown.forEach(day => {
        report += `${day.date}:\n`
        report += `  Projects: ${day.projects}\n`
        report += `  Detections: ${day.detections}\n`
        report += `  Reviews: ${day.reviews} (Approved: ${day.approved}, Rejected: ${day.rejected})\n\n`
      })
      report += '='.repeat(80) + '\n\n'
    }

    if (data.projects && data.projects.length > 0) {
      report += 'PROJECTS DETAIL\n'
      report += '-'.repeat(80) + '\n\n'
      data.projects.forEach((project, index) => {
        report += `${index + 1}. ${project.name}\n`
        report += `   Location: ${project.location}\n`
        report += `   Client: ${project.client || 'N/A'}\n`
        report += `   Status: ${project.status}\n`
        report += `   QC Status: ${project.qcStatus}\n`
        report += `   Priority: ${project.priority}\n`
        report += `   Total Length: ${project.totalLength}\n`
        report += `   Detections: ${project.detections.total} (Pending: ${project.detections.pending}, Approved: ${project.detections.approved}, Rejected: ${project.detections.rejected}, Critical: ${project.detections.critical})\n`
        if (project.assignedOperator) {
          report += `   Operator: ${project.assignedOperator.name} (${project.assignedOperator.email})\n`
        }
        report += '\n'
      })
      report += '='.repeat(80) + '\n\n'
    }

    if (data.topDetections && data.topDetections.length > 0) {
      report += 'TOP DETECTIONS (by confidence)\n'
      report += '-'.repeat(80) + '\n\n'
      data.topDetections.slice(0, 20).forEach((detection, index) => {
        report += `${index + 1}. ${detection.type} (${detection.severity})\n`
        report += `   Confidence: ${detection.confidence}%\n`
        report += `   Status: ${detection.qcStatus}\n`
        report += `   Project: ${detection.projectName}\n`
        report += `   Location: ${detection.location}\n`
        if (detection.reviewedBy) {
          report += `   Reviewed By: ${detection.reviewedBy}\n`
        }
        report += '\n'
      })
      report += '='.repeat(80) + '\n\n'
    }

    report += '\nEnd of Report\n'
    report += '='.repeat(80) + '\n'

    return report
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
            <p className="text-sm text-gray-500">Generating detailed report...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No report data available</h3>
            <p className="text-sm text-gray-500 mb-4">Unable to load the detailed report</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="p-2 bg-rose-100 rounded-lg">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detailed 2-Day Report</h1>
              <p className="text-sm text-gray-500">
                {dateRange.start} to {dateRange.end}
              </p>
            </div>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Report Info Card */}
        {reportData.reportInfo && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Report Type</p>
                  <p className="font-medium text-gray-900 text-sm">{reportData.reportInfo.reportType || 'Quality Report'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Generated</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {reportData.reportInfo.generatedAt
                      ? new Date(reportData.reportInfo.generatedAt).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">QC Technician</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {reportData.reportInfo.qcTechnician?.name || userData?.first_name + ' ' + userData?.last_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Coverage</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {reportData.reportInfo.dateRange?.days || 2} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Statistics - Compact like dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{reportData.summary?.projects?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Projects</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-green-600">{reportData.summary?.projects?.completed || 0} done</span>
                <span className="text-gray-400">•</span>
                <span className="text-orange-600">{reportData.summary?.projects?.inReview || 0} review</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{reportData.summary?.detections?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Detections</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-green-600">{reportData.summary?.detections?.approved || 0} approved</span>
                <span className="text-gray-400">•</span>
                <span className="text-red-600">{reportData.summary?.detections?.rejected || 0} rejected</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{reportData.summary?.reviews?.total || 0}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-green-600">{reportData.summary?.reviews?.approved || 0} approved</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{reportData.summary?.reviews?.averagePerDay || 0}/day</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{reportData.summary?.quality?.averageConfidence || 0}%</p>
              <p className="text-sm text-gray-500">Avg Confidence</p>
              <div className="mt-2 text-xs text-gray-600">
                {reportData.summary?.footage?.total || '0 ft'} inspected
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        {reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Breakdown</CardTitle>
              <CardDescription>Activity breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.dailyBreakdown.map((day, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-rose-500" />
                      <span className="font-semibold text-gray-900">{day.date}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Projects</p>
                        <p className="text-lg font-bold text-gray-900">{day.projects || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Detections</p>
                        <p className="text-lg font-bold text-gray-900">{day.detections || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reviews</p>
                        <p className="text-lg font-bold text-gray-900">{day.reviews || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="text-lg font-bold text-green-600">{day.approved || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Detail */}
        {reportData.projects && reportData.projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects Detail</CardTitle>
              <CardDescription>All projects in the report period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.projects.map((project, index) => (
                  <div key={project.id || index} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {project.location}
                            </span>
                            {project.client && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {project.client}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {project.status}
                        </Badge>
                        {project.priority && (
                          <Badge variant="outline" className="text-xs">{project.priority}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Length</p>
                        <p className="font-medium text-sm text-gray-900">{project.totalLength || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Detections</p>
                        <p className="font-medium text-sm text-gray-900">{project.detections?.total || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="font-medium text-sm text-green-600">{project.detections?.approved || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Critical</p>
                        <p className="font-medium text-sm text-red-600">{project.detections?.critical || 0}</p>
                      </div>
                    </div>
                    {project.assignedOperator && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Operator</p>
                        <p className="font-medium text-sm text-gray-900">{project.assignedOperator.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detection Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reportData.summary?.quality?.detectionByType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detections by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {Object.entries(reportData.summary.quality.detectionByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{type}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.summary?.quality?.detectionBySeverity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detections by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {Object.entries(reportData.summary.quality.detectionBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700 capitalize">{severity}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Detections */}
        {reportData.topDetections && reportData.topDetections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Detections</CardTitle>
              <CardDescription>Highest confidence detections in the period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {reportData.topDetections.slice(0, 20).map((detection, index) => (
                  <div key={detection.id || index} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900">{detection.type}</span>
                          <Badge variant={detection.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                            {detection.severity}
                          </Badge>
                          <Badge variant={detection.qcStatus === 'approved' ? 'default' : 'outline'} className="text-xs">
                            {detection.qcStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div>Project: <span className="text-gray-700">{detection.projectName}</span></div>
                          <div>Location: <span className="text-gray-700">{detection.location}</span></div>
                          {detection.reviewedBy && (
                            <div>Reviewed by: <span className="text-gray-700">{detection.reviewedBy}</span></div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{detection.confidence}%</p>
                        <p className="text-xs text-gray-500">Confidence</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DetailedReportPage

