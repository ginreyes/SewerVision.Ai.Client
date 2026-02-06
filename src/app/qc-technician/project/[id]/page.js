'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Play,
    Pause,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Settings,
    MapPin,
    Calendar,
    Maximize2,
    Loader2,
    CheckSquare,
    Video,
    Target,
    RefreshCw
} from 'lucide-react';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useAlert } from '@/components/providers/AlertProvider';

// --- Sample Video for Fallback (Dev Mode) ---
const SAMPLE_VIDEO = "https://cdn.pixabay.com/video/2024/02/09/199958-911694865_large.mp4"; // Generic tunnel/pipe-like abstract background video for demo
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const DetectionItem = ({ detection, isSelected, onClick, onApprove, onReject }) => {
    const confidence = Math.round((detection.confidence || 0) * 100);

    return (
        <div
            onClick={onClick}
            className={`p-2.5 rounded-lg cursor-pointer border transition-all hover:shadow-sm mb-2 ${isSelected
                ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-200'
                : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                }`}
        >
            <div className="flex items-center gap-2.5 mb-1.5">
                <div className={`p-1.5 rounded-md ${detection.qcStatus === 'approved' ? 'bg-green-100 text-green-600' :
                    detection.qcStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                    }`}>
                    {detection.qcStatus === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> :
                        detection.qcStatus === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                            <AlertTriangle className="w-3.5 h-3.5" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-gray-900 text-xs truncate">{detection.type || 'Anomaly'}</span>
                        <span className="text-[10px] font-mono text-gray-500 bg-white px-1 py-0.5 rounded border border-gray-100">{detection.timeCode || '00:00'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${confidence > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${confidence}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{confidence}%</span>
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="flex gap-1.5 mt-2 animate-in slide-in-from-top-1 duration-200">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 h-7 text-[10px] px-0 gap-1" onClick={(e) => { e.stopPropagation(); onApprove(detection); }}>
                        <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 h-7 text-[10px] px-0 gap-1" onClick={(e) => { e.stopPropagation(); onReject(detection); }}>
                        <XCircle className="w-3 h-3" /> Reject
                    </Button>
                </div>
            )}
        </div>
    );
}

// --- Main Console Page ---

const ProjectConsolePage = () => {
    const router = useRouter();
    const params = useParams();
    const { id: projectId } = params;
    const { userData } = useUser();
    const { showAlert } = useAlert();

    // State
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detections, setDetections] = useState([]);
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [usingFallbackVideo, setUsingFallbackVideo] = useState(false);

    const videoRef = useRef(null);

    // Helper to construct video URL same as Admin side
    const constructVideoUrl = (videoId) => {
        return `${BACKEND_URL}/api/videos/${videoId}`;
    };

    // Fetch Logic
    const fetchProjectData = useCallback(async () => {
        try {
            setLoading(true);
            setUsingFallbackVideo(false);

            // 1. Fetch Detections
            const detectRes = await api(`/api/qc-technicians/projects/${projectId}/detections`, 'GET');

            // 2. Fetch Project Details
            let projData = null;
            const projectRes = await api(`/api/projects/get-project/${projectId}`, 'GET');
            if (projectRes.ok && projectRes.data?.data) {
                projData = projectRes.data.data;
                setProject(projData);
            }

            // 3. Fetch Project Videos (Admin way)
            // This is the key fix: Admin fetches videos separately
            const videosRes = await api(`/api/videos/project/${projectId}`, 'GET');
            let foundVideo = false;

            if (videosRes.ok && videosRes.data?.data && videosRes.data.data.length > 0) {
                // Sort by most recent if needed, or just take first
                const latestVideo = videosRes.data.data[0];
                const videoStreamUrl = constructVideoUrl(latestVideo._id);
                console.log("Found project video via API:", videoStreamUrl);
                setVideoUrl(videoStreamUrl);
                foundVideo = true;
            }

            // Fallback: Check if project object has a direct URL (legacy or direct link)
            if (!foundVideo && projData?.videoUrl && typeof projData.videoUrl === 'string') {
                // Check if it's already a full URL or needs constructing
                if (projData.videoUrl.startsWith('http')) {
                    setVideoUrl(projData.videoUrl);
                } else {
                    setVideoUrl(`${BACKEND_URL}${projData.videoUrl.startsWith('/') ? '' : '/'}${projData.videoUrl}`);
                }
                foundVideo = true;
            }

            // If still no video, use fallback
            if (!foundVideo) {
                console.log("No video found for project, readying fallback.");
                setVideoUrl(null); // Triggers empty state -> user can click retry or it loads default
            }

            // Handle Detections
            if (detectRes.ok && detectRes.data?.data) {
                const dets = detectRes.data.data;
                setDetections(dets);
                updateStats(dets);
                const firstPending = dets.find(d => d.qcStatus === 'pending');
                if (firstPending) setSelectedDetection(firstPending);
            }
        } catch (error) {
            console.error("Error loading console:", error);
            showAlert("Failed to load project data", "error");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { if (projectId) fetchProjectData(); }, [projectId, fetchProjectData]);

    const updateStats = (dets) => {
        setStats({
            total: dets.length,
            pending: dets.filter(d => d.qcStatus === 'pending' || !d.qcStatus).length,
            approved: dets.filter(d => d.qcStatus === 'approved').length,
            rejected: dets.filter(d => d.qcStatus === 'rejected').length
        });
    };

    const handleReview = async (detection, status) => {
        try {
            const updatedDetections = detections.map(d =>
                d._id === detection._id ? { ...d, qcStatus: status } : d
            );
            setDetections(updatedDetections);
            updateStats(updatedDetections);

            const userId = userData?._id || userData?.id;
            await api(`/api/qc-technicians/detections/${detection._id}`, 'PATCH', {
                qcStatus: status,
                qcReviewedBy: userId,
                action: status
            });

            const currentIndex = detections.findIndex(d => d._id === detection._id);
            const nextPending = detections.slice(currentIndex + 1).find(d => d.qcStatus === 'pending')
                || detections.find(d => d.qcStatus === 'pending');
            if (nextPending && nextPending._id !== detection._id) {
                setSelectedDetection(nextPending);
            }
        } catch (error) {
            console.error("Review failed:", error);
            showAlert("Failed to update status", "error");
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused || videoRef.current.ended) {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch((error) => {
                            console.error("Video playback failed:", error);
                            setIsPlaying(false);
                            // Don't alert here, just let it be paused
                        });
                }
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration || 0);
        }
    };

    const handleVideoError = (e) => {
        console.error("Video Load Error. Source:", videoUrl);
        // Automatically try fallback if we aren't already using it
        if (!usingFallbackVideo) {
            console.log("Attempting fallback video source...");
            setVideoUrl(SAMPLE_VIDEO);
            setUsingFallbackVideo(true);
            showAlert("Original video unavailable. Loaded test signal.", "warning");
        } else {
            setVideoUrl(null); // Even fallback failed
        }
    };

    const handleRetryVideo = () => {
        fetchProjectData();
    };

    const handleSeek = (value) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    }

    const handleCompleteProject = async () => {
        if (!projectId) return;
        try {
            const res = await api(`/api/qc-technicians/assignments/${projectId}`, 'PATCH', {
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            if (res.ok) {
                showAlert("Project marked as complete", "success");
                router.push('/qc-technician/project');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;

    return (
        <div className="p-3 md:p-4 h-[calc(100vh)] flex flex-col space-y-3 bg-gray-50 overflow-hidden box-border">
            {/* Header Card - Compact */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-lg bg-white border-gray-200">
                        <ArrowLeft className="h-4 w-4 text-gray-600" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {project?.name || 'Untitled Project'}
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${project?.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${project?.status === 'completed' ? 'bg-green-500' : 'bg-rose-500 animate-pulse'}`} />
                                {project?.status}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 flex items-center gap-3">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project?.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-center">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Progress</p>
                            <p className="text-xs font-bold text-gray-900">{stats.total > 0 ? Math.round(((stats.approved + stats.rejected) / stats.total) * 100) : 0}%</p>
                        </div>
                        <div className="w-px h-5 bg-gray-100 mx-1"></div>
                        <div className="text-center">
                            <p className="text-[9px] text-rose-400 font-bold uppercase tracking-wider">Pending</p>
                            <p className="text-xs font-bold text-rose-600">{stats.pending}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleCompleteProject}
                        disabled={stats.pending > 0}
                        size="sm"
                        className={`gap-2 h-9 px-4 rounded-lg font-semibold shadow-sm transition-all text-xs ${stats.pending === 0
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-not-allowed'
                            }`}
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                        {stats.pending === 0 ? 'Complete Review' : 'Review Incomplete'}
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Main Stage (Video) - Spans 2 cols */}
                <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col bg-black overflow-hidden rounded-xl">
                    {/* Aspect Ratio Container for Video */}
                    <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="max-h-full max-w-full"
                                onTimeUpdate={handleTimeUpdate}
                                onError={handleVideoError}
                                onEnded={() => setIsPlaying(false)}
                                playsInline
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No Video Signal</p>
                                <Button variant="ghost" size="sm" onClick={handleRetryVideo} className="mt-2 text-rose-500 hover:text-rose-400">
                                    <RefreshCw className="w-3 h-3 mr-2" /> Retry Connection
                                </Button>
                            </div>
                        )}

                        {usingFallbackVideo && (
                            <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-200 text-[10px] px-2 py-1 rounded border border-orange-500/30 backdrop-blur-sm">
                                Test Signal Mode
                            </div>
                        )}

                        {/* Overlays Layer */}
                        {selectedDetection && (
                            <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
                                {/* Mock Bounding Box */}
                                <div className="border border-yellow-400 bg-yellow-400/5 w-48 h-48 rounded-lg relative animate-in fade-in duration-300 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                    <div className="absolute -top-2.5 left-3 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        {selectedDetection.type}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Big Play Button Overlay */}
                        {!isPlaying && videoUrl && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer hover:bg-black/10 transition-colors z-10"
                                onClick={togglePlay}
                            >
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110">
                                    <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                            </div>
                        )}

                        {/* Click to Pause Overlay */}
                        {isPlaying && videoUrl && (
                            <div
                                className="absolute inset-0 z-0 cursor-pointer"
                                onClick={togglePlay}
                            />
                        )}
                    </div>

                    {/* Video Controls Bar */}
                    <div className="h-14 bg-white border-t border-gray-100 flex items-center px-4 gap-3 shrink-0 z-10">
                        <Button variant="ghost" size="icon" onClick={togglePlay} className="h-8 w-8 text-gray-700 hover:text-rose-600 hover:bg-rose-50">
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        </Button>

                        <div className="flex-1 flex items-center gap-3">
                            <span className="text-[10px] font-mono font-medium text-gray-500 w-10">
                                {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                            </span>
                            <Slider
                                value={[currentTime]}
                                max={duration || 100}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="flex-1 cursor-pointer"
                            />
                            <span className="text-[10px] font-mono font-medium text-gray-500 w-10 text-right">
                                {new Date((duration || 0) * 1000).toISOString().substr(14, 5)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                <Settings className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                <Maximize2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Right Sidebar - Inspector */}
                <Card className="border-0 shadow-sm flex flex-col overflow-hidden bg-white h-full rounded-xl">
                    <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-rose-600" />
                            Detections
                        </CardTitle>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px]">
                            {detections.length} Items
                        </Badge>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-3 bg-gray-50/50 space-y-0 min-h-0">
                        {detections.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-xs">No detections found.</p>
                            </div>
                        ) : (
                            detections.map((det) => (
                                <DetectionItem
                                    key={det._id}
                                    detection={det}
                                    isSelected={selectedDetection?._id === det._id}
                                    onClick={() => setSelectedDetection(det)}
                                    onApprove={(d) => handleReview(d, 'approved')}
                                    onReject={(d) => handleReview(d, 'rejected')}
                                />
                            ))
                        )}
                    </CardContent>

                    {/* Context Panel */}
                    {selectedDetection && (
                        <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                            <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Selected Item</h4>
                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs mb-3">
                                <div className="text-gray-500">Type</div>
                                <div className="font-semibold text-right text-gray-900">{selectedDetection.type}</div>
                                <div className="text-gray-500">Confidence</div>
                                <div className="font-semibold text-right text-gray-900">{Math.round((selectedDetection.confidence || 0) * 100)}%</div>
                                <div className="text-gray-500">Location</div>
                                <div className="font-semibold text-right text-gray-900">{selectedDetection.location?.distance || 0}m</div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-gray-500 hover:text-gray-900 border-gray-200 h-8 text-xs" onClick={() => setSelectedDetection(null)}>
                                Deselect
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProjectConsolePage;
