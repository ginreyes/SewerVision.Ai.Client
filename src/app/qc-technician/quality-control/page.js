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
  Clock,
  MapPin,
  Building2,
  Keyboard,
  Filter,
  Search,
  ChevronRight,
  MoreVertical,
  Zap,
  Activity
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
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in-progress': return 'bg-rose-100 text-rose-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getConfidenceColor = (confidence) => {
    const conf = typeof confidence === 'number' ? confidence : (confidence || 0) * 100;
    if (conf >= 85) return 'text-green-600 bg-green-50';
    if (conf >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const calculateProgress = (project) => {
    const total = project.totalDetections || 0;
    const reviewed = project.reviewedDetections || 0;
    if (total === 0) return 0;
    return Math.round((reviewed / total) * 100);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (!selectedDetection) {
        if (e.key === 'ArrowDown' && projectDetections.length > 0) {
          e.preventDefault();
          setSelectedDetection(projectDetections[0]);
        }
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (selectedDetection.qcStatus === 'pending') {
          handleReviewDetection(selectedDetection._id, 'approved');
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (selectedDetection.qcStatus === 'pending') {
          handleReviewDetection(selectedDetection._id, 'rejected');
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedDetection(null);
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = projectDetections.findIndex(d => d._id === selectedDetection._id);
        if (currentIndex === -1) return;

        let newIndex;
        if (e.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : projectDetections.length - 1;
        } else {
          newIndex = currentIndex < projectDetections.length - 1 ? currentIndex + 1 : 0;
        }

        setSelectedDetection(projectDetections[newIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDetection, projectDetections, handleReviewDetection]);

  // Filter assigned projects
  const filteredProjects = assignedProjects.filter(p => {
    const pName = (p.projectId?.name || p.name || '').toLowerCase();
    return pName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-none z-10">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm shadow-rose-200">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QC Console</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Quality Control</span>
                <ChevronRight className="w-3 h-3" />
                <span>Review</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats Pill */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-700">{todayStats.assigned} Assigned</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-700">{todayStats.completed} Completed</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser?.first_name} {currentUser?.last_name}
                </p>
                <p className="text-xs text-gray-500">{currentUser?.certification || 'Technician'}</p>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-gray-600 font-bold text-sm">
                  {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Left Panel - Project List */}
        <div className="w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col flex-none">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                Assignments
              </h2>
              <button
                onClick={fetchAssignments}
                disabled={loading}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:border-rose-500"
                >
                  <option value="assigned">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="all">All Status</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <span className="text-xs">Loading assignments...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No projects found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting filters</p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const progress = calculateProgress(project);
                const projectData = project.projectId || project;
                const isActive = activeProject?._id === project._id;

                return (
                  <div
                    key={project._id}
                    className={`group p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${isActive
                        ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50 bg-white'
                      }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}

                    <div className="flex items-start justify-between mb-2 pl-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">
                        {projectData?.name || 'Unnamed Project'}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(project.priority)}`}>
                        {project.priority || 'MED'}
                      </span>
                    </div>

                    <div className="pl-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{projectData?.location || 'No Location'}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Target className="w-3 h-3" />
                          <span>{project.reviewedDetections || 0}/{project.totalDetections || 0}</span>
                        </div>
                        <span className={`${progress === 100 ? 'text-green-600' : 'text-gray-500'}`}>{progress}%</span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-rose-500'
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {activeProject ? (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-none shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {(activeProject.projectId || activeProject)?.name || 'Unnamed Project'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      ID: {(activeProject.projectId || activeProject)?._id?.slice(-8).toUpperCase()} •
                      {(activeProject.projectId || activeProject)?.client || 'Unknown Client'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200" title="Shortcuts">
                    <Keyboard className="w-3.5 h-3.5 text-gray-400" />
                    <div className="text-[10px] text-gray-500 font-medium space-x-2">
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">A</kbd> Approve</span>
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">R</kbd> Reject</span>
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">Esc</kbd> Clear</span>
                    </div>
                  </div>
                  <button
                    onClick={handleMarkComplete}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Review</span>
                  </button>
                </div>
              </div>

              {/* Work Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Detection Queue */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Review Queue
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      {projectDetections.filter(d => d.qcStatus === 'pending').length} remaining
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-50/30">
                    {detectionLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                      </div>
                    ) : projectDetections.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500/20" />
                        <p className="text-sm">All caught up!</p>
                      </div>
                    ) : (
                      projectDetections.map(detection => {
                        const confidence = typeof detection.confidence === 'number'
                          ? detection.confidence * 100
                          : (detection.confidence || 0) * 100;
                        const isSelected = selectedDetection?._id === detection._id;

                        return (
                          <div
                            key={detection._id}
                            id={`detection-${detection._id}`}
                            onClick={() => setSelectedDetection(detection)}
                            className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected
                                ? 'bg-white border-rose-500 ring-1 ring-rose-500 shadow-md transform scale-[1.02] z-10'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              } ${detection.qcStatus === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {detection.type || 'Anomaly'}
                                </span>
                                {detection.qcStatus === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                              </div>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getConfidenceColor(confidence)}`}>
                                {Math.round(confidence)}% Conf.
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="text-gray-500">Frame: {detection.frameNumber || 'N/A'}</span>
                              <span className={`px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium`}>
                                {detection.severity || 'Minor'}
                              </span>
                            </div>

                            {/* Status / Actions */}
                            {detection.qcStatus !== 'pending' ? (
                              <div className={`text-xs font-medium flex items-center gap-1.5 ${detection.qcStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {detection.qcStatus === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span className="capitalize">{detection.qcStatus}</span>
                              </div>
                            ) : isSelected && (
                              <div className="flex gap-2 animate-in fade-in duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewDetection(detection._id, 'approved');
                                  }}
                                  className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded hover:bg-green-100 border border-green-200 transition-colors"
                                >
                                  Approve (A)
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewDetection(detection._id, 'rejected');
                                  }}
                                  className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors"
                                >
                                  Reject (R)
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Main Review Area */}
                <div className="w-2/3 bg-gray-50 flex flex-col p-6 items-center justify-center relative">
                  {/* Background Image / Placeholder */}
                  <div className="absolute inset-0 z-0 bg-gray-100 pattern-grid-lg opacity-50" />

                  {selectedDetection ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-2xl z-10 animate-in zoom-in-95 duration-200">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {selectedDetection.type || 'Unknown Detection'}
                            <span className="text-xs font-normal text-gray-500 px-2 py-0.5 border border-gray-200 rounded-full bg-white">
                              ID: {selectedDetection._id.slice(-6)}
                            </span>
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getConfidenceColor(selectedDetection.confidence)}`}>
                            {Math.round((selectedDetection.confidence || 0) * 100)}% Confidence
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Time</span>
                            <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {selectedDetection.timestamp ? `${selectedDetection.timestamp}s` : '00:00'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Frame</span>
                            <span className="text-sm font-semibold text-gray-900">
                              #{selectedDetection.frameNumber || '0'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Position</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {selectedDetection.location?.distance ? `${selectedDetection.location.distance}m` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Analysis</span>
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm leading-relaxed border border-blue-100">
                              {selectedDetection.qcNotes || 'No automated analysis notes available for this detection.'}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Severity</span>
                              <div className={`text-sm font-medium px-3 py-2 rounded-lg border inline-block w-full ${selectedDetection.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                  selectedDetection.severity === 'Major' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                }`}>
                                {selectedDetection.severity || 'Not Rated'}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Status</span>
                              <div className={`text-sm font-medium px-3 py-2 rounded-lg border inline-block w-full capitalize ${selectedDetection.qcStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                  selectedDetection.qcStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                {selectedDetection.qcStatus || 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      {selectedDetection.qcStatus === 'pending' && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                          <button
                            onClick={() => handleReviewDetection(selectedDetection._id, 'approved')}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
                          >
                            <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Approve Detection
                          </button>
                          <button
                            onClick={() => handleReviewDetection(selectedDetection._id, 'rejected')}
                            className="flex-1 py-3 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject False Positive
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                        <Target className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Detection</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        Choose a detection from the queue on the left to review its details and make a decision.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-rose-50 rounded-full animate-ping opacity-20" />
                  <Zap className="h-12 w-12 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Review</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Select an assigned project from the sidebar to begin your quality control workflow.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityControlPage;