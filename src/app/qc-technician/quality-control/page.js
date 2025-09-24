'use client'
import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  MessageSquare,
  Image,
  Video,
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Target,
  Activity,
  User
} from 'lucide-react';

const QualityControlPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isPlaying, setIsPlaying] = useState(false);

  const assignedProjects = [
    {
      id: 1,
      projectName: "Main St Pipeline - Section A",
      operator: "John Smith",
      uploadDate: "2025-09-18",
      priority: "High",
      status: "pending",
      totalDetections: 23,
      reviewedDetections: 8,
      pipeLength: "1,250 ft",
      duration: "45:30",
      assignedAt: "09:30 AM"
    },
    {
      id: 2,
      projectName: "Oak Ave Lateral Inspection",
      operator: "Sarah Johnson",
      uploadDate: "2025-09-18",
      priority: "Medium",
      status: "in_progress",
      totalDetections: 15,
      reviewedDetections: 12,
      pipeLength: "450 ft",
      duration: "22:15",
      assignedAt: "08:45 AM"
    },
    {
      id: 3,
      projectName: "Industrial District - Line 3",
      operator: "Mike Torres",
      uploadDate: "2025-09-17",
      priority: "Low",
      status: "completed",
      totalDetections: 31,
      reviewedDetections: 31,
      pipeLength: "2,100 ft",
      duration: "68:42",
      assignedAt: "Yesterday"
    }
  ];


  const projectDetections = [
    {
      id: 1,
      type: "Fracture",
      confidence: 92,
      frameTime: "12:34",
      location: "Station 245+15",
      severity: "Major",
      clockPosition: "3:00-9:00",
      description: "Circumferential fracture detected across pipe diameter",
      aiSuggestion: "Grade 3 - Major structural defect",
      qcStatus: "pending",
      needsAttention: true
    },
    {
      id: 2,
      type: "Root Intrusion",
      confidence: 87,
      frameTime: "15:22",
      location: "Station 267+42",
      severity: "Moderate",
      clockPosition: "12:00-4:00",
      description: "Fine root mass visible in upper quadrant",
      aiSuggestion: "Grade 2 - Moderate obstruction",
      qcStatus: "approved",
      needsAttention: false
    },
    {
      id: 3,
      type: "Crack",
      confidence: 76,
      frameTime: "18:45",
      location: "Station 289+08",
      severity: "Minor",
      clockPosition: "6:00",
      description: "Longitudinal crack approximately 6 inches",
      aiSuggestion: "Grade 1 - Minor crack",
      qcStatus: "pending",
      needsAttention: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'bg-green-100 text-green-700';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="max-w-full mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D99FF] to-[#826AF9] rounded-2xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
              <p className="text-sm text-gray-600">Review AI-generated inspection results</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Maria Rodriguez</p>
              <p className="text-xs text-gray-600">PACP Certified QC Technician</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">MR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Assigned Projects */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Assigned Projects</h2>
              <button className="p-2 hover:bg-gray-100 rounded-xl">
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm focus:border-[#2D99FF] outline-none"
              >
                <option value="all">All Projects</option>
                <option value="pending">Pending Review</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* My Work Today Summary */}
            <div className="bg-gradient-to-r from-[#826AF9]/10 to-[#2D99FF]/10 rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Today's Progress</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#2D99FF]">3</div>
                  <div className="text-xs text-gray-600">Projects Assigned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>

            {/* Project List */}
            <div className="space-y-4">
              {assignedProjects
                .filter(project => filterStatus === 'all' || project.status === filterStatus)
                .map((project) => (
                <div
                  key={project.id}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    activeProject?.id === project.id 
                      ? 'border-[#2D99FF] bg-gradient-to-r from-[#826AF9]/5 to-[#2D99FF]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {project.projectName}
                    </h3>
                    <div className="flex flex-col gap-1 ml-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>Operator:</span>
                      <span className="font-medium">{project.operator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned:</span>
                      <span>{project.assignedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detections:</span>
                      <span className="font-medium">{project.reviewedDetections}/{project.totalDetections}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-[#2D99FF] to-[#826AF9] h-2 rounded-full"
                      style={{ width: `${(project.reviewedDetections / project.totalDetections) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round((project.reviewedDetections / project.totalDetections) * 100)}% Complete
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {activeProject ? (
            <>
              {/* Project Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeProject.projectName}</h2>
                    <div className="flex gap-6 text-sm text-gray-600 mt-1">
                      <span>Operator: {activeProject.operator}</span>
                      <span>Length: {activeProject.pipeLength}</span>
                      <span>Duration: {activeProject.duration}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                      <CheckCircle className="h-4 w-4 mr-2 inline" />
                      Mark Complete
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#2D99FF] to-[#826AF9] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                      <MessageSquare className="h-4 w-4 mr-2 inline" />
                      Add Notes
                    </button>
                  </div>
                </div>
              </div>

              {/* Detection Review Interface */}
              <div className="flex-1 flex">
                {/* Detection List */}
                <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">
                        AI Detections ({projectDetections.filter(d => d.needsAttention).length} need review)
                      </h3>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-xl">
                          <Search className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl">
                          <Filter className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {projectDetections.map((detection) => (
                        <div
                          key={detection.id}
                          className={`p-5 border rounded-2xl cursor-pointer transition-all ${
                            selectedDetection?.id === detection.id 
                              ? 'border-[#2D99FF] bg-gradient-to-r from-[#826AF9]/5 to-[#2D99FF]/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${detection.needsAttention ? 'ring-2 ring-yellow-200' : ''}`}
                          onClick={() => setSelectedDetection(detection)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-gray-900">{detection.type}</span>
                                {detection.needsAttention && (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor(detection.confidence)}`}>
                                  {detection.confidence}% confidence
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                                  {detection.severity}
                                </span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              detection.qcStatus === 'approved' ? 'bg-green-100 text-green-700' :
                              detection.qcStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {detection.qcStatus}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>📍 {detection.location} • ⏱️ {detection.frameTime}</div>
                            <div>🕐 Clock: {detection.clockPosition}</div>
                            <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded-lg mt-2">
                              <strong>AI Suggestion:</strong> {detection.aiSuggestion}
                            </div>
                          </div>

                          {detection.qcStatus === 'pending' && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex gap-2">
                                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold">
                                  ✓ Approve
                                </button>
                                <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-semibold">
                                  ✗ Reject
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-semibold">
                                  📝 Modify
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detection Details & Video */}
                <div className="w-1/2 bg-gray-50 flex flex-col">
                  {selectedDetection ? (
                    <>
                      {/* Video Player */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Frame Analysis</h3>
                        <div className="bg-black rounded-2xl aspect-video flex items-center justify-center mb-4">
                          <div className="text-white text-center">
                            <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-75">Detection at {selectedDetection.frameTime}</p>
                          </div>
                        </div>

                        {/* Video Controls */}
                        <div className="bg-white rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <button className="p-2 bg-[#2D99FF] text-white rounded-lg">
                              <SkipBack className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-2 bg-[#2D99FF] text-white rounded-lg"
                              onClick={() => setIsPlaying(!isPlaying)}
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                            <button className="p-2 bg-[#2D99FF] text-white rounded-lg">
                              <SkipForward className="h-4 w-4" />
                            </button>
                            <div className="flex-1 mx-3">
                              <input type="range" className="w-full" />
                            </div>
                            <span className="text-xs text-gray-600">{selectedDetection.frameTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* QC Assessment Form */}
                      <div className="flex-1 p-6 bg-white m-6 rounded-2xl">
                        <h4 className="font-bold text-gray-900 mb-4">QC Assessment</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">PACP Code</label>
                            <select className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:border-[#2D99FF] outline-none">
                              <option>Select PACP Code</option>
                              <option>FC - Circumferential Crack</option>
                              <option>FL - Longitudinal Crack</option>
                              <option>FJ - Joint Defect</option>
                              <option>RO - Roots</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Grade Assessment</label>
                            <div className="grid grid-cols-4 gap-2">
                              <button className="p-2 border border-gray-200 rounded-lg hover:border-[#2D99FF] text-sm">
                                Grade 1
                              </button>
                              <button className="p-2 border border-gray-200 rounded-lg hover:border-[#2D99FF] text-sm">
                                Grade 2
                              </button>
                              <button className="p-2 border border-gray-200 rounded-lg hover:border-[#2D99FF] text-sm">
                                Grade 3
                              </button>
                              <button className="p-2 border border-gray-200 rounded-lg hover:border-[#2D99FF] text-sm">
                                Grade 4
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">QC Notes</label>
                            <textarea 
                              className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:border-[#2D99FF] outline-none" 
                              rows="3"
                              placeholder="Add your professional assessment and any corrections to AI detection..."
                            ></textarea>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                              ✓ Approve Detection
                            </button>
                            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                              ✗ Reject Detection
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Detection to Review</h3>
                        <p className="text-gray-600">Click on a detection from the list to view and assess</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-20 w-20 mx-auto mb-6 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a Project to Review</h3>
                <p className="text-gray-600 mb-4">Choose an assigned project from the left panel to begin quality control review</p>
                <div className="bg-blue-50 p-4 rounded-xl max-w-md">
                  <p className="text-sm text-blue-700">
                    <strong>Your Role:</strong> Review AI-generated detections, validate accuracy, and provide PACP-certified assessments
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityControlPage;