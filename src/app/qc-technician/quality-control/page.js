'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Target,
  Loader2,
  Play,
  Pause,
  Clock,
  MapPin,
  Building2
} from 'lucide-react';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';

const QualityControlPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [projectDetections, setProjectDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [todayStats, setTodayStats] = useState({ assigned: 0, completed: 0 });

  const userContext = useUser();

  useEffect(() => {
    if (userContext?.userData) {
      setCurrentUser(userContext.userData);
    }
  }, [userContext]);

  const fetchAssignments = useCallback(async () => {
    if (!userContext?.userId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await api(
        `/api/qc-technicians/get-assignments/${userContext.userId}?${params.toString()}`,
        'GET'
      );

      if (response.ok && response.data?.success) {
        const projects = response.data.data || [];
        setAssignedProjects(projects);
        
        // Calculate today's stats
        const assigned = projects.length;
        const completed = projects.filter(p => p.status === 'completed').length;
        setTodayStats({ assigned, completed });
      } else {
        console.log('Error fetching assignments:', response.data?.error || 'Unknown error');
        setAssignedProjects([]);
      }
    } catch (err) {
      console.log('Fetch error:', err?.message || 'Unknown error');
      setAssignedProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userContext?.userId, filterStatus]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const fetchProjectDetections = useCallback(async (projectId) => {
    if (!projectId) return;

    try {
      setDetectionLoading(true);
      const response = await api(
        `/api/qc-technicians/projects/${projectId}/detections?qcStatus=pending`,
        'GET'
      );

      if (response.ok && response.data?.success) {
        setProjectDetections(response.data.data || []);
      } else {
        console.log('Error fetching detections:', response.data?.error || 'Unknown error');
        setProjectDetections([]);
      }
    } catch (err) {
      console.log('Fetch error:', err?.message || 'Unknown error');
      setProjectDetections([]);
    } finally {
      setDetectionLoading(false);
    }
  }, []);

  const handleProjectSelect = useCallback(async (project) => {
    setActiveProject(project);
    setSelectedDetection(null);
    
    const projectId = project.projectId?._id || project.projectId || project._id;
    if (projectId) {
      await fetchProjectDetections(projectId);
    }
  }, [fetchProjectDetections]);

  const handleReviewDetection = useCallback(async (detectionId, status) => {
    if (!currentUser?._id && !currentUser?.id) return;

    try {
      const userId = currentUser._id || currentUser.id;
      const response = await api(
        `/api/qc-technicians/detections/${detectionId}`,
        'PATCH',
        {
          qcStatus: status,
          qcReviewedBy: userId,
          action: status
        }
      );

      if (response.ok && response.data?.success) {
        // Refresh detections
        const projectId = activeProject?.projectId?._id || activeProject?.projectId || activeProject?._id;
        if (projectId) {
          await fetchProjectDetections(projectId);
        }
        
        // Refresh assignments to update progress
        await fetchAssignments();
        
        // Clear selected detection
        setSelectedDetection(null);
      } else {
        console.log('Error reviewing detection:', response.data?.error || 'Unknown error');
      }
    } catch (err) {
      console.log('Review error:', err?.message || 'Unknown error');
    }
  }, [currentUser, activeProject, fetchProjectDetections, fetchAssignments]);

  const handleMarkComplete = useCallback(async () => {
    if (!activeProject) return;

    try {
      const projectId = activeProject?.projectId?._id || activeProject?.projectId || activeProject?._id;
      const response = await api(
        `/api/qc-technicians/assignments/${projectId}`,
        'PATCH',
        {
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      );

      if (response.ok && response.data?.success) {
        await fetchAssignments();
        setActiveProject(null);
        setSelectedDetection(null);
      } else {
        console.log('Error marking complete:', response.data?.error || 'Unknown error');
      }
    } catch (err) {
      console.log('Complete error:', err?.message || 'Unknown error');
    }
  }, [activeProject, fetchAssignments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': 
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-rose-100 text-rose-700 border-rose-200';
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
    const conf = typeof confidence === 'number' ? confidence : (confidence || 0) * 100;
    if (conf >= 85) return 'bg-green-100 text-green-700';
    if (conf >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const calculateProgress = (project) => {
    const total = project.totalDetections || 0;
    const reviewed = project.reviewedDetections || 0;
    if (total === 0) return 0;
    return Math.round((reviewed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-2xl flex items-center justify-center">
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#D76A84] to-rose-500 rounded-full flex items-center justify-center">
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
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
              >
                <option value="all">All Projects</option>
                <option value="assigned">Pending Review</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Today's Progress */}
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 mb-6 border border-rose-200/50">
              <h3 className="font-bold text-gray-900 mb-3">Today Progress</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent">
                    {todayStats.assigned}
                  </div>
                  <div className="text-xs text-gray-600">Projects Assigned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {todayStats.completed}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>

            {/* Project List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : assignedProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No projects assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedProjects.map((project) => {
                  const progress = calculateProgress(project);
                  const projectData = project.projectId || project;
                  
                  return (
                    <div
                      key={project._id}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        activeProject?._id === project._id 
                          ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm shadow-rose-500/10' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => handleProjectSelect(project)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                          {projectData?.name || 'Unnamed Project'}
                        </h3>
                        <div className="flex flex-col gap-1 ml-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(project.priority)}`}>
                            {project.priority || 'medium'}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">{projectData?.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Detections:</span>
                          <span className="font-medium">
                            {project.reviewedDetections || 0}/{project.totalDetections || 0}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {isNaN(progress) ? '0%' : `${progress}%`} Complete
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeProject ? (
            <>
              {/* Project Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {(activeProject.projectId || activeProject)?.name || 'Unnamed Project'}
                    </h2>
                    <div className="flex gap-6 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location: {(activeProject.projectId || activeProject)?.location || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Client: {(activeProject.projectId || activeProject)?.client || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleMarkComplete}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </button>
                </div>
              </div>

              {/* Detection List and Details */}
              <div className="flex-1 flex overflow-hidden">
                {/* Detection List */}
                <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">
                        AI Detections ({projectDetections.filter(d => d.qcStatus === 'pending').length} need review)
                      </h3>
                    </div>

                    {detectionLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                      </div>
                    ) : projectDetections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No detections found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projectDetections.map((detection) => {
                          const confidence = typeof detection.confidence === 'number' 
                            ? detection.confidence * 100 
                            : (detection.confidence || 0) * 100;
                          
                          return (
                            <div
                              key={detection._id}
                              className={`p-5 border rounded-2xl cursor-pointer transition-all ${
                                selectedDetection?._id === detection._id 
                                  ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm shadow-rose-500/10' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              } ${detection.qcStatus === 'pending' ? 'ring-2 ring-yellow-200' : ''}`}
                              onClick={() => setSelectedDetection(detection)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-900">{detection.type || 'Unknown'}</span>
                                    {detection.qcStatus === 'pending' && (
                                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="flex gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor(confidence)}`}>
                                      {Math.round(confidence)}% confidence
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                                      {detection.severity || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  detection.qcStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                  detection.qcStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {detection.qcStatus || 'pending'}
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
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-semibold transition-colors"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReviewDetection(detection._id, 'rejected');
                                      }}
                                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-semibold transition-colors"
                                    >
                                      ✗ Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Detection Details */}
                <div className="w-1/2 bg-gray-50 flex flex-col">
                  {selectedDetection ? (
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Detection Details</h3>
                      <div className="bg-white rounded-xl p-4 space-y-3">
                        <div>
                          <strong className="text-gray-700">Type:</strong>
                          <p className="text-gray-900">{selectedDetection.type || 'Unknown'}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Confidence:</strong>
                          <p className="text-gray-900">
                            {Math.round((selectedDetection.confidence || 0) * 100)}%
                          </p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Severity:</strong>
                          <p className="text-gray-900">{selectedDetection.severity || 'N/A'}</p>
                        </div>
                        <div>
                          <strong className="text-gray-700">Status:</strong>
                          <p className="text-gray-900">{selectedDetection.qcStatus || 'pending'}</p>
                        </div>
                        {selectedDetection.timestamp && (
                          <div>
                            <strong className="text-gray-700">Timestamp:</strong>
                            <p className="text-gray-900">{selectedDetection.timestamp}s</p>
                          </div>
                        )}
                        {selectedDetection.frameNumber && (
                          <div>
                            <strong className="text-gray-700">Frame:</strong>
                            <p className="text-gray-900">{selectedDetection.frameNumber}</p>
                          </div>
                        )}
                        {selectedDetection.location?.distance && (
                          <div>
                            <strong className="text-gray-700">Distance:</strong>
                            <p className="text-gray-900">{selectedDetection.location.distance}m</p>
                          </div>
                        )}
                        {selectedDetection.qcNotes && (
                          <div>
                            <strong className="text-gray-700">QC Notes:</strong>
                            <p className="text-gray-900">{selectedDetection.qcNotes}</p>
                          </div>
                        )}
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
