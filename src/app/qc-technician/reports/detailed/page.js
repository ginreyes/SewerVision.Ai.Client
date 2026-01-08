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
    
    // Create a formatted text report
    const reportText = generateTextReport(reportData)
    
    // Create blob and download
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Generating detailed report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No report data available</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detailed 2-Day Report</h1>
              <p className="text-sm text-gray-600">
                {reportData.reportInfo?.dateRange?.start?.split('T')[0]} to {reportData.reportInfo?.dateRange?.end?.split('T')[0]}
              </p>
            </div>
          </div>
          <Button 
            className="bg-gradient-to-r from-[#D76A84] to-rose-500"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Report Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Report Type</p>
                <p className="font-semibold">{reportData.reportInfo?.reportType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Generated At</p>
                <p className="font-semibold">
                  {reportData.reportInfo?.generatedAt 
                    ? new Date(reportData.reportInfo.generatedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">QC Technician</p>
                <p className="font-semibold">
                  {reportData.reportInfo?.qcTechnician?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Covered</p>
                <p className="font-semibold">
                  {reportData.reportInfo?.dateRange?.days || 0} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl mb-1">
                {reportData.summary?.projects?.total || 0}
              </CardTitle>
              <CardDescription>Total Projects</CardDescription>
              <div className="mt-2 text-sm">
                <span className="text-green-600">
                  {reportData.summary?.projects?.completed || 0} completed
                </span>
                {' • '}
                <span className="text-yellow-600">
                  {reportData.summary?.projects?.inReview || 0} in review
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl mb-1">
                {reportData.summary?.detections?.total || 0}
              </CardTitle>
              <CardDescription>Total Detections</CardDescription>
              <div className="mt-2 text-sm">
                <span className="text-green-600">
                  {reportData.summary?.detections?.approved || 0} approved
                </span>
                {' • '}
                <span className="text-red-600">
                  {reportData.summary?.detections?.rejected || 0} rejected
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl mb-1">
                {reportData.summary?.reviews?.total || 0}
              </CardTitle>
              <CardDescription>Total Reviews</CardDescription>
              <div className="mt-2 text-sm">
                <span className="text-green-600">
                  {reportData.summary?.reviews?.approved || 0} approved
                </span>
                {' • '}
                <span className="text-gray-600">
                  {reportData.summary?.reviews?.averagePerDay || 0}/day avg
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl mb-1">
                {reportData.summary?.quality?.averageConfidence || 0}%
              </CardTitle>
              <CardDescription>Average Confidence</CardDescription>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">
                  {reportData.summary?.footage?.total || '0 ft'} inspected
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown */}
        {reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Breakdown</CardTitle>
              <CardDescription>Activity breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.dailyBreakdown.map((day, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{day.date}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Projects</p>
                        <p className="text-lg font-bold">{day.projects}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Detections</p>
                        <p className="text-lg font-bold">{day.detections}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reviews</p>
                        <p className="text-lg font-bold">{day.reviews}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-lg font-bold text-green-600">{day.approved}</p>
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
              <CardTitle>Projects Detail</CardTitle>
              <CardDescription>All projects in the report period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.projects.map((project, index) => (
                  <div key={project.id || index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{project.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {project.client || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline">{project.priority}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Length</p>
                        <p className="font-semibold">{project.totalLength || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Detections</p>
                        <p className="font-semibold">{project.detections?.total || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="font-semibold text-green-600">{project.detections?.approved || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Critical</p>
                        <p className="font-semibold text-red-600">{project.detections?.critical || 0}</p>
                      </div>
                    </div>
                    {project.assignedOperator && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">Operator</p>
                        <p className="font-medium">{project.assignedOperator.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detection Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportData.summary?.quality?.detectionByType && (
            <Card>
              <CardHeader>
                <CardTitle>Detections by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.summary.quality.detectionByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.summary?.quality?.detectionBySeverity && (
            <Card>
              <CardHeader>
                <CardTitle>Detections by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.summary.quality.detectionBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{severity}</span>
                      <span className="font-semibold">{count}</span>
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
              <CardTitle>Top Detections (by Confidence)</CardTitle>
              <CardDescription>Top 20 detections with highest confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.topDetections.slice(0, 20).map((detection, index) => (
                  <div key={detection.id || index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold">{detection.type}</span>
                          <Badge variant={detection.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {detection.severity}
                          </Badge>
                          <Badge variant={detection.qcStatus === 'approved' ? 'default' : 'outline'}>
                            {detection.qcStatus}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Project: {detection.projectName}</span>
                          {' • '}
                          <span>Location: {detection.location}</span>
                          {detection.reviewedBy && (
                            <>
                              {' • '}
                              <span>Reviewed by: {detection.reviewedBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{detection.confidence}%</p>
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

