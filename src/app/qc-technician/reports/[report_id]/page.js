'use client'
import React, { useState } from 'react'
import { 
  ArrowLeft,
  Download,
  Share2,
  Edit3,
  Printer,
  FileText,
  Calendar,
  User,
  MapPin,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  ChevronDown,
  ChevronRight,
  Info,
  TrendingUp,
  Target,
  Activity,
  ZoomIn,
  Filter,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

const ReportDetailView = () => {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState('overview')
  const [selectedDefect, setSelectedDefect] = useState(null)

  // Mock report data
  const report = {
    id: 1,
    projectName: "Main St Pipeline - Section A",
    reportType: "PACP Condition Assessment",
    operator: "John Smith",
    qcTechnician: "Maria Rodriguez",
    createdDate: "2025-09-18",
    completedDate: "2025-09-18",
    status: "completed",
    totalDefects: 23,
    criticalDefects: 1,
    majorDefects: 5,
    minorDefects: 17,
    pipeLength: "1,250 ft",
    overallGrade: "Grade 3",
    confidence: 94,
    location: "Main Street, Downtown",
    startManhole: "MH-001",
    endManhole: "MH-015",
    pipeType: "Concrete",
    pipeDiameter: "18 inches",
    inspectionMethod: "CCTV Camera",
    weather: "Clear, Dry"
  }

  // Mock defects data
  const defects = [
    {
      id: 1,
      code: "CL-301",
      description: "Crack - Longitudinal",
      severity: "Critical",
      location: "125 ft",
      position: "6 o'clock",
      length: "2.5 ft",
      width: "0.5 in",
      recommendation: "Immediate repair required",
      timestamp: "10:23 AM",
      images: 3
    },
    {
      id: 2,
      code: "DJ-201",
      description: "Joint - Separated",
      severity: "Major",
      location: "340 ft",
      position: "12 o'clock",
      length: "0.3 in",
      recommendation: "Schedule repair within 6 months",
      timestamp: "10:45 AM",
      images: 2
    },
    {
      id: 3,
      code: "DE-401",
      description: "Deposits",
      severity: "Minor",
      location: "580 ft",
      position: "6 o'clock",
      coverage: "25%",
      recommendation: "Routine cleaning required",
      timestamp: "11:12 AM",
      images: 1
    },
    {
      id: 4,
      code: "RO-501",
      description: "Roots",
      severity: "Major",
      location: "820 ft",
      position: "3-9 o'clock",
      coverage: "40%",
      recommendation: "Root removal and seal repair",
      timestamp: "11:38 AM",
      images: 4
    },
    {
      id: 5,
      code: "CL-302",
      description: "Crack - Circumferential",
      severity: "Major",
      location: "1,050 ft",
      position: "Full circumference",
      length: "4.7 ft",
      recommendation: "Schedule repair within 6 months",
      timestamp: "12:15 PM",
      images: 2
    }
  ]

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'destructive'
      case 'Major': return 'default'
      case 'Minor': return 'secondary'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'Critical': return <AlertTriangle className="w-4 h-4" />
      case 'Major': return <Info className="w-4 h-4" />
      case 'Minor': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  const handleDownload = () => {
    alert('Downloading report as PDF...')
  }

  const handleShare = () => {
    alert('Opening share dialog...')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{report.projectName}</h1>
                <p className="text-sm text-gray-600">{report.reportType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Report Status Bar */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="default">{report.status}</Badge>
              <Badge className="bg-orange-100 text-orange-700">{report.overallGrade}</Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Completed: {report.completedDate}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>QC Tech: {report.qcTechnician}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="h-4 w-4" />
              <span>Confidence: {report.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-2xl font-bold text-red-600 mb-1">{report.criticalDefects}</h4>
                <p className="text-sm text-gray-600">Critical Defects</p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Info className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="text-2xl font-bold text-orange-600 mb-1">{report.majorDefects}</h4>
                <p className="text-sm text-gray-600">Major Defects</p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="text-2xl font-bold text-yellow-600 mb-1">{report.minorDefects}</h4>
                <p className="text-sm text-gray-600">Minor Defects</p>
              </div>

              <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-200">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-rose-600" />
                </div>
                <h4 className="text-2xl font-bold text-rose-600 mb-1">{report.totalDefects}</h4>
                <p className="text-sm text-gray-600">Total Defects</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Key Findings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Key Findings</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                  <span>One critical longitudinal crack at 125 ft requires immediate repair to prevent pipe failure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></span>
                  <span>Major root intrusion at 820 ft causing 40% blockage - recommend root removal and sealing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></span>
                  <span>Multiple joint separations detected - schedule repair within 6 months.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></span>
                  <span>Moderate sediment deposits throughout - routine cleaning recommended.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="mt-1 text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {report.location}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Operator</label>
                <p className="mt-1 text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {report.operator}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Inspection Date</label>
                <p className="mt-1 text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {report.createdDate}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Point</label>
                <p className="mt-1 text-gray-900">{report.startManhole}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Point</label>
                <p className="mt-1 text-gray-900">{report.endManhole}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pipe Length</label>
                <p className="mt-1 text-gray-900 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  {report.pipeLength}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pipe Type</label>
                <p className="mt-1 text-gray-900">{report.pipeType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pipe Diameter</label>
                <p className="mt-1 text-gray-900">{report.pipeDiameter}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Weather Conditions</label>
                <p className="mt-1 text-gray-900">{report.weather}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defects Detail */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detailed Defect Analysis
              </CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <CardDescription>Complete list of all defects found during inspection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {defects.map((defect) => (
                <Card key={defect.id} className="border-l-4" style={{
                  borderLeftColor: defect.severity === 'Critical' ? '#ef4444' : 
                                   defect.severity === 'Major' ? '#f97316' : '#eab308'
                }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getSeverityColor(defect.severity)} className="flex items-center gap-1">
                            {getSeverityIcon(defect.severity)}
                            {defect.severity}
                          </Badge>
                          <span className="font-mono text-sm font-semibold text-gray-900">{defect.code}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{defect.description}</h4>
                        <p className="text-sm text-gray-600">{defect.recommendation}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {defect.images} Images
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Location</span>
                        <p className="font-medium text-gray-900">{defect.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Position</span>
                        <p className="font-medium text-gray-900">{defect.position}</p>
                      </div>
                      {defect.length && (
                        <div>
                          <span className="text-gray-500">Length</span>
                          <p className="font-medium text-gray-900">{defect.length}</p>
                        </div>
                      )}
                      {defect.width && (
                        <div>
                          <span className="text-gray-500">Width</span>
                          <p className="font-medium text-gray-900">{defect.width}</p>
                        </div>
                      )}
                      {defect.coverage && (
                        <div>
                          <span className="text-gray-500">Coverage</span>
                          <p className="font-medium text-gray-900">{defect.coverage}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Timestamp</span>
                        <p className="font-medium text-gray-900">{defect.timestamp}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Prioritized action items based on inspection findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Immediate Action Required</h4>
                    <p className="text-sm text-red-800">Repair critical longitudinal crack at 125 ft to prevent pipe failure. Estimated cost: $2,500 - $4,000</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="destructive">Priority: Critical</Badge>
                      <Badge variant="outline" className="bg-white">Timeline: Immediate</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-1">Root Removal and Sealing</h4>
                    <p className="text-sm text-orange-800">Address root intrusion at 820 ft causing 40% blockage. Estimated cost: $1,800 - $3,200</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="default">Priority: High</Badge>
                      <Badge variant="outline" className="bg-white">Timeline: 1-3 months</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-1">Joint Repair Program</h4>
                    <p className="text-sm text-yellow-800">Schedule repairs for separated joints at multiple locations. Estimated cost: $3,000 - $5,500</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">Priority: Medium</Badge>
                      <Badge variant="outline" className="bg-white">Timeline: 3-6 months</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-rose-600 font-bold text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-rose-900 mb-1">Routine Cleaning</h4>
                    <p className="text-sm text-rose-800">Schedule cleaning to remove sediment deposits throughout the pipe. Estimated cost: $800 - $1,200</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">Priority: Low</Badge>
                      <Badge variant="outline" className="bg-white">Timeline: 6-12 months</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Total Estimated Cost Range</h4>
              <p className="text-2xl font-bold text-gray-900">$8,100 - $14,900</p>
              <p className="text-sm text-gray-600 mt-1">Costs may vary based on accessibility and specific repair methods</p>
            </div>
          </CardContent>
        </Card>

        {/* Report Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <p>Report generated by: <span className="font-medium text-gray-900">{report.qcTechnician}</span></p>
                <p className="mt-1">Inspection performed by: <span className="font-medium text-gray-900">{report.operator}</span></p>
              </div>
              <div className="text-right">
                <p>Report Date: <span className="font-medium text-gray-900">{report.completedDate}</span></p>
                <p className="mt-1">Report ID: <span className="font-medium text-gray-900">RPT-{report.id.toString().padStart(6, '0')}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ReportDetailView