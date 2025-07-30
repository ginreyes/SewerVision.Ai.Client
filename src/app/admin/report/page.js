'use client'
import React, { useState } from 'react'
import { 
  FileText, 
  Download, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  Camera, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Mail,
  Printer,
  Archive,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock reports data
  const [reports] = useState([
    {
      id: 1,
      title: 'Main Street Pipeline Assessment',
      type: 'PACP',
      status: 'completed',
      createdAt: '2024-07-18T10:30:00Z',
      completedAt: '2024-07-18T14:22:00Z',
      location: 'Main Street, Section A-7',
      inspector: 'John Smith',
      qcTechnician: 'Sarah Johnson',
      pipelineLength: '245.8m',
      defectsFound: 12,
      criticalIssues: 3,
      confidence: 94,
      deviceUsed: 'CCTV Unit 1',
      fileSize: '15.2 MB',
      pages: 28
    },
    {
      id: 2,
      title: 'Oak Avenue Inspection Report',
      type: 'PACP',
      status: 'pending',
      createdAt: '2024-07-18T11:15:00Z',
      completedAt: null,
      location: 'Oak Avenue, Section B-3',
      inspector: 'Mike Davis',
      qcTechnician: null,
      pipelineLength: '189.4m',
      defectsFound: 8,
      criticalIssues: 1,
      confidence: 89,
      deviceUsed: 'CCTV Unit 2',
      fileSize: '12.8 MB',
      pages: 22
    },
    {
      id: 3,
      title: 'Downtown District Analysis',
      type: 'Condition Assessment',
      status: 'in_progress',
      createdAt: '2024-07-18T09:00:00Z',
      completedAt: null,
      location: 'Downtown District',
      inspector: 'Lisa Chen',
      qcTechnician: null,
      pipelineLength: '567.2m',
      defectsFound: 0,
      criticalIssues: 0,
      confidence: 0,
      deviceUsed: 'Multiple Units',
      fileSize: '0 MB',
      pages: 0
    },
    {
      id: 4,
      title: 'Quarterly Performance Summary',
      type: 'Analytics',
      status: 'completed',
      createdAt: '2024-07-15T16:00:00Z',
      completedAt: '2024-07-15T17:30:00Z',
      location: 'All Locations',
      inspector: 'System Generated',
      qcTechnician: 'Sarah Johnson',
      pipelineLength: '2.1km',
      defectsFound: 45,
      criticalIssues: 8,
      confidence: 92,
      deviceUsed: 'All Devices',
      fileSize: '8.9 MB',
      pages: 15
    }
  ])

  // Mock analytics data
  const [analytics] = useState({
    totalReports: 156,
    completedReports: 142,
    pendingReports: 8,
    inProgressReports: 6,
    totalInspectionLength: '12.8km',
    averageConfidence: 91.2,
    criticalIssues: 24,
    totalDefects: 287,
    averageProcessingTime: '3.2 hours',
    aiAccuracy: 94.7,
    monthlyGrowth: 12.5,
    reportTypes: {
      pacp: 89,
      condition: 42,
      analytics: 25
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'PACP':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Condition Assessment':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Analytics':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.inspector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <div className="flex items-center mt-1">
                <p className="text-xs text-gray-500">{subtitle}</p>
                {trend && (
                  <div className={`flex items-center ml-2 ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span className="text-xs ml-1">{Math.abs(trend)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ReportCard = ({ report }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{report.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className={getTypeColor(report.type)}>
                {report.type}
              </Badge>
              <Badge variant="outline" className={getStatusColor(report.status)}>
                {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {report.location}
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                Inspector: {report.inspector}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {report.status === 'completed' && (
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{report.defectsFound}</div>
              <div className="text-xs text-gray-600">Defects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{report.criticalIssues}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{report.confidence}%</div>
              <div className="text-xs text-gray-600">AI Confidence</div>
            </div>
          </div>
        )}

        {report.status === 'in_progress' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Processing Progress</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {report.pages > 0 ? `${report.pages} pages` : 'Processing'} • {report.fileSize}
          </div>
          <div className="flex space-x-2">
            {report.status === 'completed' && (
              <>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            {report.status === 'pending' && (
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
            )}
            {report.status === 'in_progress' && (
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Monitor
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {analytics.totalReports} Total Reports
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Reports" 
                value={analytics.totalReports}
                subtitle="This month"
                icon={FileText}
                color="bg-gradient-to-br from-blue-500 to-purple-600"
                trend={analytics.monthlyGrowth}
              />
              <StatCard 
                title="Completed Reports" 
                value={analytics.completedReports}
                subtitle={`${analytics.pendingReports} pending`}
                icon={CheckCircle}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard 
                title="AI Accuracy" 
                value={`${analytics.aiAccuracy}%`}
                subtitle="Average confidence"
                icon={Brain}
                color="bg-gradient-to-br from-purple-500 to-pink-600"
              />
              <StatCard 
                title="Critical Issues" 
                value={analytics.criticalIssues}
                subtitle="Requiring attention"
                icon={AlertTriangle}
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate reports and access templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <FileText className="w-6 h-6" />
                    <span>PACP Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>Analytics Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Target className="w-6 h-6" />
                    <span>Condition Assessment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Latest generated inspection reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-500">{report.location} • {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(report.status)}>
                          {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Report Types Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">PACP Reports</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes.pacp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Condition Assessments</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Analytics Reports</span>
                      </div>
                      <span className="font-medium">{analytics.reportTypes.analytics}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Processing Time</span>
                        <span>{analytics.averageProcessingTime}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>AI Accuracy Rate</span>
                        <span>{analytics.aiAccuracy}%</span>
                      </div>
                      <Progress value={analytics.aiAccuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Report Completion Rate</span>
                        <span>91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inspection Summary</CardTitle>
                <CardDescription>Overall inspection statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.totalInspectionLength}</div>
                    <div className="text-sm text-gray-600">Total Length Inspected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{analytics.totalDefects}</div>
                    <div className="text-sm text-gray-600">Total Defects Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{analytics.criticalIssues}</div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics.averageConfidence.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Average Confidence</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-configured templates for different report types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-dashed border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Create New Template</h3>
                      <p className="text-sm text-gray-600">Design a custom report template</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <FileText className="w-12 h-12 text-purple-600 mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Standard PACP Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Comprehensive pipeline assessment following PACP standards</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Most Used</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">Executive Summary</h3>
                      <p className="text-sm text-gray-600 mb-4">High-level overview for management and stakeholders</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Template</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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