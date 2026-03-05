'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Activity,
  FileText,
  ArrowRight,
  Play,
  Hash,
  Ruler
} from 'lucide-react';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useRouter } from 'next/navigation';

// ─── Helpers ────────────────────────────────────────────────
/** Normalize confidence to 0-100 range (handles both 0-1 decimals and 0-100 integers) */
const normalizeConfidence = (value) => {
  if (value == null || isNaN(value)) return 0;
  const num = Number(value);
  return num > 1 ? num : num * 100;
};

/** Convert seconds to mm:ss display */
const formatTimestamp = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '0:00';
  const totalSec = Math.round(Number(seconds));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getConfidenceColor = (pct) => {
  if (pct >= 85) return 'text-green-700 bg-green-50 border-green-200';
  if (pct >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const getSeverityStyle = (severity) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'minor': return 'bg-green-100 text-green-800 border-green-200';
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

const getStatusColor = (status) => {
  switch (status) {
    case 'assigned':
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'in-progress': return 'bg-rose-100 text-rose-700';
    case 'completed': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// ─── Page ───────────────────────────────────────────────────
const QualityControlPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [projectDetections, setProjectDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [todayStats, setTodayStats] = useState({ assigned: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [detectionSearch, setDetectionSearch] = useState('');
  const [detectionSeverityFilter, setDetectionSeverityFilter] = useState('all');
  const [reviewingId, setReviewingId] = useState(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completingReview, setCompletingReview] = useState(false);

  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  // ─── Data Fetching ──────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);

      const response = await api(`/api/qc-technicians/get-assignments/${userId}?${params.toString()}`, 'GET');
      if (response.ok && response.data?.success) {
        const projects = response.data.data || [];
        setAssignedProjects(projects);
        setTodayStats({
          assigned: projects.length,
          completed: projects.filter(p => p.status === 'completed').length
        });
      } else {
        setAssignedProjects([]);
      }
    } catch {
      setAssignedProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filterStatus]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const fetchProjectDetections = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      setDetectionLoading(true);
      const response = await api(`/api/qc-technicians/projects/${projectId}/detections?qcStatus=pending`, 'GET');
      if (response.ok && response.data?.success) {
        setProjectDetections(response.data.data || []);
      } else {
        setProjectDetections([]);
      }
    } catch {
      setProjectDetections([]);
    } finally {
      setDetectionLoading(false);
    }
  }, []);

  const handleProjectSelect = useCallback(async (project) => {
    setActiveProject(project);
    setSelectedDetection(null);
    setDetectionSearch('');
    setDetectionSeverityFilter('all');
    const projectId = project.projectId?._id || project.projectId || project._id;
    if (projectId) await fetchProjectDetections(projectId);
  }, [fetchProjectDetections]);

  // ─── Review Actions ─────────────────────────────────────
  const handleReviewDetection = useCallback(async (detectionId, status) => {
    const reviewerId = userData?._id || userData?.id || userId;
    if (!reviewerId) {
      showAlert('Unable to review: user session not loaded. Please refresh the page.', 'error');
      return;
    }
    setReviewingId(detectionId);
    try {
      const response = await api(`/api/qc-technicians/detections/${detectionId}`, 'PATCH', {
        qcStatus: status, qcReviewedBy: reviewerId, action: status
      });
      if (response.ok && response.data?.success) {
        const projectId = activeProject?.projectId?._id || activeProject?.projectId || activeProject?._id;
        if (projectId) await fetchProjectDetections(projectId);
        await fetchAssignments();
        setSelectedDetection(null);
        showAlert(`Detection ${status} successfully`, 'success');
      } else {
        showAlert(response.data?.error || `Failed to ${status} detection`, 'error');
      }
    } catch (err) {
      showAlert(err?.message || `Failed to ${status} detection`, 'error');
    } finally {
      setReviewingId(null);
    }
  }, [userData, userId, activeProject, fetchProjectDetections, fetchAssignments, showAlert]);

  /** Show confirmation dialog before completing */
  const handleMarkCompleteClick = useCallback(() => {
    if (!activeProject) return;
    setShowCompleteDialog(true);
  }, [activeProject]);

  /** Actually mark the project review as complete, then offer report creation */
  const handleConfirmComplete = useCallback(async (createReport = false) => {
    if (!activeProject) return;
    setCompletingReview(true);
    try {
      const projectId = activeProject?.projectId?._id || activeProject?.projectId || activeProject?._id;
      const response = await api(`/api/qc-technicians/assignments/${projectId}`, 'PATCH', {
        status: 'completed', completedAt: new Date().toISOString()
      });
      if (response.ok && response.data?.success) {
        await fetchAssignments();
        const projectName = (activeProject.projectId || activeProject)?.name || 'Project';
        setShowCompleteDialog(false);
        setActiveProject(null);
        setSelectedDetection(null);
        showAlert(`"${projectName}" review completed`, 'success');

        if (createReport) {
          // Navigate to reports page with project pre-selected
          router.push(`/qc-technician/reports?newReport=true&projectId=${projectId}`);
        }
      } else {
        showAlert(response.data?.error || 'Failed to mark project as complete', 'error');
      }
    } catch (err) {
      showAlert(err?.message || 'Failed to mark project as complete', 'error');
    } finally {
      setCompletingReview(false);
    }
  }, [activeProject, fetchAssignments, showAlert, router]);

  const calculateProgress = (project) => {
    const total = project.totalDetections || 0;
    const reviewed = project.reviewedDetections || 0;
    if (total === 0) return 0;
    return Math.round((reviewed / total) * 100);
  };

  // ─── Filtered Detections ────────────────────────────────
  const filteredDetections = useMemo(() => {
    let filtered = projectDetections;
    if (detectionSeverityFilter !== 'all') {
      filtered = filtered.filter(d => (d.severity || '').toLowerCase() === detectionSeverityFilter.toLowerCase());
    }
    if (detectionSearch.trim()) {
      const q = detectionSearch.toLowerCase();
      filtered = filtered.filter(d =>
        (d.type || '').toLowerCase().includes(q) ||
        (d.description || d.notes || d.qcNotes || '').toLowerCase().includes(q) ||
        (d.severity || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [projectDetections, detectionSearch, detectionSeverityFilter]);

  // ─── Keyboard Shortcuts ─────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (!selectedDetection) {
        if (e.key === 'ArrowDown' && filteredDetections.length > 0) {
          e.preventDefault();
          setSelectedDetection(filteredDetections[0]);
        }
        return;
      }
      if ((e.key === 'a' || e.key === 'A') && selectedDetection.qcStatus === 'pending') {
        e.preventDefault();
        handleReviewDetection(selectedDetection._id, 'approved');
      }
      if ((e.key === 'r' || e.key === 'R') && selectedDetection.qcStatus === 'pending') {
        e.preventDefault();
        handleReviewDetection(selectedDetection._id, 'rejected');
      }
      if (e.key === 'Escape') { e.preventDefault(); setSelectedDetection(null); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = filteredDetections.findIndex(d => d._id === selectedDetection._id);
        if (idx === -1) return;
        const next = e.key === 'ArrowUp'
          ? (idx > 0 ? idx - 1 : filteredDetections.length - 1)
          : (idx < filteredDetections.length - 1 ? idx + 1 : 0);
        setSelectedDetection(filteredDetections[next]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDetection, filteredDetections, handleReviewDetection]);

  const filteredProjects = assignedProjects.filter(p => {
    const pName = (p.projectId?.name || p.name || '').toLowerCase();
    return pName.includes(searchTerm.toLowerCase());
  });

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-7rem)] bg-gray-50 flex flex-col overflow-hidden">
      {/* ═══ Complete Review Dialog ═══ */}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !completingReview && setShowCompleteDialog(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Project Review</h3>
              <p className="text-sm text-gray-500 mb-1">
                You are about to mark <span className="font-semibold text-gray-700">{(activeProject?.projectId || activeProject)?.name || 'this project'}</span> as reviewed.
              </p>
              <p className="text-sm text-gray-500">
                Would you like to generate a QC report now?
              </p>
            </div>
            <div className="px-6 pb-6 space-y-2">
              <button
                onClick={() => handleConfirmComplete(true)}
                disabled={completingReview}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {completingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Complete & Create Report
              </button>
              <button
                onClick={() => handleConfirmComplete(false)}
                disabled={completingReview}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {completingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Complete Without Report
              </button>
              <button
                onClick={() => setShowCompleteDialog(false)}
                disabled={completingReview}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Header ═══ */}
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
                <p className="text-sm font-semibold text-gray-900">{userData?.first_name} {userData?.last_name}</p>
                <p className="text-xs text-gray-500">{userData?.certification || 'Technician'}</p>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-gray-600 font-bold text-sm">{userData?.first_name?.[0]}{userData?.last_name?.[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Layout ═══ */}
      <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* ── Left Panel — Project List ── */}
        <div className="w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col flex-none">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                Assignments
              </h2>
              <button onClick={fetchAssignments} disabled={loading} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:outline-none focus:border-rose-500">
                <option value="assigned">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="all">All Status</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mb-2" /><span className="text-xs">Loading assignments...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3"><Target className="h-6 w-6 text-gray-300" /></div>
                <p className="text-sm font-medium text-gray-900">No projects found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting filters</p>
              </div>
            ) : filteredProjects.map((project) => {
              const progress = calculateProgress(project);
              const projectData = project.projectId || project;
              const isActive = activeProject?._id === project._id;
              return (
                <div key={project._id}
                  className={`group p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${isActive ? 'border-rose-500 bg-rose-50/50 shadow-sm' : 'border-gray-100 hover:border-rose-200 hover:bg-gray-50 bg-white'}`}
                  onClick={() => handleProjectSelect(project)}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                  <div className="flex items-start justify-between mb-2 pl-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 pr-2">{projectData?.name || 'Unnamed Project'}</h3>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(project.priority)}`}>{project.priority || 'MED'}</span>
                  </div>
                  <div className="pl-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3 h-3" /><span className="truncate">{projectData?.location || 'No Location'}</span></div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600"><Target className="w-3 h-3" /><span>{project.reviewedDetections || 0}/{project.totalDetections || 0}</span></div>
                      <span className={progress === 100 ? 'text-green-600' : 'text-gray-500'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-rose-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Workspace ── */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {activeProject ? (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-none shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg"><Building2 className="w-5 h-5 text-rose-600" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{(activeProject.projectId || activeProject)?.name || 'Unnamed Project'}</h2>
                    <p className="text-xs text-gray-500">
                      ID: {(activeProject.projectId || activeProject)?._id?.slice(-8).toUpperCase()} &bull; {(activeProject.projectId || activeProject)?.client || 'Unknown Client'}
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
                  <button onClick={handleMarkCompleteClick}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /><span>Complete Review</span>
                  </button>
                </div>
              </div>

              {/* Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* ── Detection Queue ── */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col min-h-0">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50 space-y-2 flex-none">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />Review Queue
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                        {filteredDetections.filter(d => d.qcStatus === 'pending').length} remaining
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input type="text" placeholder="Search detections..." value={detectionSearch} onChange={(e) => setDetectionSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                      </div>
                      <select value={detectionSeverityFilter} onChange={(e) => setDetectionSeverityFilter(e.target.value)}
                        className="py-1.5 pl-2 pr-6 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="moderate">Moderate</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-50/30">
                    {detectionLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>
                    ) : filteredDetections.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        {projectDetections.length > 0 ? (
                          <><Search className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">No matching detections</p><p className="text-xs mt-1">Try adjusting your search or filter</p></>
                        ) : (
                          <><CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500/20" /><p className="text-sm">All caught up!</p></>
                        )}
                      </div>
                    ) : filteredDetections.map(detection => {
                      const conf = normalizeConfidence(detection.confidence);
                      const isSelected = selectedDetection?._id === detection._id;
                      return (
                        <div key={detection._id} id={`detection-${detection._id}`} onClick={() => setSelectedDetection(detection)}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white border-rose-500 ring-1 ring-rose-500 shadow-md transform scale-[1.02] z-10' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'} ${detection.qcStatus === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm">{detection.type || 'Anomaly'}</span>
                              {detection.qcStatus === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                            </div>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getConfidenceColor(conf)}`}>
                              {Math.round(conf)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mb-3">
                            <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTimestamp(detection.timestamp)}</span>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getSeverityStyle(detection.severity)}`}>{detection.severity || 'Minor'}</span>
                          </div>
                          {detection.qcStatus !== 'pending' ? (
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${detection.qcStatus === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                              {detection.qcStatus === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span className="capitalize">{detection.qcStatus}</span>
                            </div>
                          ) : isSelected && (
                            <div className="flex gap-2 animate-in fade-in duration-200">
                              <button onClick={e => { e.stopPropagation(); handleReviewDetection(detection._id, 'approved'); }} disabled={reviewingId === detection._id}
                                className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {reviewingId === detection._id ? 'Reviewing...' : 'Approve (A)'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); handleReviewDetection(detection._id, 'rejected'); }} disabled={reviewingId === detection._id}
                                className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {reviewingId === detection._id ? 'Reviewing...' : 'Reject (R)'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Detection Detail Panel ── */}
                <div className="w-2/3 bg-gray-50 flex flex-col overflow-y-auto relative">
                  <div className="absolute inset-0 z-0 bg-gray-100 pattern-grid-lg opacity-50" />

                  {selectedDetection ? (() => {
                    const conf = normalizeConfidence(selectedDetection.confidence);
                    return (
                      <div className="p-6 flex items-start justify-center z-10 relative min-h-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-2xl animate-in zoom-in-95 duration-200">
                          {/* Card Header */}
                          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                  {selectedDetection.type || 'Unknown Detection'}
                                  <span className="text-xs font-normal text-gray-400 px-2 py-0.5 border border-gray-200 rounded-full bg-white">
                                    {selectedDetection._id.slice(-6).toUpperCase()}
                                  </span>
                                </h3>
                                {selectedDetection.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{selectedDetection.description}</p>
                                )}
                              </div>
                              <span className={`shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-bold border ${getConfidenceColor(conf)}`}>
                                {Math.round(conf)}% Confidence
                              </span>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Play className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Time</span></div>
                              <p className="text-sm font-bold text-gray-900">{formatTimestamp(selectedDetection.timestamp)}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Frame</span></div>
                              <p className="text-sm font-bold text-gray-900">#{selectedDetection.frameNumber || '0'}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Ruler className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span></div>
                              <p className="text-sm font-bold text-gray-900">{selectedDetection.location?.distance ? `${selectedDetection.location.distance}m` : 'N/A'}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><AlertTriangle className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Severity</span></div>
                              <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${getSeverityStyle(selectedDetection.severity)}`}>
                                {selectedDetection.severity || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Detail Body */}
                          <div className="p-5 space-y-4">
                            {/* Analysis Notes */}
                            <div>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Analysis Notes</span>
                              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm leading-relaxed border border-blue-100">
                                {selectedDetection.qcNotes || selectedDetection.description || 'No automated analysis notes available for this detection.'}
                              </div>
                            </div>

                            {/* Location & PACP */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                                <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-sm text-gray-700">
                                  {selectedDetection.location?.description || selectedDetection.location?.segment || 'No location data'}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Status</span>
                                <div className={`p-3 rounded-lg border text-sm font-medium capitalize ${selectedDetection.qcStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : selectedDetection.qcStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {selectedDetection.qcStatus || 'Pending'}
                                </div>
                              </div>
                            </div>

                            {/* PACP Code if available */}
                            {selectedDetection.pacpCode && (
                              <div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">PACP Code</span>
                                <div className="flex items-center gap-3">
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-sm font-mono font-bold">{selectedDetection.pacpCode}</span>
                                  {selectedDetection.pacpScore != null && (
                                    <span className="text-sm text-gray-600">Score: <strong>{selectedDetection.pacpScore}</strong></span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Footer */}
                          {selectedDetection.qcStatus === 'pending' && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                              <button onClick={() => handleReviewDetection(selectedDetection._id, 'approved')} disabled={!!reviewingId}
                                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {reviewingId === selectedDetection._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                {reviewingId === selectedDetection._id ? 'Approving...' : 'Approve Detection'}
                              </button>
                              <button onClick={() => handleReviewDetection(selectedDetection._id, 'rejected')} disabled={!!reviewingId}
                                className="flex-1 py-3 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {reviewingId === selectedDetection._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                {reviewingId === selectedDetection._id ? 'Rejecting...' : 'Reject False Positive'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="flex-1 flex items-center justify-center z-10 relative">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                          <Target className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Detection</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Choose a detection from the queue to review its details and make a decision.</p>
                      </div>
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
