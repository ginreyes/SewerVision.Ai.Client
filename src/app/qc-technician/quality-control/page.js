'use client'
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  MessageSquare,
  Video,
  Search,
  Filter,
  RefreshCw,
  Target,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';

const QualityControlPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [projectDetections, setProjectDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const user_id = useUser();


  useEffect(() => {
    const user = user_id.userData;
    setCurrentUser(user);
  }, []);

  const fetchAssignments = async () => {
  
    try {
      setLoading(true);
  
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
  
      const { data, error } = await api(
        `/api/qc-technicians/get-assignments/${user_id.userId}?${params.toString()}`,
        'GET'
      );
  
      if (error) {
        console.error('Error fetching assignments:', error);
        return;
      }
  
      setAssignedProjects(data?.data);
    } 
    catch (err) {
      console.error('Fetch error:', err);
    } 
    finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchAssignments();
    
  }, [currentUser, filterStatus]);

  const fetchProjectDetections = async (projectId) => {
    try {
      setDetectionLoading(true);
      const { data, error } = await api(`/api/qc-technicians/projects/${projectId}/detections?qcStatus=pending`);
      
      if (error) {
        console.error('Error fetching detections:', error);
        return;
      }

      setProjectDetections(data?.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setDetectionLoading(false);
    }
  };

  // Handle project selection
  const handleProjectSelect = async (project) => {
    setActiveProject(project);
    setSelectedDetection(null);
    
    // Fetch detections for this project
    await fetchProjectDetections(project.projectId._id || project.projectId);
    
    // Start QC session
    try {
      const { data, error } = await api('/api/qc-technicans/sessions', 'GET');
      
      if (!error && data?.data) {
        setActiveSession(data.data);
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const handleReviewDetection = async (detectionId, status) => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await api(`/api/qc-technicans/detections/${detectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          qcStatus: status,
          qcReviewedBy: currentUser.id,
          action: status
        })
      });

      if (error) {
        console.error('Error reviewing detection:', error);
        return;
      }

      // Refresh detections
      await fetchProjectDetections(activeProject.projectId._id || activeProject.projectId);
      
      // Refresh assignments to update progress
      await fetchAssignments();
      
      // Clear selected detection
      setSelectedDetection(null);
    } catch (err) {
      console.error('Review error:', err);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeProject) return;

    try {
      const { data, error } = await api(`/api/qc-technicans/${activeProject._id}`, 'PATCH');

      if (error) {
        console.error('Error marking complete:', error);
        return;
      }
      
      if (activeSession) {S
        await api(`/api/qc/sessions/${activeSession._id}/end`, {
          method: 'PATCH'
        });
      }
      
      await fetchAssignments();
      setActiveProject(null);
    } catch (err) {
      console.error('Complete error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': 
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
              <p className="text-sm text-gray-600">Review AI-generated inspection results</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-xs text-gray-600">{currentUser?.certification || 'QC Technician'}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
              </span>
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
              <button 
                onClick={fetchAssignments}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <RefreshCw className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm focus:border-blue-500 outline-none"
              >
                <option value="all">All Projects</option>
                <option value="assigned">Pending Review</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Today's Progress */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Today's Progress</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {assignedProjects.length}
                  </div>
                  <div className="text-xs text-gray-600">Projects Assigned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {assignedProjects.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>

            {/* Project List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {assignedProjects.map((project) => (
                  <div
                    key={project._id}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      activeProject?._id === project._id 
                        ? 'border-blue-500 bg-gradient-to-r from-purple-50 to-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {project.projectId?.name || 'Unnamed Project'}
                      </h3>
                      <div className="flex flex-col gap-1 ml-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">{project.projectId?.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Detections:</span>
                        <span className="font-medium">
                          {project.reviewedDetections}/{project.totalDetections}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(project.reviewedDetections / project.totalDetections) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      {Math.round((project.reviewedDetections / project.totalDetections) * 100)}% Complete
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    <h2 className="text-xl font-bold text-gray-900">
                      {activeProject.projectId?.name}
                    </h2>
                    <div className="flex gap-6 text-sm text-gray-600 mt-1">
                      <span>Location: {activeProject.projectId?.location}</span>
                      <span>Client: {activeProject.projectId?.client}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleMarkComplete}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 inline" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>

              {/* Detection List */}
              <div className="flex-1 flex">
                <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">
                        AI Detections ({projectDetections.filter(d => d.qcStatus === 'pending').length} need review)
                      </h3>
                    </div>

                    {detectionLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projectDetections.map((detection) => (
                          <div
                            key={detection._id}
                            className={`p-5 border rounded-2xl cursor-pointer transition-all ${
                              selectedDetection?._id === detection._id 
                                ? 'border-blue-500 bg-gradient-to-r from-purple-50 to-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            } ${detection.qcStatus === 'pending' ? 'ring-2 ring-yellow-200' : ''}`}
                            onClick={() => setSelectedDetection(detection)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-900">{detection.type}</span>
                                  {detection.qcStatus === 'pending' && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor((detection.confidence || 0) * 100)}`}>
                                    {Math.round((detection.confidence || 0) * 100)}% confidence
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

                            {detection.qcStatus === 'pending' && selectedDetection?._id === detection._id && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReviewDetection(detection._id, 'approved');
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReviewDetection(detection._id, 'rejected');
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-semibold"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Detection Details */}
                <div className="w-1/2 bg-gray-50 flex flex-col">
                  {selectedDetection ? (
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Detection Details</h3>
                      <div className="bg-white rounded-xl p-4 space-y-2">
                        <p><strong>Type:</strong> {selectedDetection.type}</p>
                        <p><strong>Confidence:</strong> {Math.round((selectedDetection.confidence || 0) * 100)}%</p>
                        <p><strong>Severity:</strong> {selectedDetection.severity}</p>
                        <p><strong>Status:</strong> {selectedDetection.qcStatus}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Detection</h3>
                        <p className="text-gray-600">Click on a detection to review</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a Project</h3>
                <p className="text-gray-600">Choose a project from the left to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityControlPage;