'use client'
import React, { useState } from 'react'
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
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

const QualityReportPage = () => {
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock data for reports
  const reports = [
    {
      id: 1,
      projectName: "Main St Pipeline - Section A",
      reportType: "PACP Condition Assessment",
      operator: "John Smith",
      qcTechnician: "Maria Rodriguez",
      createdDate: "2025-09-18",
      status: "completed",
      totalDefects: 23,
      criticalDefects: 1,
      pipeLength: "1,250 ft",
      overallGrade: "Grade 3",
      confidence: 94,
      downloadCount: 3,
      lastModified: "2025-09-18 14:30"
    },
    {
      id: 2,
      projectName: "Oak Ave Lateral Inspection",
      reportType: "PACP Condition Assessment",
      operator: "Sarah Johnson",
      qcTechnician: "Maria Rodriguez",
      createdDate: "2025-09-18",
      status: "draft",
      totalDefects: 8,
      criticalDefects: 0,
      pipeLength: "450 ft",
      overallGrade: "Grade 2",
      confidence: 91,
      downloadCount: 0,
      lastModified: "2025-09-18 11:15"
    },
    {
      id: 3,
      projectName: "Industrial District - Line 3",
      reportType: "PACP Condition Assessment",
      operator: "Mike Torres",
      qcTechnician: "John Smith",
      createdDate: "2025-09-17",
      status: "pending_review",
      totalDefects: 31,
      criticalDefects: 2,
      pipeLength: "2,100 ft",
      overallGrade: "Grade 4",
      confidence: 89,
      downloadCount: 1,
      lastModified: "2025-09-17 16:45"
    },
    {
      id: 4,
      projectName: "Downtown Trunk Line Inspection",
      reportType: "PACP Condition Assessment",
      operator: "Lisa Chen",
      qcTechnician: "Maria Rodriguez",
      createdDate: "2025-09-16",
      status: "completed",
      totalDefects: 45,
      criticalDefects: 3,
      pipeLength: "3,200 ft",
      overallGrade: "Grade 4",
      confidence: 96,
      downloadCount: 8,
      lastModified: "2025-09-16 13:20"
    }
  ]

  // Mock data for report templates
  const reportTemplates = [
    {
      id: 1,
      name: "Standard PACP Report",
      description: "Complete PACP condition assessment with defect analysis",
      fields: ["Project Info", "Defect Summary", "Detailed Findings", "Recommendations"],
      lastUsed: "2025-09-18"
    },
    {
      id: 2,
      name: "Executive Summary Report",
      description: "High-level overview for management and stakeholders",
      fields: ["Executive Summary", "Key Findings", "Critical Issues", "Next Steps"],
      lastUsed: "2025-09-15"
    },
    {
      id: 3,
      name: "Maintenance Priority Report",
      description: "Prioritized maintenance recommendations based on severity",
      fields: ["Priority Matrix", "Cost Estimates", "Timeline", "Risk Assessment"],
      lastUsed: "2025-09-12"
    }
  ]

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

  const handleViewReport = (report) => {
    // Navigate to full report view page
    router.push(`/qc-technician/reports/${report.id}`)
  }

  const handleDownloadReport = (report) => {
    alert(`Downloading report: ${report.projectName}`)
  }

  const handleShareReport = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const ReportCard = ({ report }) => (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{report.projectName}</h3>
            <p className="text-sm text-gray-600">{report.reportType}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={getStatusVariant(report.status)}>
              {report.status.replace('_', ' ')}
            </Badge>
            <Badge className={getGradeColor(report.overallGrade)}>
              {report.overallGrade}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">Operator:</span>
            <p className="font-medium text-gray-900">{report.operator}</p>
          </div>
          <div>
            <span className="text-gray-600">QC Tech:</span>
            <p className="font-medium text-gray-900">{report.qcTechnician}</p>
          </div>
          <div>
            <span className="text-gray-600">Length:</span>
            <p className="font-medium text-gray-900">{report.pipeLength}</p>
          </div>
          <div>
            <span className="text-gray-600">Defects:</span>
            <p className="font-medium text-gray-900">{report.totalDefects} total</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Created: {report.createdDate}</span>
            <span>Downloads: {report.downloadCount}</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
              <p className="text-sm text-gray-600">Generate and manage PACP inspection reports</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
              <FileText className="h-4 w-4 mr-2" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
              <FileCheck className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
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
                    <Select defaultValue="30days">
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
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
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
                  <CardTitle className="text-2xl mb-1">12</CardTitle>
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
                  <CardTitle className="text-2xl mb-1">3</CardTitle>
                  <CardDescription>Draft Reports</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-600">94%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">92%</CardTitle>
                  <CardDescription>Avg Accuracy</CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Download className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-600">+5</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl mb-1">47</CardTitle>
                  <CardDescription>Total Downloads</CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports
                .filter(report => filterStatus === 'all' || report.status === filterStatus)
                .map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
            </div>
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
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-white" />
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Included Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">Last used: {template.lastUsed}</span>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <Select defaultValue="30days">
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

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-blue-600 mb-1">2.3h</h4>
                    <p className="text-sm text-gray-600">Avg Time to Complete</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-purple-600 mb-1">98.1%</h4>
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
              Share "{selectedReport?.projectName}" with team members
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
              alert('Report shared successfully!')
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QualityReportPage