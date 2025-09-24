'use client'
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  BarChart3,
  PieChart,
  Target,
  Activity,
  Upload,
  Share2,
  Edit3,
  Copy,
  Archive,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Award,
  TrendingUp
} from 'lucide-react';

const QualityReportPage = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedReport, setExpandedReport] = useState(null);
  const [reportType, setReportType] = useState('pacp');

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
  ];

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
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending_review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'Grade 1': return 'bg-green-100 text-green-700';
      case 'Grade 2': return 'bg-yellow-100 text-yellow-700';
      case 'Grade 3': return 'bg-orange-100 text-orange-700';
      case 'Grade 4': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ReportCard = ({ report }) => (
    <div className={`bg-white border rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer ${
      selectedReport?.id === report.id ? 'border-[#2D99FF] shadow-lg' : 'border-gray-200'
    }`}
    onClick={() => setSelectedReport(report)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{report.projectName}</h3>
          <p className="text-sm text-gray-600">{report.reportType}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusColor(report.status)}`}>
            {report.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getGradeColor(report.overallGrade)}`}>
            {report.overallGrade}
          </span>
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

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>Created: {report.createdDate}</span>
          <span>Downloads: {report.downloadCount}</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D99FF] to-[#826AF9] rounded-2xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Reports</h1>
              <p className="text-sm text-gray-600">Generate and manage PACP inspection reports</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-[#2D99FF] to-[#826AF9] text-white rounded-xl hover:shadow-lg transition-all font-semibold">
              <Plus className="h-4 w-4 mr-2 inline" />
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex">
            <button
              className={`px-6 py-4 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'reports' 
                  ? 'border-[#2D99FF] text-[#2D99FF]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Reports
              </div>
            </button>
            <button
              className={`px-6 py-4 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'templates' 
                  ? 'border-[#2D99FF] text-[#2D99FF]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Templates
              </div>
            </button>
            <button
              className={`px-6 py-4 border-b-2 font-semibold text-sm transition-all ${
                activeTab === 'analytics' 
                  ? 'border-[#2D99FF] text-[#2D99FF]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search reports..." 
                      className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:border-[#2D99FF] outline-none"
                    />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:border-[#2D99FF] outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:border-[#2D99FF] outline-none">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 90 days</option>
                    <option>Custom range</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <Filter className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-lg">+2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
                <p className="text-gray-600 text-sm">Completed Reports</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-sm font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
                <p className="text-gray-600 text-sm">Draft Reports</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">94%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">92%</h3>
                <p className="text-gray-600 text-sm">Avg Accuracy</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">+5</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">47</h3>
                <p className="text-gray-600 text-sm">Total Downloads</p>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports
                .filter(report => filterStatus === 'all' || report.status === filterStatus)
                .map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Template Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Report Templates</h2>
                  <p className="text-gray-600">Pre-configured templates for consistent reporting</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-[#2D99FF] to-[#826AF9] text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Create Template
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2D99FF] to-[#826AF9] rounded-2xl flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-white" />
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Included Sections:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map((field, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Last used: {template.lastUsed}</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#2D99FF] text-white rounded-lg text-xs hover:bg-[#826AF9] transition-colors">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Report Analytics</h2>
                  <p className="text-gray-600">Insights into your reporting performance and trends</p>
                </div>
                <div className="flex gap-2">
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:border-[#2D99FF] outline-none">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 6 months</option>
                    <option>Last year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Generation Trends */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Report Generation Trends</h3>
                <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Monthly report generation chart</p>
                  </div>
                </div>
              </div>

              {/* Defect Categories */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Defect Categories Distribution</h3>
                <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Defect type breakdown chart</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quality Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-green-600 mb-1">94.2%</h4>
                  <p className="text-sm text-gray-600">Average Report Accuracy</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-blue-600 mb-1">2.3h</h4>
                  <p className="text-sm text-gray-600">Avg Time to Complete</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-purple-600 mb-1">98.1%</h4>
                  <p className="text-sm text-gray-600">Client Approval Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Modal (if report is selected) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedReport.projectName}</h2>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Preview</h3>
                <p className="text-gray-600 mb-4">
                  {selectedReport.reportType} for {selectedReport.projectName}
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="px-4 py-2 bg-gradient-to-r from-[#2D99FF] to-[#826AF9] text-white rounded-xl hover:shadow-lg transition-all">
                    <Eye className="h-4 w-4 mr-2 inline" />
                    View Full Report
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all">
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityReportPage;