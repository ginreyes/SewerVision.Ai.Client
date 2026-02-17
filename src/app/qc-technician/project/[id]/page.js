'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, Play, Pause, CheckCircle, XCircle,
    MapPin, Building2, Ruler, Calendar, Maximize, Maximize2, Minimize2, Loader2,
    CheckSquare, FileVideo, Target, RefreshCw, ChevronDown, ChevronUp,
    Rewind, SkipBack, SkipForward, FastForward, Plus, X, Monitor
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAlert } from '@/components/providers/AlertProvider';
import {
    useProject,
    useProjectVideos,
    useProjectDetections,
    useReviewDetection,
    useCreateManualDetection,
    useCompleteQCAssignment,
} from '@/hooks/useQueryHooks';

const SAMPLE_VIDEO = "https://cdn.pixabay.com/video/2024/02/09/199958-911694865_large.mp4";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const fmtTime = (s) => {
    if (!s || isNaN(s)) return '00:00';
    return new Date(s * 1000).toISOString().substr(14, 5);
};

// Full time for project console (matches admin/user/operator)
const formatTime = (s) => {
    if (!s || isNaN(s)) return '00:00:00';
    return new Date(s * 1000).toISOString().substr(11, 8);
};

// ─── Compact Detection Row ──────────────────────────────────────
const DetectionRow = ({ detection, isSelected, onClick, onApprove, onReject }) => {
    const confidence = Math.round((detection.confidence || 0) * 100);
    const st = detection.qcStatus;

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm leading-snug
                ${isSelected
                    ? 'bg-rose-50 ring-1 ring-rose-300'
                    : 'hover:bg-gray-100'
                }`}
        >
            {/* Status dot */}
            <div className={`w-1.5 h-1.5 rounded-full shrink-0
                ${st === 'approved' ? 'bg-green-500' : st === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`}
            />

            {/* Type */}
            <span className="font-medium text-gray-900 truncate min-w-0 flex-1">
                {detection.type || 'Anomaly'}
            </span>

            {/* Confidence bar — tiny inline */}
            <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${confidence}%` }}
                    />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{confidence}%</span>
            </div>

            {/* Timecode */}
            <span className="text-xs font-mono text-gray-500 shrink-0 tabular-nums">
                {detection.timeCode || fmtTime(detection.timestamp)}
            </span>

            {/* Inline quick actions when selected */}
            {isSelected && (
                <div className="flex gap-0.5 shrink-0 ml-1 animate-in fade-in duration-150">
                    <button
                        onClick={(e) => { e.stopPropagation(); onApprove(detection); }}
                        className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Approve"
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onReject(detection); }}
                        className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Reject"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Manual Detection Form (project-detail style, larger text) ───
const ManualForm = ({ currentTime, onSubmit, onClose }) => {
    const [type, setType] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [distance, setDistance] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ type, severity, distance, notes, timestamp: currentTime });
        setType(''); setSeverity('medium'); setDistance(''); setNotes('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-b border-rose-100 bg-white/60 rounded-lg space-y-3 text-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Add manual detection</span>
                <button type="button" onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-rose-100 transition-colors" aria-label="Close">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Crack, Defect, Root intrusion"
                    autoFocus
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Distance (m)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="—"
                        step="0.1"
                        min="0"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details..."
                />
            </div>
            <div className="flex items-center gap-2 pt-1">
                <Button type="submit" disabled={!type.trim()} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4">
                    Add detection
                </Button>
                <span className="text-xs text-gray-500">At {fmtTime(currentTime)}</span>
            </div>
        </form>
    );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN CONSOLE
// ═══════════════════════════════════════════════════════════════════
const ProjectConsolePage = () => {
    const router = useRouter();
    const params = useParams();
    const { id: projectId } = params;
    const { userData } = useUser();
    const { showAlert } = useAlert();

    // TanStack Query
    const { data: projectData, isLoading: projectLoading, refetch: refetchProject } = useProject(projectId);
    const { data: videosData = [], isLoading: videosLoading, refetch: refetchVideos } = useProjectVideos(projectId);
    const { data: detectionsData = [], isLoading: detectionsLoading, refetch: refetchDetections } = useProjectDetections(projectId, 'all');
    const reviewMutation = useReviewDetection();
    const createManualMutation = useCreateManualDetection();
    const completeMutation = useCompleteQCAssignment();

    const project = projectData ?? null;
    const detections = Array.isArray(detectionsData) ? detectionsData : [];

    const [selectedDetection, setSelectedDetection] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [usingFallbackVideo, setUsingFallbackVideo] = useState(false);
    const [videoLoadFailed, setVideoLoadFailed] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [detectionFilter, setDetectionFilter] = useState('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(true);

    const videoRef = useRef(null);
    const videoContainerRef = useRef(null);

    const constructVideoUrl = (vid) => `${BACKEND_URL}/api/videos/${vid}`;

    // Derive video URL and ID from project videos (or project fallback)
    const { videoUrl, videoId } = useMemo(() => {
        const videos = Array.isArray(videosData) ? videosData : [];
        const latest = videos[0];
        if (latest?._id) {
            return { videoUrl: constructVideoUrl(latest._id), videoId: latest._id };
        }
        if (project?.videoUrl && typeof project.videoUrl === 'string') {
            const url = project.videoUrl.startsWith('http') ? project.videoUrl : `${BACKEND_URL}${project.videoUrl.startsWith('/') ? '' : '/'}${project.videoUrl}`;
            return { videoUrl: url, videoId: null };
        }
        return { videoUrl: null, videoId: null };
    }, [videosData, project?.videoUrl]);

    const loading = projectLoading || videosLoading || detectionsLoading;

    // Set initial selected detection when detections first load (once)
    const hasSetInitialDetection = useRef(false);
    useEffect(() => {
        if (detections.length > 0 && !hasSetInitialDetection.current) {
            hasSetInitialDetection.current = true;
            const firstPending = detections.find((d) => d.qcStatus === 'pending' || !d.qcStatus) || detections[0];
            setSelectedDetection(firstPending);
        }
    }, [detections]);

    const handleRetry = () => {
        setUsingFallbackVideo(false);
        setVideoLoadFailed(false);
        refetchProject();
        refetchVideos();
        refetchDetections();
    };

    // ─── Stats ───────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: detections.length,
        pending: detections.filter(d => d.qcStatus === 'pending' || !d.qcStatus).length,
        approved: detections.filter(d => d.qcStatus === 'approved').length,
        rejected: detections.filter(d => d.qcStatus === 'rejected').length,
    }), [detections]);

    const filteredDetections = useMemo(() => {
        if (detectionFilter === 'all') return detections;
        return detections.filter(d => {
            if (detectionFilter === 'pending') return d.qcStatus === 'pending' || !d.qcStatus;
            return d.qcStatus === detectionFilter;
        });
    }, [detections, detectionFilter]);

    const progressPct = stats.total > 0 ? Math.round(((stats.approved + stats.rejected) / stats.total) * 100) : 0;

    // ─── Status-based gradient colors (match admin/user/operator style) ─────
    const statusGradient = useMemo(() => {
        const status = project?.status?.toLowerCase() || '';

        const gradients = {
            'planning': {
                banner: 'from-blue-50 via-indigo-50 to-blue-50',
                bannerBorder: 'border-blue-200',
                text: 'text-blue-600',
                textGradient: 'from-blue-600 to-indigo-600',
                progressBg: 'from-blue-500 via-blue-600 to-indigo-600',
            },
            'in-progress': {
                banner: 'from-emerald-50 via-green-50 to-emerald-50',
                bannerBorder: 'border-emerald-200',
                text: 'text-emerald-600',
                textGradient: 'from-emerald-600 to-teal-600',
                progressBg: 'from-emerald-500 via-green-500 to-teal-600',
            },
            'ai-processing': {
                banner: 'from-violet-50 via-purple-50 to-violet-50',
                bannerBorder: 'border-violet-200',
                text: 'text-violet-600',
                textGradient: 'from-violet-600 to-fuchsia-600',
                progressBg: 'from-violet-500 via-purple-500 to-fuchsia-600',
            },
            'completed': {
                banner: 'from-amber-50 via-yellow-50 to-amber-50',
                bannerBorder: 'border-amber-200',
                text: 'text-amber-600',
                textGradient: 'from-amber-600 to-orange-600',
                progressBg: 'from-amber-500 via-yellow-500 to-orange-500',
            },
            'on-hold': {
                banner: 'from-slate-50 via-gray-50 to-slate-50',
                bannerBorder: 'border-slate-200',
                text: 'text-slate-600',
                textGradient: 'from-slate-600 to-zinc-600',
                progressBg: 'from-slate-500 via-gray-500 to-zinc-600',
            },
            'review': {
                banner: 'from-cyan-50 via-sky-50 to-cyan-50',
                bannerBorder: 'border-cyan-200',
                text: 'text-cyan-600',
                textGradient: 'from-cyan-600 to-blue-600',
                progressBg: 'from-cyan-500 via-sky-500 to-blue-500',
            },
            'default': {
                banner: 'from-rose-50 via-pink-50 to-rose-50',
                bannerBorder: 'border-rose-200',
                text: 'text-rose-600',
                textGradient: 'from-rose-600 to-pink-600',
                progressBg: 'from-rose-500 via-pink-500 to-red-500',
            },
        };

        return gradients[status] || gradients['default'];
    }, [project?.status]);

    // ─── Actions ─────────────────────────────────────────────────
    const handleReview = async (detection, status) => {
        const userId = userData?._id || userData?.id;
        try {
            await reviewMutation.mutateAsync({
                detectionId: detection._id,
                reviewData: { qcStatus: status, qcReviewedBy: userId, action: status },
            });
            const { data: newList } = await refetchDetections();
            const nextPending = (Array.isArray(newList) ? newList : []).find(d => d.qcStatus === 'pending' || !d.qcStatus);
            setSelectedDetection(nextPending ?? (Array.isArray(newList) ? newList[0] : null) ?? null);
        } catch (error) {
            console.error("Review failed:", error);
            showAlert("Failed to update status", "error");
        }
    };

    const handleAddManualDetection = async ({ type, severity, distance, notes, timestamp }) => {
        if (!type.trim() || !videoId) return;
        const userId = userData?._id || userData?.id;
        const payload = {
            videoId,
            type: type.trim(),
            severity,
            timestamp,
            location: { distance: distance ? Number(distance) : undefined, description: notes || undefined },
            qcNotes: notes || undefined,
            qcTechnicianId: userId,
        };
        try {
            const newDet = await createManualMutation.mutateAsync({ projectId, payload });
            if (newDet) setSelectedDetection(newDet);
            setShowManualForm(false);
            showAlert('Detection added.', 'success');
        } catch (err) {
            showAlert(err?.message || 'Failed to add detection.', 'error');
        }
    };

    const handleCompleteProject = async () => {
        if (!projectId) return;
        try {
            await completeMutation.mutateAsync(projectId);
            showAlert("Project marked as complete", "success");
            router.push('/qc-technician/project');
        } catch (err) {
            console.error(err);
            showAlert(err?.message || "Failed to complete project", "error");
        }
    };

    // ─── Video controls ──────────────────────────────────────────
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused || videoRef.current.ended) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const displayVideoUrl = videoLoadFailed ? null : (usingFallbackVideo ? SAMPLE_VIDEO : videoUrl);

    const handleVideoError = () => {
        if (!usingFallbackVideo) {
            setUsingFallbackVideo(true);
            showAlert("Original video unavailable. Loaded test signal.", "warning");
        } else {
            setVideoLoadFailed(true);
        }
    };

    const handleSeek = (value) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    // Seek by clicking progress bar (matches admin project detail)
    const onSeekClick = (e) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        const newTime = pct * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return;
        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const onFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // ─── Keyboard shortcuts ──────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'a':
                case 'A':
                    if (selectedDetection && selectedDetection.qcStatus === 'pending') {
                        handleReview(selectedDetection, 'approved');
                    }
                    break;
                case 'r':
                case 'R':
                    if (selectedDetection && selectedDetection.qcStatus === 'pending') {
                        handleReview(selectedDetection, 'rejected');
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (filteredDetections.length) {
                        const idx = filteredDetections.findIndex(d => d._id === selectedDetection?._id);
                        const next = filteredDetections[(idx + 1) % filteredDetections.length];
                        setSelectedDetection(next);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (filteredDetections.length) {
                        const idx = filteredDetections.findIndex(d => d._id === selectedDetection?._id);
                        const prev = filteredDetections[(idx - 1 + filteredDetections.length) % filteredDetections.length];
                        setSelectedDetection(prev);
                    }
                    break;
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedDetection, filteredDetections, isPlaying]);

    // ─── Loading ─────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    const statusLabel = project?.status
        ? project.status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'In Progress';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Enhanced Header — exact project detail layout */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 px-6 py-4 mb-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/qc-technician/project')}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="text-sm font-medium">Back to Projects</span>
                            </button>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex items-center space-x-3">
                                <h1 className="text-lg font-bold text-gray-900">Project Console</h1>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-700">{project?.name || 'Untitled Project'}</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${project?.status === 'ai-processing'
                                    ? 'bg-violet-100 text-violet-700'
                                    : project?.status === 'completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : project?.status === 'on-hold'
                                            ? 'bg-slate-100 text-slate-700'
                                            : project?.status === 'planning'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {project?.status?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'In Progress'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span>QC Progress</span>
                                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <span className="font-semibold text-gray-700 tabular-nums">{progressPct}%</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">{stats.pending} pending · {stats.approved} approved · {stats.rejected} rejected</div>
                            </div>
                            <Button
                                onClick={handleCompleteProject}
                                disabled={stats.pending > 0}
                                size="sm"
                                className={stats.pending === 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            >
                                <CheckSquare className="h-4 w-4 mr-1.5" />
                                Mark QC Complete
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Main Content — same structure as project detail */}
                    <div className="flex-1">
                        {/* Project Info Banner — exact match */}
                        {project && (
                            <div className={`border rounded-2xl p-6 mb-6 transition-all duration-300 shadow-sm backdrop-blur-sm bg-gradient-to-r ${statusGradient.banner} ${statusGradient.bannerBorder}`}>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                                            <Badge variant="outline" className={`${statusGradient.text} border-current`}>
                                                {project.status?.replace('-', ' ').toUpperCase() || 'ACTIVE'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">{project.location || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">{project.client || '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                <Ruler className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">{project.totalLength || '—'}</span>
                                            </div>
                                            {(project.estimatedCompletion || project.estimated_completion) && (
                                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                                                    <Calendar className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-medium text-amber-700">Due: {new Date(project.estimatedCompletion || project.estimated_completion).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                                                <Monitor className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">Device: {project.assignedDevice?.name || (project.assignedDevice ? '—' : 'Not set')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <div className="text-sm text-gray-500 font-medium">Progress</div>
                                        <div className={`text-2xl font-bold bg-gradient-to-r ${statusGradient.textGradient} bg-clip-text text-transparent`}>
                                            {project.progress ?? 0}%
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">QC: {stats.approved + stats.rejected} / {stats.total} reviewed</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Video Player Container — exact project detail */}
                        <div
                            ref={videoContainerRef}
                            className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden flex flex-col shadow-xl border border-gray-800/50"
                        >
                            {displayVideoUrl ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        src={displayVideoUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                                        onError={handleVideoError}
                                        onEnded={() => setIsPlaying(false)}
                                        playsInline
                                        crossOrigin="anonymous"
                                        controls={false}
                                    />
                                    {usingFallbackVideo && (
                                        <div className="absolute top-3 right-3 bg-orange-500/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Test Signal</div>
                                    )}
                                    {selectedDetection && (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <div className="border border-yellow-400/80 bg-yellow-400/10 w-40 h-40 rounded relative shadow-[0_0_12px_rgba(250,204,21,0.25)]">
                                                <div className="absolute -top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">{selectedDetection.type}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 cursor-pointer z-10" onClick={togglePlay} aria-hidden="true">
                                        {!isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                                                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center space-x-4 bg-black/50 py-2 rounded z-20" onClick={(e) => e.stopPropagation()}>
                                        <button type="button" onClick={togglePlay} className="text-white hover:text-rose-300 transition-colors">
                                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                        </button>
                                        <div
                                            className="flex-1 h-1 bg-gray-600 rounded cursor-pointer"
                                            onClick={onSeekClick}
                                            style={{ position: 'relative' }}
                                        >
                                            <div className="h-1 bg-rose-500 rounded" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                                        </div>
                                        <div className="text-white text-sm font-mono tabular-nums">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </div>
                                        <button type="button" onClick={toggleFullscreen} className="text-white hover:text-rose-300 transition-colors">
                                            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-white text-lg font-semibold flex flex-col items-center justify-center h-full gap-2">
                                    <FileVideo className="w-12 h-12 text-gray-400" />
                                    <span>No video available</span>
                                    <button onClick={handleRetry} className="text-sm text-rose-300 hover:text-rose-200 flex items-center gap-1.5 mt-1">
                                        <RefreshCw className="w-4 h-4" /> Retry
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress bar (project progress) — exact project detail strip */}
                        <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-gray-700">{formatTime(currentTime)}</div>
                                <div className="flex items-center space-x-2">
                                    <button type="button" className="p-1 hover:bg-gray-100 rounded" aria-label="Rewind"><Rewind className="h-4 w-4" /></button>
                                    <button type="button" className="p-1 hover:bg-gray-100 rounded" aria-label="Skip back"><SkipBack className="h-4 w-4" /></button>
                                    <button type="button" onClick={togglePlay} className="p-1 hover:bg-gray-100 rounded">
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </button>
                                    <button type="button" className="p-1 hover:bg-gray-100 rounded" aria-label="Skip forward"><SkipForward className="h-4 w-4" /></button>
                                    <button type="button" className="p-1 hover:bg-gray-100 rounded" aria-label="Fast forward"><FastForward className="h-4 w-4" /></button>
                                    <span className="text-sm text-gray-500 mx-2">2X</span>
                                    <button type="button" onClick={toggleFullscreen} className="p-1 hover:bg-gray-100 rounded" aria-label="Fullscreen">
                                        <Maximize className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar — exact project detail style */}
                    <div className="w-80 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 space-y-5 shadow-sm h-fit">
                        <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 rounded-xl p-5 border border-rose-100/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-base text-gray-900">DETECTIONS</span>
                                    <Badge variant="secondary" className="text-sm bg-rose-100 text-rose-700 px-2">{filteredDetections.length}</Badge>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-rose-100 rounded-lg"
                                    onClick={() => setShowManualForm((v) => !v)}
                                    disabled={!videoId}
                                    title="Add manual detection"
                                >
                                    <Plus className="h-5 w-5 text-rose-600" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['all', 'pending', 'approved', 'rejected'].map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setDetectionFilter(key)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${detectionFilter === key ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-white/80'}`}
                                    >
                                        {key.charAt(0).toUpperCase() + key.slice(1)} {key === 'all' ? stats.total : key === 'pending' ? stats.pending : key === 'approved' ? stats.approved : stats.rejected}
                                    </button>
                                ))}
                            </div>
                            {showManualForm && (
                                <ManualForm currentTime={currentTime} onSubmit={handleAddManualDetection} onClose={() => setShowManualForm(false)} />
                            )}
                            <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                                {filteredDetections.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-base">No detections found</div>
                                ) : (
                                    filteredDetections.map((det) => (
                                        <DetectionRow
                                            key={det._id}
                                            detection={det}
                                            isSelected={selectedDetection?._id === det._id}
                                            onClick={() => setSelectedDetection(det)}
                                            onApprove={(d) => handleReview(d, 'approved')}
                                            onReject={(d) => handleReview(d, 'rejected')}
                                        />
                                    ))
                                )}
                            </div>
                            {selectedDetection && (
                                <div className="mt-4 pt-3 border-t border-rose-100/50">
                                    <button onClick={() => setDetailOpen((v) => !v)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-800 mb-2">
                                        <span>Details</span>
                                        {detailOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                    </button>
                                    {detailOpen && (
                                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                                            <span className="text-gray-500">Type</span>
                                            <span className="font-medium text-gray-900 text-right">{selectedDetection.type}</span>
                                            <span className="text-gray-500">Confidence</span>
                                            <span className="font-medium text-gray-900 text-right">{Math.round((selectedDetection.confidence || 0) * 100)}%</span>
                                            <span className="text-gray-500">Distance</span>
                                            <span className="font-medium text-gray-900 text-right">{selectedDetection.location?.distance ?? '—'} m</span>
                                            <span className="text-gray-500">Time</span>
                                            <span className="font-mono text-gray-900 text-right">{fmtTime(selectedDetection.timestamp)}</span>
                                            {selectedDetection.severity && (
                                                <>
                                                    <span className="text-gray-500">Severity</span>
                                                    <span className={`text-right font-medium capitalize ${selectedDetection.severity === 'critical' ? 'text-red-600' : selectedDetection.severity === 'high' ? 'text-orange-600' : 'text-amber-600'}`}>{selectedDetection.severity}</span>
                                                </>
                                            )}
                                            <div className="col-span-2 mt-3">
                                                <button onClick={() => setSelectedDetection(null)} className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-medium">Deselect</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectConsolePage;