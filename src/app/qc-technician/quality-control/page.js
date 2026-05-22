'use client'
import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Ruler,
  Camera,
  Layers,
  SplitSquareHorizontal,
  Film,
  Info,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useRouter } from 'next/navigation';
import {
  normalizeConfidence,
  formatTimestamp,
  getConfidenceColor,
  getSeverityStyle,
  getPriorityColor,
  getStatusColor,
  BACKEND_URL,
} from '@/components/qc/constants';
import { ComparisonView } from '@/components/qc/quality-control';
import { VideoPane, ProjectInfoDrawer, useWorkspaceUrlState } from '@/components/qc/workspace';
import {
  useProjectVideos,
  useCreateManualDetection,
  useQCAssignments,
  useProjectDetections,
  useReviewDetection,
  useBulkReviewDetections,
  useBulkUndoReview,
  useCompleteQCAssignment,
} from '@/hooks/useQueryHooks';
import { ManualForm } from '@/components/qc/project';
import { useProjectChatLauncher } from '@/components/providers/ProjectChatLauncherProvider';
import KeyboardShortcutsDialog from '@/components/qc/quality-control/KeyboardShortcutsDialog';
import BulkUndoToast from '@/components/qc/quality-control/BulkUndoToast';

// ─── Page ───────────────────────────────────────────────────
const QualityControlPage = () => {
  const [activeProject, setActiveProject] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [detectionSearch, setDetectionSearch] = useState('');
  const [detectionSeverityFilter, setDetectionSeverityFilter] = useState('all');
  const [reviewingId, setReviewingId] = useState(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  // Third mode added: 'video' renders the full HTML5 player with detection seek.
  const [viewMode, setViewMode] = useState('detail'); // 'detail' | 'comparison' | 'video'

  // Workspace-unification state (added when merging /qc-technician/project/[id]):
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  // Bulk-review multi-select. Stored as a Set for O(1) toggle/lookup; cleared
  // when active project changes so selections don't leak across projects.
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  // Stack of pending undo entries (one per recent bulk op). Capped at 5; the
  // BulkUndoToast renders the most recent and falls back to the next when the
  // top one is consumed/dismissed.
  const [undoStack, setUndoStack] = useState([]);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  // Track whether initial URL-state hydration has been applied yet
  const didHydrateFromUrl = useRef(false);

  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  // URL state — ?project=<id>&detection=<id>&view=detail|comparison|video
  const {
    projectParam, detectionParam, viewParam,
    setProjectParam, setDetectionParam, setViewParam,
  } = useWorkspaceUrlState();

  // Derive the active projectId for secondary data fetches (videos, manual form)
  const activeProjectId = useMemo(() => {
    if (!activeProject) return null;
    return activeProject.projectId?._id || activeProject.projectId || activeProject._id;
  }, [activeProject]);

  // ─── Data hooks (TanStack Query) ────────────────────────
  // Assignments + detections are cached across navigations via useQueryHooks.
  // staleTimes: assignments = 2min, detections = 1min, videos = 5min. Every
  // mutation (approve/reject/manual add/complete) invalidates or optimistically
  // patches the caches so edits still propagate instantly.
  const {
    data: assignedProjectsData,
    isLoading: loading,
    refetch: refetchAssignments,
  } = useQCAssignments(userId, filterStatus, { enabled: !!userId });
  const assignedProjects = useMemo(
    () => (Array.isArray(assignedProjectsData) ? assignedProjectsData : []),
    [assignedProjectsData]
  );

  const {
    data: projectDetectionsData,
    isLoading: detectionLoading,
  } = useProjectDetections(activeProjectId, 'pending', { enabled: !!activeProjectId });
  const projectDetections = useMemo(
    () => (Array.isArray(projectDetectionsData) ? projectDetectionsData : []),
    [projectDetectionsData]
  );

  // Derived dashboard counters — no longer need useState + useEffect
  const todayStats = useMemo(
    () => ({
      assigned: assignedProjects.length,
      completed: assignedProjects.filter(p => p.status === 'completed').length,
    }),
    [assignedProjects]
  );

  // Project videos feed the Video view mode + anchor the manual-detection form
  const { data: projectVideos, refetch: refetchProjectVideos } = useProjectVideos(activeProjectId);
  const { videoUrl, videoId } = useMemo(() => {
    const videos = Array.isArray(projectVideos) ? projectVideos : [];
    const latest = videos[0];
    if (latest?._id) {
      return { videoUrl: `${BACKEND_URL}/api/videos/${latest._id}`, videoId: latest._id };
    }
    return { videoUrl: null, videoId: null };
  }, [projectVideos]);

  const createManualMutation = useCreateManualDetection();
  const reviewMutation = useReviewDetection();
  const completeMutation = useCompleteQCAssignment();

  const handleProjectSelect = useCallback((project) => {
    setActiveProject(project);
    setSelectedDetection(null);
    setDetectionSearch('');
    setDetectionSeverityFilter('all');
    const projectId = project.projectId?._id || project.projectId || project._id;
    if (projectId) {
      // Reflect the selection in the URL so refresh/back/bookmarks work. The
      // useProjectDetections hook sees activeProjectId change and fetches
      // automatically — no manual fetchProjectDetections call required.
      setProjectParam(projectId);
    }
  }, [setProjectParam]);

  // ─── URL state hydration ──────────────────────────────────
  //
  // IMPORTANT: After initial hydration, URL flow is **one-directional**:
  //   user click / setSelectedDetection → URL
  // The URL does NOT write back into state after mount. An earlier version
  // had a bidirectional sync that fought itself in an infinite loop:
  //   click A → state=A, URL=B (stale) → sync-from-URL reverts state to B
  //   → sync-to-URL writes A to URL → sync-from-URL reverts state to B → ...
  // Route history/back-button navigation is a known minor limitation: the
  // user's current selection does not rewind on "back". Fix if needed later
  // via a popstate listener rather than reinstating the bidirectional sync.
  //
  // Hydration runs exactly once, and only for the initial values present in
  // the URL at mount time (refresh, bookmark, or a redirect from the retired
  // /qc-technician/project/[id] stub).

  const didHydrateProjectRef = useRef(false);
  const didHydrateDetectionRef = useRef(false);
  // Track our own last URL writes so nothing can mistake the echo for an
  // external navigation and try to re-sync.
  const lastWrittenDetectionRef = useRef(null);
  const lastWrittenViewRef = useRef(null);

  // Project + view-mode hydration — fires once, when the assignments list
  // is first ready. Also applies the initial ?view=... so a bookmark like
  // ?project=X&view=video opens the workspace straight into Video mode.
  useEffect(() => {
    if (didHydrateProjectRef.current) return;
    if (!assignedProjects.length) return;
    didHydrateProjectRef.current = true;
    // Combined flag tells the sync-to-URL effects that hydration is done
    // and they may start writing state back out to the URL.
    didHydrateFromUrl.current = true;

    // Apply initial view mode (if the URL carried one) before touching the
    // ref so the sync-to-URL effect will see a no-op on first write.
    if (viewParam && viewParam !== viewMode) {
      setViewMode(viewParam);
      lastWrittenViewRef.current = viewParam;
    } else {
      lastWrittenViewRef.current = viewMode;
    }

    if (!projectParam) return;
    const match = assignedProjects.find(p => {
      const pid = p.projectId?._id || p.projectId || p._id;
      return pid === projectParam;
    });
    if (match) handleProjectSelect(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedProjects]);

  // Detection hydration — fires once, after a project's detections arrive,
  // if the URL carried ?detection=<id>. Never runs again after that to avoid
  // reviving the bidirectional-sync loop we just killed.
  useEffect(() => {
    if (didHydrateDetectionRef.current) return;
    if (!detectionParam) {
      // No URL detection to hydrate — mark done once the workspace has
      // started loading real data so we don't re-enter this branch on every
      // projectDetections refetch (e.g. after approve/reject).
      if (projectDetections.length || didHydrateProjectRef.current) {
        didHydrateDetectionRef.current = true;
      }
      return;
    }
    if (!projectDetections.length) return;
    const match = projectDetections.find(d => d._id === detectionParam);
    if (match) {
      setSelectedDetection(match);
      lastWrittenDetectionRef.current = detectionParam;
    }
    didHydrateDetectionRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetections]);

  // ─── Sync local state → URL ───────────────────────────────
  // These only WRITE to the URL, never read it back. Each effect guards with
  // a ref so an echo (our own write coming back through useSearchParams) is a
  // no-op.
  useEffect(() => {
    if (!didHydrateFromUrl.current) return;
    const nextId = selectedDetection?._id || null;
    if (nextId === lastWrittenDetectionRef.current) return;
    lastWrittenDetectionRef.current = nextId;
    setDetectionParam(nextId);
  }, [selectedDetection, setDetectionParam]);

  useEffect(() => {
    if (!didHydrateFromUrl.current) return;
    if (viewMode === lastWrittenViewRef.current) return;
    lastWrittenViewRef.current = viewMode;
    setViewParam(viewMode);
  }, [viewMode, setViewParam]);

  // ─── Review Actions ─────────────────────────────────────
  // Uses the useReviewDetection mutation which now performs optimistic
  // updates on BOTH the detection list and the assignments list, then only
  // targeted invalidation of the specific project's detection cache. No
  // more full refetches of assignments + detections per click — the UI
  // reflects the action instantly and rolls back on server error.
  const handleReviewDetection = useCallback(async (detectionId, status) => {
    const reviewerId = userData?._id || userData?.id || userId;
    if (!reviewerId) {
      showAlert('Unable to review: user session not loaded. Please refresh the page.', 'error');
      return;
    }
    setReviewingId(detectionId);
    try {
      await reviewMutation.mutateAsync({
        detectionId,
        reviewData: { qcStatus: status, qcReviewedBy: reviewerId, action: status },
        projectId: activeProjectId,
        qcStatusFilter: 'pending',
      });
      setSelectedDetection(null);
      showAlert(`Detection ${status} successfully`, 'success');
    } catch (err) {
      showAlert(err?.message || `Failed to ${status} detection`, 'error');
    } finally {
      setReviewingId(null);
    }
  }, [reviewMutation, userData, userId, activeProjectId, showAlert]);

  // ─── Bulk Review ───────────────────────────────────────
  const bulkReviewMutation = useBulkReviewDetections();
  const bulkUndoMutation = useBulkUndoReview();

  const toggleSelected = useCallback((detectionId, e) => {
    e?.stopPropagation?.();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(detectionId)) next.delete(detectionId);
      else next.add(detectionId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Clear selection whenever the active project changes — a different project
  // means a different detection set; old selection ids are meaningless.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeProjectId]);

  const handleBulkReview = useCallback(async (status) => {
    if (selectedIds.size === 0) return;
    const reviewerId = userData?._id || userData?.id || userId;
    if (!reviewerId) {
      showAlert('Unable to review: user session not loaded.', 'error');
      return;
    }
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const result = await bulkReviewMutation.mutateAsync({
        detectionIds: ids,
        qcStatus: status,
        qcReviewedBy: reviewerId,
        projectId: activeProjectId,
      });
      // Push an undo entry; cap stack at 5.
      setUndoStack((prev) => {
        const entry = {
          undoToken: result.undoToken,
          expiresAt: new Date(result.undoExpiresAt).getTime(),
          count: result.updated,
          action: status,
        };
        return [entry, ...prev].slice(0, 5);
      });
      clearSelection();
      setSelectedDetection(null);
      showAlert(`${result.updated} detection${result.updated === 1 ? '' : 's'} ${status}`, 'success');
    } catch (err) {
      showAlert(err?.message || 'Bulk review failed', 'error');
    } finally {
      setBulkBusy(false);
    }
  }, [selectedIds, userData, userId, bulkReviewMutation, activeProjectId, clearSelection, showAlert]);

  const handleUndo = useCallback(async (entry) => {
    const reviewerId = userData?._id || userData?.id || userId;
    if (!reviewerId) return;
    try {
      await bulkUndoMutation.mutateAsync({
        undoToken: entry.undoToken,
        qcReviewedBy: reviewerId,
        projectId: activeProjectId,
      });
      setUndoStack((prev) => prev.filter((e) => e.undoToken !== entry.undoToken));
      showAlert(`${entry.count} detection${entry.count === 1 ? '' : 's'} restored`, 'success');
    } catch (err) {
      showAlert(err?.message || 'Undo failed (window may have expired)', 'error');
      // Drop the entry either way — server says no.
      setUndoStack((prev) => prev.filter((e) => e.undoToken !== entry.undoToken));
    }
  }, [userData, userId, bulkUndoMutation, activeProjectId, showAlert]);

  const dismissUndo = useCallback((token) => {
    setUndoStack((prev) => prev.filter((e) => e.undoToken !== token));
  }, []);

  /** Show confirmation dialog before completing */
  const handleMarkCompleteClick = useCallback(() => {
    if (!activeProject) return;
    setShowCompleteDialog(true);
  }, [activeProject]);

  /** Actually mark the project review as complete, then offer report creation */
  const completingReview = completeMutation.isPending;
  const handleConfirmComplete = useCallback(async (createReport = false) => {
    if (!activeProject) return;
    const projectId = activeProject?.projectId?._id || activeProject?.projectId || activeProject?._id;
    if (!projectId) return;
    try {
      await completeMutation.mutateAsync(projectId);
      // The hook already invalidates the assignments cache; TanStack will
      // refetch in the background. No manual refetch needed.
      const projectName = (activeProject.projectId || activeProject)?.name || 'Project';
      setShowCompleteDialog(false);
      setActiveProject(null);
      setSelectedDetection(null);
      showAlert(`"${projectName}" review completed`, 'success');
      if (createReport) {
        router.push(`/qc-technician/reports?newReport=true&projectId=${projectId}`);
      }
    } catch (err) {
      showAlert(err?.message || 'Failed to mark project as complete', 'error');
    }
  }, [activeProject, completeMutation, showAlert, router]);

  const calculateProgress = (project) => {
    const total = project.totalDetections || 0;
    const reviewed = project.reviewedDetections || 0;
    if (total === 0) return 0;
    return Math.round((reviewed / total) * 100);
  };

  // ─── Manual detection ───────────────────────────────────
  // Triggered from the "+ Add" popover in the detection-queue header.
  // When in Video mode the anchor timestamp is the current video playback
  // time; otherwise it falls back to the currently selected detection's
  // timestamp (or 0). Requires a videoId — disabled if the project has no
  // uploaded video yet.
  const handleAddManualDetection = useCallback(async ({ type, severity, distance, notes, timestamp }) => {
    if (!activeProjectId) return;
    if (!videoId) {
      showAlert('Cannot add manual detection: this project has no video uploaded yet.', 'error');
      return;
    }
    const anchorTs = timestamp != null
      ? Number(timestamp)
      : (viewMode === 'video' ? videoCurrentTime : (selectedDetection?.timestamp ?? 0));
    const reviewerId = userData?._id || userData?.id || userId;
    const payload = {
      videoId,
      type: (type || '').trim(),
      severity,
      timestamp: Math.round(anchorTs),
      location: { distance: distance ? Number(distance) : undefined, description: notes || undefined },
      qcNotes: notes || undefined,
      qcTechnicianId: reviewerId,
    };
    try {
      // useCreateManualDetection already invalidates qcDetections for this
      // project in its onSuccess, so the useProjectDetections hook will
      // refetch on its own — no manual fetchProjectDetections call needed.
      const newDet = await createManualMutation.mutateAsync({ projectId: activeProjectId, payload });
      if (newDet) setSelectedDetection(newDet);
      setShowManualForm(false);
      showAlert('Manual detection added.', 'success');
    } catch (err) {
      showAlert(err?.message || 'Failed to add manual detection.', 'error');
    }
  }, [activeProjectId, videoId, viewMode, videoCurrentTime, selectedDetection, userData, userId, createManualMutation, showAlert]);

  // ─── Filtered Detections ────────────────────────────────
  const filteredDetections = useMemo(() => {
    let filtered = projectDetections;
    if (detectionSeverityFilter !== 'all') {
      filtered = filtered.filter(d => (d.severity || '').toLowerCase() === detectionSeverityFilter.toLowerCase());
    }
    if (detectionSearch.trim()) {
      const q = detectionSearch.toLowerCase();
      // NOTE: AIDetection has no `description` field — search real fields only:
      // type, qcNotes, location.description, pacpCode, annotations[].value.
      filtered = filtered.filter(d => {
        if ((d.type || '').toLowerCase().includes(q)) return true;
        if ((d.qcNotes || '').toLowerCase().includes(q)) return true;
        if ((d.severity || '').toLowerCase().includes(q)) return true;
        if ((d.location?.description || '').toLowerCase().includes(q)) return true;
        if ((d.location?.segment || '').toLowerCase().includes(q)) return true;
        if ((d.pacpCode || '').toLowerCase().includes(q)) return true;
        if (Array.isArray(d.annotations) && d.annotations.some(a => (a?.value || '').toLowerCase().includes(q))) return true;
        return false;
      });
    }
    return filtered;
  }, [projectDetections, detectionSearch, detectionSeverityFilter]);

  // Pending count across the entire project (not the filtered view) — used to
  // gate the "Complete Review" CTA so we don't let a tech close a project with
  // pending items hidden behind a filter.
  const projectPendingCount = useMemo(
    () => projectDetections.filter(d => d.qcStatus === 'pending').length,
    [projectDetections]
  );

  // ─── Keyboard Shortcuts ─────────────────────────────────
  // Vim-style J/K aliases for power users; F flags for second opinion (writes
  // qcStatus='needs_review'); ? opens the cheat-sheet dialog. Existing
  // A/R/Arrow/Esc behavior is unchanged.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      // ? toggles the shortcut help dialog regardless of selection state.
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsDialog((v) => !v);
        return;
      }
      if (!selectedDetection) {
        if ((e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') && filteredDetections.length > 0) {
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
      // F = flag for second opinion (peer review). Reuses the existing review
      // mutation with the model's `needs_review` enum value.
      if ((e.key === 'f' || e.key === 'F') && selectedDetection.qcStatus === 'pending') {
        e.preventDefault();
        handleReviewDetection(selectedDetection._id, 'needs_review');
      }
      if (e.key === 'Escape') { e.preventDefault(); setSelectedDetection(null); }
      // J/K aliases mirror ArrowDown/ArrowUp so the existing wrap-around logic
      // is reused as-is.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const idx = filteredDetections.findIndex(d => d._id === selectedDetection._id);
        if (idx === -1) return;
        const goUp = e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K';
        const next = goUp
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
      {/* Project Info drawer — floats above the workspace. Null when closed. */}
      <ProjectInfoDrawer
        open={showInfoDrawer}
        onClose={() => setShowInfoDrawer(false)}
        project={activeProject}
      />

      {/* Team chat — uses the layout-mounted ProjectChatBubble; this hook
          publishes the active detection so the bubble's composer can do
          detection-aware template auto-suggest. */}
      <QcChatBridge activeProjectId={activeProjectId} selectedDetection={selectedDetection} />

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
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl flex items-center justify-center shadow-sm shadow-amber-200">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Review Workspace</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>QC Technician</span>
                <ChevronRight className="w-3 h-3" />
                <span>Review</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
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
                <Target className="w-4 h-4 text-red-600" />
                Assignments
              </h2>
              <button onClick={() => refetchAssignments()} disabled={loading} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                <Input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 text-sm bg-gray-50" />
              </div>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val)}>
                <SelectTrigger className="w-full text-xs font-medium text-gray-600" size="sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>
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
                  className={`group p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${isActive ? 'border-red-600 bg-amber-50/50 shadow-sm' : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50 bg-white'}`}
                  onClick={() => handleProjectSelect(project)}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
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
                      <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-red-600'}`} style={{ width: `${progress}%` }} />
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
                  <div className="p-2 bg-amber-50 rounded-lg"><Building2 className="w-5 h-5 text-red-700" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{(activeProject.projectId || activeProject)?.name || 'Unnamed Project'}</h2>
                    <p className="text-xs text-gray-500">
                      ID: {(activeProject.projectId || activeProject)?._id?.slice(-8).toUpperCase()} &bull; {(activeProject.projectId || activeProject)?.client || 'Unknown Client'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* View mode toggle — Detail / Comparison / Video.
                      The third "Video" pill absorbs the old /project/[id] player. */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode('detail')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'detail' ? 'bg-amber-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <Eye className="w-3.5 h-3.5" />Detail
                    </button>
                    <button onClick={() => setViewMode('comparison')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-200 transition-colors ${viewMode === 'comparison' ? 'bg-amber-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <SplitSquareHorizontal className="w-3.5 h-3.5" />Comparison
                    </button>
                    <button onClick={() => setViewMode('video')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-200 transition-colors ${viewMode === 'video' ? 'bg-amber-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'}`}
                      title="Video player with detection seek">
                      <Film className="w-3.5 h-3.5" />Video
                    </button>
                  </div>
                  {/* Project info drawer trigger */}
                  <button
                    onClick={() => setShowInfoDrawer(v => !v)}
                    className={`p-2 rounded-lg border transition-colors ${showInfoDrawer ? 'bg-amber-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    title="Project info (device, operator, pipeline, due date…)"
                    aria-label="Project info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200" title="Shortcuts">
                    <Keyboard className="w-3.5 h-3.5 text-gray-400" />
                    <div className="text-[10px] text-gray-500 font-medium space-x-2">
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">A</kbd> Approve</span>
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">R</kbd> Reject</span>
                      <span><kbd className="font-sans border border-gray-300 rounded px-1 bg-white">Esc</kbd> Clear</span>
                    </div>
                  </div>
                  <button
                    onClick={handleMarkCompleteClick}
                    disabled={projectPendingCount > 0}
                    title={projectPendingCount > 0 ? `${projectPendingCount} detection${projectPendingCount === 1 ? '' : 's'} still pending review` : 'Mark this project review as complete'}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Review</span>
                    {projectPendingCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                        {projectPendingCount} pending
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* View Mode: Comparison */}
              {viewMode === 'comparison' ? (
                <ComparisonView
                  detections={filteredDetections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={setSelectedDetection}
                  onReview={handleReviewDetection}
                  reviewingId={reviewingId}
                />
              ) : (
              /* View Mode: Detail (original split view) */
              <div className="flex-1 flex overflow-hidden">
                {/* ── Detection Queue ── */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col min-h-0">
                  <div className="p-3 border-b border-gray-100 bg-gray-50/50 space-y-2 flex-none">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />Review Queue
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          {filteredDetections.filter(d => d.qcStatus === 'pending').length} remaining
                        </span>
                        {/* Manual-detection popover. Disabled until a project has an uploaded video. */}
                        <button
                          onClick={() => setShowManualForm(v => !v)}
                          disabled={!videoId}
                          title={videoId ? 'Add a manual detection at the current video time' : 'No video uploaded for this project'}
                          className="p-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Add manual detection"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {showManualForm && videoId && (
                      <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
                        <ManualForm
                          currentTime={viewMode === 'video' ? videoCurrentTime : (selectedDetection?.timestamp ?? 0)}
                          onSubmit={handleAddManualDetection}
                          onClose={() => setShowManualForm(false)}
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                        <Input type="text" placeholder="Search detections..." value={detectionSearch} onChange={(e) => setDetectionSearch(e.target.value)}
                          className="w-full pl-7 text-xs h-8" />
                      </div>
                      <Select value={detectionSeverityFilter} onValueChange={(val) => setDetectionSeverityFilter(val)}>
                        <SelectTrigger className="text-xs h-8 w-[100px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        {/* Values must match AIDetection.severity enum: low | medium | high | critical */}
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedIds.size > 0 && (
                    <div className="px-3 py-2 bg-purple-50 border-y border-purple-200 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-purple-900">
                        {selectedIds.size} selected
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBulkReview('approved')}
                          disabled={bulkBusy}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 disabled:opacity-50 transition-colors"
                        >
                          {bulkBusy ? '…' : 'Approve all'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBulkReview('rejected')}
                          disabled={bulkBusy}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 disabled:opacity-50 transition-colors"
                        >
                          {bulkBusy ? '…' : 'Reject all'}
                        </button>
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-purple-100 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-50/30">
                    {detectionLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
                    ) : filteredDetections.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        {projectDetections.length === 0 ? (
                          // Project genuinely has no AI detections yet
                          <>
                            <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-500">No AI detections on this project yet</p>
                            <p className="text-xs mt-1">Run AI processing on an uploaded video to generate detections.</p>
                          </>
                        ) : projectPendingCount === 0 ? (
                          // All detections reviewed
                          <>
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-gray-700 font-medium">All caught up!</p>
                            <p className="text-xs mt-1">Every detection has been reviewed — you can complete this project.</p>
                          </>
                        ) : (
                          // Search/filter mismatch — pending items exist but filtered out
                          <>
                            <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No matching detections</p>
                            <p className="text-xs mt-1">Try adjusting your search or filter</p>
                          </>
                        )}
                      </div>
                    ) : filteredDetections.map(detection => {
                      const conf = normalizeConfidence(detection.confidence);
                      const isSelected = selectedDetection?._id === detection._id;
                      const isChecked = selectedIds.has(detection._id);
                      return (
                        <div key={detection._id} id={`detection-${detection._id}`} onClick={() => setSelectedDetection(detection)}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-white border-red-600 ring-1 ring-red-600 shadow-md transform scale-[1.02] z-10' : isChecked ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'} ${detection.qcStatus === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {detection.qcStatus === 'pending' && (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => toggleSelected(detection._id, e)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-3.5 h-3.5 accent-purple-600 cursor-pointer"
                                  aria-label="Select for bulk review"
                                />
                              )}
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
                          {detection.qcStatus === 'needs_review' ? (
                            <div className="text-xs font-medium flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>
                                Flagged for second opinion
                                {detection.peerReviewRequestedBy && (
                                  <span className="font-normal text-amber-600">
                                    {' by '}
                                    {[detection.peerReviewRequestedBy.first_name, detection.peerReviewRequestedBy.last_name]
                                      .filter(Boolean).join(' ').trim() || detection.peerReviewRequestedBy.username || 'a teammate'}
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : detection.qcStatus !== 'pending' ? (
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

                {/* ── Right Panel: Video player (video mode) OR Detection Detail Card ── */}
                <div className="w-2/3 bg-gray-50 flex flex-col overflow-y-auto relative">
                  <div className="absolute inset-0 z-0 bg-gray-100 pattern-grid-lg opacity-50" />

                  {viewMode === 'video' ? (
                    <div className="p-5 z-10 relative">
                      <VideoPane
                        videoUrl={videoUrl}
                        selectedDetection={selectedDetection}
                        onTimeChange={setVideoCurrentTime}
                        onRetry={() => refetchProjectVideos && refetchProjectVideos()}
                      />
                      {/* Mini approve/reject strip under the video, so the tech doesn't
                          have to switch to Detail mode to act on the current detection. */}
                      {selectedDetection && selectedDetection.qcStatus === 'pending' && (
                        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current detection</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {selectedDetection.type || 'Detection'} · Frame #{selectedDetection.frameNumber != null ? selectedDetection.frameNumber : '—'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleReviewDetection(selectedDetection._id, 'approved')}
                            disabled={reviewingId === selectedDetection._id}
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {reviewingId === selectedDetection._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewDetection(selectedDetection._id, 'rejected')}
                            disabled={reviewingId === selectedDetection._id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {reviewingId === selectedDetection._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                        </div>
                      )}
                      {!selectedDetection && (
                        <div className="mt-4 text-center text-sm text-gray-400">
                          Click a detection in the queue to jump to its frame.
                        </div>
                      )}
                    </div>
                  ) : selectedDetection ? (() => {
                    const conf = normalizeConfidence(selectedDetection.confidence);
                    return (
                      <div className="p-6 flex items-start justify-center z-10 relative min-h-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-2xl animate-in zoom-in-95 duration-200">
                          {/* Card Header — AIDetection has no `description` field; subtitle shows
                              the source video filename when available (populated from videoId). */}
                          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                  {selectedDetection.type || 'Unknown Detection'}
                                  <span className="text-xs font-normal text-gray-400 px-2 py-0.5 border border-gray-200 rounded-full bg-white">
                                    {selectedDetection._id.slice(-6).toUpperCase()}
                                  </span>
                                </h3>
                                {selectedDetection.videoId?.originalName && (
                                  <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                                    <Camera className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{selectedDetection.videoId.originalName}</span>
                                  </p>
                                )}
                              </div>
                              <span className={`shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-bold border ${getConfidenceColor(conf)}`}>
                                {Math.round(conf)}% Confidence
                              </span>
                            </div>
                          </div>

                          {/* Stats Row — null-safe. `frameNumber` and `location.distance`
                              are both optional on the schema; use `!= null` so legitimate
                              zero values ("frame #0", "0m distance") render correctly
                              instead of falling into the placeholder branch. */}
                          <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Play className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Time</span></div>
                              <p className="text-sm font-bold text-gray-900">{selectedDetection.timestamp != null ? formatTimestamp(selectedDetection.timestamp) : '—'}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Frame</span></div>
                              <p className="text-sm font-bold text-gray-900">{selectedDetection.frameNumber != null ? `#${selectedDetection.frameNumber}` : '—'}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Ruler className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span></div>
                              <p className="text-sm font-bold text-gray-900">{selectedDetection.location?.distance != null ? `${selectedDetection.location.distance}m` : '—'}</p>
                            </div>
                            <div className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><AlertTriangle className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Severity</span></div>
                              <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold capitalize ${getSeverityStyle(selectedDetection.severity)}`}>
                                {selectedDetection.severity || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Detail Body */}
                          <div className="p-5 space-y-4">
                            {/* Snapshot Image */}
                            {selectedDetection.images?.[0]?.url && (
                              <div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Detection Snapshot</span>
                                <div className="relative group">
                                  <img
                                    src={`${BACKEND_URL}/api/videos/snapshot/${selectedDetection.images[0].url}`}
                                    alt={`Detection - ${selectedDetection.type}`}
                                    className="w-full h-56 object-cover rounded-lg border border-gray-200 cursor-pointer"
                                    onClick={() => window.open(`${BACKEND_URL}/api/videos/snapshot/${selectedDetection.images[0].url}`, '_blank')}
                                    loading="lazy"
                                  />
                                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                                    <Camera className="h-3 w-3" /> {selectedDetection.frameNumber != null ? `Frame #${selectedDetection.frameNumber}` : 'Snapshot'}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Analysis Notes — synthesized from AI fields + any reviewer notes */}
                            {(() => {
                              const d = selectedDetection;
                              const confPct = Math.round(normalizeConfidence(d.confidence));
                              const confLabel =
                                confPct >= 90 ? 'very high'
                                : confPct >= 75 ? 'high'
                                : confPct >= 50 ? 'moderate'
                                : confPct >= 30 ? 'low' : 'very low';
                              const sev = (d.severity || '').toString();
                              const typeLabel = d.type || 'defect';
                              const frameN = d.frameNumber ?? 'N/A';
                              const ts = d.timestamp != null ? formatTimestamp(d.timestamp) : null;
                              const bb = d.boundingBox;
                              const hasBBox = bb && (bb.width || bb.height);
                              const aiSummary = [
                                `AI classified this as ${typeLabel} with ${confPct}% (${confLabel}) confidence.`,
                                sev && `Severity has been rated ${sev}.`,
                                frameN !== 'N/A' && `Captured on frame #${frameN}${ts ? ` at ${ts}` : ''}.`,
                                hasBBox && `Bounding box covers ~${Math.round((bb.width || 0) * 100)}% × ${Math.round((bb.height || 0) * 100)}% of the frame.`,
                                d.aiModelVersion && `Analyzed by model ${d.aiModelVersion}.`,
                                d.pacpCode && `Matched PACP code ${d.pacpCode}${d.pacpScore != null ? ` (score ${d.pacpScore})` : ''}.`,
                              ].filter(Boolean).join(' ');

                              return (
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Analysis Notes</span>
                                  <div className="bg-amber-50 text-amber-900 p-3 rounded-lg text-sm leading-relaxed border border-amber-100 space-y-2">
                                    <p>{aiSummary}</p>
                                    {Array.isArray(d.annotations) && d.annotations.length > 0 && (
                                      <div className="pt-2 border-t border-amber-200/60">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/80 mb-1">AI Annotations</p>
                                        <ul className="space-y-0.5">
                                          {d.annotations.map((a, i) => (
                                            <li key={i} className="text-[12px] text-amber-900/90">
                                              <span className="font-semibold">{a.type || 'note'}:</span> {a.value || '—'}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {d.qcNotes && (
                                      <div className="pt-2 border-t border-amber-200/60">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/80 mb-1">Reviewer Notes</p>
                                        <p className="text-[12px] text-amber-900/90 whitespace-pre-wrap">{d.qcNotes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Provenance — where this detection came from and who/what touched it.
                                Every row is conditional so missing fields don't render. Reviewer name
                                and video filename require the backend populates in getProjectDetections. */}
                            {(() => {
                              const d = selectedDetection;
                              const video = d.videoId && typeof d.videoId === 'object' ? d.videoId : null;
                              const reviewer = d.qcReviewedBy && typeof d.qcReviewedBy === 'object' ? d.qcReviewedBy : null;
                              const reviewerName = reviewer
                                ? [reviewer.first_name, reviewer.last_name].filter(Boolean).join(' ') || reviewer.email
                                : null;
                              const detectedAt = d.detectedAt ? new Date(d.detectedAt) : null;
                              const reviewedAt = d.qcReviewedAt ? new Date(d.qcReviewedAt) : null;
                              const rows = [
                                video?.originalName && { label: 'Source video', value: video.originalName },
                                video?.duration != null && { label: 'Video length', value: `${Math.round(video.duration)}s` },
                                detectedAt && { label: 'Detected at', value: detectedAt.toLocaleString() },
                                d.aiModelVersion && { label: 'AI model', value: d.aiModelVersion },
                                reviewerName && { label: 'Reviewed by', value: reviewerName },
                                reviewedAt && { label: 'Reviewed at', value: reviewedAt.toLocaleString() },
                                d.qcConfidence != null && { label: 'Reviewer confidence', value: `${Math.round(d.qcConfidence)}%` },
                              ].filter(Boolean);
                              if (rows.length === 0) return null;
                              return (
                                <div>
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Provenance</span>
                                  <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
                                    {rows.map((r, i) => (
                                      <div key={i} className="flex items-start justify-between gap-2">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5 shrink-0">{r.label}</span>
                                        <span className="text-xs font-medium text-gray-800 text-right truncate" title={r.value}>{r.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Location & Status */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Location</span>
                                {(() => {
                                  const loc = selectedDetection.location || {};
                                  const bb = selectedDetection.boundingBox;
                                  const hasBBox = bb && (bb.width || bb.height);
                                  const projectName = activeProject?.projectId?.name || activeProject?.name;
                                  const rows = [
                                    projectName && { label: 'Project', value: projectName },
                                    loc.segment && { label: 'Segment', value: loc.segment },
                                    loc.distance != null && { label: 'Distance', value: `${loc.distance}m` },
                                    loc.description && { label: 'Description', value: loc.description },
                                    hasBBox && {
                                      label: 'In-frame',
                                      value: `x:${Math.round((bb.x || 0) * 100)}% y:${Math.round((bb.y || 0) * 100)}%`,
                                    },
                                  ].filter(Boolean);
                                  if (rows.length === 0) {
                                    return (
                                      <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-sm text-gray-400 italic">
                                        No location metadata recorded
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-sm text-gray-700 space-y-1">
                                      {rows.map((r, i) => (
                                        <div key={i} className="flex items-start justify-between gap-2">
                                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">{r.label}</span>
                                          <span className="text-xs font-medium text-gray-800 text-right">{r.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
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
                                  <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-mono font-bold">{selectedDetection.pacpCode}</span>
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
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-amber-50 rounded-full animate-ping opacity-20" />
                  <Zap className="h-12 w-12 text-red-600" />
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

      <KeyboardShortcutsDialog open={showShortcutsDialog} onOpenChange={setShowShortcutsDialog} />

      {undoStack[0] && (
        <BulkUndoToast
          entry={undoStack[0]}
          onUndo={handleUndo}
          onDismiss={dismissUndo}
          busy={bulkUndoMutation.isPending}
        />
      )}
    </div>
  );
};

// Bridge component — keeps the project-chat launcher (mounted at the layout
// level) in sync with the QC workspace's selected project + detection. Hooks
// must be called from inside a child component to keep the parent render
// dependency graph clean.
function QcChatBridge({ activeProjectId, selectedDetection }) {
  const launcher = useProjectChatLauncher();
  useEffect(() => {
    launcher.setActiveDetection?.(selectedDetection || null);
  }, [selectedDetection]); // eslint-disable-line react-hooks/exhaustive-deps
  // When the QC tech opens a project for review, also surface its chat in
  // the bubble — but do NOT auto-open the sheet; just stage it so a click on
  // the bubble lands the user inside the right thread.
  useEffect(() => {
    if (activeProjectId && !launcher.isOpen) {
      launcher.setSelectedProjectId?.(activeProjectId);
    }
  }, [activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Wrap in Suspense because useWorkspaceUrlState calls useSearchParams(),
// which Next.js App Router requires to be inside a Suspense boundary.
export default function QualityControlPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    }>
      <QualityControlPage />
    </Suspense>
  );
}
