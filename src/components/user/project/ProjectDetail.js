import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useProjectVideos,
  useProjectObservations,
  useProjectSnapshots,
  useProjectMetadata,
  usePacpCodes,
  useProjectDetections,
  queryKeys,
} from '@/hooks/useQueryHooks';
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Maximize,
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Edit3,
  PlayCircle,
  Loader2,
  FileVideo,
  Send,
  CheckCircle2,
  Zap,
  Square,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import AddObservation from './AddObersavation';
import ObservationsPanel from './ObservationsPanel';
import ObservationDetailPanel from '@/components/shared/ObservationDetailPanel';
import {
  AddCustomMetadataDialog,
  EditMetadataDialog,
  DeleteVideoDialog,
  UploadProgressDialog,
} from '@/components/shared/project-dialogs';
import { ProjectInfoBanner, UploadStatusBanners, ProjectVideoList } from '@/components/shared/project-detail';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';
import { BACKEND_URL } from '@/lib/config';
import { useUploadLimits } from '@/hooks/useUploadLimits';
import { useRouter } from 'next/navigation';
import { getVideoUrl, getSnapshotUrl } from '@/lib/getVideoUrl';
import ProjectSwitcher from '@/components/shared/ProjectSwitcher';
import { AiProcessingModal } from '@/components/project/AiProcessingModal';
import ReprocessModal from '@/components/project/ReprocessModal';

const ProjectDetail = ({ project, setSelectedProject, allProjects = [] }) => {
  const uploadLimits = useUploadLimits();
  const [showAiModal, setShowAiModal] = useState(false);
  const [isRecordingInfoExpanded, setIsRecordingInfoExpanded] = useState(true);
  const [isSnapshotsExpanded, setIsSnapshotsExpanded] = useState(true);
  const [isVideosExpanded, setIsVideosExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [detailObs, setDetailObs] = useState(null);
  const [obsPage, setObsPage] = useState(1);
  const obsPageSize = 10;
  const [isAddMetadataOpen, setIsAddMetadataOpen] = useState(false);
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [editingMetadata, setEditingMetadata] = useState({});
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  // Video list state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDeleteVideoOpen, setIsDeleteVideoOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(false);

  // Video upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  const user_id = userId;
  const isAdmin = userData?.role === 'admin';
  const queryClient = useQueryClient();

  const getSnapshotColor = useCallback((label) => {
    if (!label) return 'bg-gray-400';
    const colorMap = {
      MWL: 'bg-purple-500',
      TFA: 'bg-orange-500',
      CM: 'bg-yellow-500',
      SAM: 'bg-purple-400',
      CRK: 'bg-red-500',
      RIN: 'bg-green-500',
      DEF: 'bg-blue-500',
      OBS: 'bg-gray-500',
    };
    const labelUpper = label.toUpperCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (labelUpper.includes(key)) {
        return color;
      }
    }
    return 'bg-gray-400';
  }, []);

  // ── TanStack Query hooks ──────────────────────────────────────────
  const { data: pacpCodes = [] } = usePacpCodes();

  const {
    data: videosData = [],
    isLoading: loadingVideos,
  } = useProjectVideos(project?._id);
  const projectVideos = videosData;

  const {
    data: obsData,
  } = useProjectObservations(project?._id, obsPage, obsPageSize);
  const observations = obsData?.observations ?? [];
  const obsTotal = obsData?.total ?? 0;

  const { data: rawSnapshots = [] } = useProjectSnapshots(project?._id);
  const { data: detectionsRaw = [] } = useProjectDetections(project?._id);

  const { data: fetchedMetadata } = useProjectMetadata(project?._id);
  const projectMetadata = fetchedMetadata ?? project?.metadata ?? null;

  // Auto-select first video when videos arrive and none selected
  useEffect(() => {
    if (projectVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(projectVideos[0]);
    }
  }, [projectVideos, selectedVideo]);

  // Merge manual snapshots with AI detection snapshots
  const snapshots = useMemo(() => {
    const manualSnapshots = rawSnapshots.map((snapshot) => ({
      id: snapshot._id || snapshot.id,
      distance: snapshot.distance || 'N/A',
      label: snapshot.label || 'Unlabeled',
      timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
      color: snapshot.color || getSnapshotColor(snapshot.label),
      imageUrl: snapshot.imageUrl,
    }));

    // AI detection snapshots (detections that have images)
    const detectionSnapshots = (Array.isArray(detectionsRaw) ? detectionsRaw : [])
      .filter((d) => d.images && d.images.length > 0 && d.images[0].url)
      .map((d) => ({
        id: d._id,
        distance: d.location?.distance != null ? String(d.location.distance) : `Frame ${d.frameNumber || 0}`,
        label: d.type || 'AI Detection',
        timestamp: d.detectedAt || d.createdAt,
        color: getSnapshotColor(d.type || ''),
        imageUrl: getSnapshotUrl(d.images[0].url),
        confidence: d.confidence,
        severity: d.severity,
        isAiDetection: true,
      }));

    return [...manualSnapshots, ...detectionSnapshots];
  }, [rawSnapshots, detectionsRaw, getSnapshotColor]);

  // Status-based gradient colors
  const statusGradient = useMemo(() => {
    const status = project?.status?.toLowerCase() || '';

    const gradients = {
      'planning': {
        banner: 'from-blue-50 via-indigo-50 to-blue-50',
        bannerBorder: 'border-blue-200',
        accent: 'blue',
        progressBg: 'from-blue-500 via-blue-600 to-indigo-600',
        text: 'text-blue-600',
        textGradient: 'from-blue-600 to-indigo-600',
        dot: 'bg-blue-400',
      },
      'in-progress': {
        banner: 'from-emerald-50 via-green-50 to-emerald-50',
        bannerBorder: 'border-emerald-200',
        accent: 'emerald',
        progressBg: 'from-emerald-500 via-green-500 to-teal-600',
        text: 'text-emerald-600',
        textGradient: 'from-emerald-600 to-teal-600',
        dot: 'bg-emerald-400',
      },
      'ai-processing': {
        banner: 'from-violet-50 via-purple-50 to-violet-50',
        bannerBorder: 'border-violet-200',
        accent: 'violet',
        progressBg: 'from-violet-500 via-purple-500 to-fuchsia-600',
        text: 'text-violet-600',
        textGradient: 'from-violet-600 to-fuchsia-600',
        dot: 'bg-violet-400',
      },
      'completed': {
        banner: 'from-amber-50 via-yellow-50 to-amber-50',
        bannerBorder: 'border-amber-200',
        accent: 'amber',
        progressBg: 'from-amber-500 via-yellow-500 to-orange-500',
        text: 'text-amber-600',
        textGradient: 'from-amber-600 to-orange-600',
        dot: 'bg-amber-400',
      },
      'on-hold': {
        banner: 'from-slate-50 via-gray-50 to-slate-50',
        bannerBorder: 'border-slate-200',
        accent: 'slate',
        progressBg: 'from-slate-500 via-gray-500 to-zinc-600',
        text: 'text-slate-600',
        textGradient: 'from-slate-600 to-zinc-600',
        dot: 'bg-slate-400',
      },
      'review': {
        banner: 'from-cyan-50 via-sky-50 to-cyan-50',
        bannerBorder: 'border-cyan-200',
        accent: 'cyan',
        progressBg: 'from-cyan-500 via-sky-500 to-blue-500',
        text: 'text-cyan-600',
        textGradient: 'from-cyan-600 to-blue-600',
        dot: 'bg-cyan-400',
      },
      'default': {
        banner: 'from-rose-50 via-pink-50 to-rose-50',
        bannerBorder: 'border-rose-200',
        accent: 'rose',
        progressBg: 'from-rose-500 via-pink-500 to-red-500',
        text: 'text-rose-600',
        textGradient: 'from-rose-600 to-pink-600',
        dot: 'bg-rose-400',
      },
    };

    return gradients[status] || gradients['default'];
  }, [project?.status]);

  const handleBackToProjects = () => {
    setSelectedProject(null);
    // Check if we're in QC technician context
    const currentPath = window.location.pathname;
    if (currentPath.includes('/qc-technician')) {
      router.push(`/qc-technician/project`);
    } else {
      router.push(`/user/project`);
    }
  };


  // Handle video deletion (admin only)
  const handleDeleteVideo = async () => {
    if (!videoToDelete || !isAdmin) return;

    setDeletingVideo(true);
    try {
      const { ok } = await api(`/api/videos/${videoToDelete._id}`, 'DELETE');
      if (ok) {
        showAlert('Video deleted successfully', 'success');
        if (selectedVideo?._id === videoToDelete._id) {
          setSelectedVideo(projectVideos.length > 1 ? projectVideos.find(v => v._id !== videoToDelete._id) : null);
        }
        setIsDeleteVideoOpen(false);
        setVideoToDelete(null);
        queryClient.invalidateQueries({ queryKey: queryKeys.projectVideos(project?._id) });
      } else {
        showAlert('Failed to delete video', 'error');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showAlert('Failed to delete video', 'error');
    } finally {
      setDeletingVideo(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  // Handle video upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];
    if (!validTypes.includes(file.type)) {
      showAlert('Please upload a valid video file (MP4, WebM, MOV, AVI, MPEG)', 'error');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = uploadLimits.videoMaxMB * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert(`Video file is too large. Maximum size is ${uploadLimits.videoMaxMB}MB.`, 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('projectId', project._id);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          showAlert('Video uploaded successfully!', 'success');
          // Refresh video list
          queryClient.invalidateQueries({ queryKey: queryKeys.projectVideos(project?._id) });
        } else {
          // Try to parse error response, fallback to generic message
          try {
            const errorData = JSON.parse(xhr.responseText);
            showAlert(errorData.message || 'Failed to upload video', 'error');
          } catch {
            showAlert('Failed to upload video', 'error');
          }
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        showAlert('Network error occurred while uploading', 'error');
        setIsUploading(false);
        setUploadProgress(0);
      });

      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      xhr.open('POST', `${BACKEND_URL}/api/videos/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading video:', error);
      showAlert('Failed to upload video', 'error');
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Reset selected video when project changes
  useEffect(() => {
    if (project?._id) {
      setSelectedVideo(null);
    }
  }, [project?._id]);

  // Real-time polling for processing updates
  useEffect(() => {
    if (!project?._id) return;

    // Check if any video or the project itself is in a processing state
    const hasActiveVideos = projectVideos.some(v =>
      ['pending', 'processing', 'uploading'].includes(v.aiProcessingStatus)
    );

    const isProjectActive =
      project.status === 'ai-processing' ||
      project.status === 'uploading' ||
      project.status === 'processing';

    const shouldPoll = isProjectActive || hasActiveVideos || isReprocessing;

    if (!shouldPoll) return;

    // Poll every 3 seconds for faster updates
    const intervalId = setInterval(() => {
      // Refresh videos to get latest AI status
      queryClient.invalidateQueries({ queryKey: queryKeys.projectVideos(project?._id) });

      // Refresh project to get latest overall status
      if (setSelectedProject) {
        api(`/api/projects/get-project/${project._id}`, 'GET')
          .then(({ data }) => {
            if (data?.data) {
              setSelectedProject(data.data);
            }
          })
          .catch(console.error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [
    project?._id,
    project?.status,
    projectVideos,
    isReprocessing,
    queryClient,
    setSelectedProject
  ]);

  const handleAddMetadata = async () => {
    if (!newMetadataKey.trim() || !newMetadataValue.trim()) {
      showAlert('Please enter both key and value', 'error');
      return;
    }

    if (!project?._id || !user_id) {
      showAlert('Project ID or User ID is missing', 'error');
      return;
    }

    try {
      const updatedMetadata = {
        ...(projectMetadata || project?.metadata || {}),
        [newMetadataKey.trim()]: newMetadataValue.trim()
      };

      const response = await api(
        `/api/projects/update-project/${project._id}/${user_id}`,
        'PUT',
        { metadata: updatedMetadata }
      );

      if (response.ok) {
        showAlert('Custom metadata added successfully', 'success');
        setNewMetadataKey('');
        setNewMetadataValue('');
        setIsAddMetadataOpen(false);
        // Refresh project data
        if (setSelectedProject) {
          const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
          if (data?.data) {
            setSelectedProject(data.data);
          }
        }
        // Also refresh local metadata
        queryClient.invalidateQueries({ queryKey: ['project', project._id, 'metadata'] });
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to add metadata';
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      showAlert('Failed to add metadata: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const handleEditMetadata = async () => {
    if (!project?._id || !user_id) {
      showAlert('Project ID or User ID is missing', 'error');
      return;
    }

    try {
      const response = await api(
        `/api/projects/update-project/${project._id}/${user_id}`,
        'PUT',
        { metadata: editingMetadata }
      );

      if (response.ok) {
        showAlert('Metadata updated successfully', 'success');
        setIsEditMetadataOpen(false);
        // Refresh project data
        if (setSelectedProject) {
          const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
          if (data?.data) {
            setSelectedProject(data.data);
          }
        }
        // Also refresh local metadata
        queryClient.invalidateQueries({ queryKey: ['project', project._id, 'metadata'] });
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to update metadata';
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      showAlert('Failed to update metadata: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const openEditMetadata = () => {
    const currentMetadata = projectMetadata || project?.metadata || {};
    // Ensure we have a proper object
    const metadataObj = typeof currentMetadata === 'object' && currentMetadata !== null
      ? currentMetadata
      : {};
    setEditingMetadata({ ...metadataObj });
    setIsEditMetadataOpen(true);
  };

  const handleReprocess = async () => {
    if (!project?._id) {
      showAlert('Project ID is missing', 'error');
      return;
    }

    if (isReprocessing) {
      return;
    }

    setIsReprocessing(true);
    try {
      let response;
      try {
        response = await api(
          `/api/ai/reprocess/project/${project._id}`,
          'POST'
        );
      } catch (apiError) {
        // Handle API call failures (network errors, etc.)
        const apiErrorMessage = apiError?.message || apiError?.toString() || 'Network or API error';
        throw new Error(`Failed to call reprocess API: ${apiErrorMessage}`);
      }

      if (!response) {
        throw new Error('No response received from reprocess API');
      }

      if (response.ok && response.data?.success !== false) {
        showAlert(response.data?.message || 'Video reprocessing started successfully', 'success');
        setShowAiModal(true); // Open the AI processing modal with real-time SSE logs
        // Refresh project data after a short delay
        setTimeout(async () => {
          if (setSelectedProject) {
            try {
              const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
              if (data?.data) {
                setSelectedProject(data.data);
              }
            } catch (refreshError) {
              try {
                // Silently handle refresh errors
              } catch (e) {
                // Silently fail if we can't log the error
              }
            }
          }
        }, 2000);
      } else {
        const errorMessage = response?.data?.error || response?.data?.message || response?.data?.details || `Failed to start reprocessing (Status: ${response?.status || 'unknown'})`;
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      // Safely extract error message
      let errorMessage = 'Unknown error';
      try {
        if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.toString) {
          errorMessage = error.toString();
        }
      } catch (e) {
        errorMessage = 'Failed to reprocess video';
      }

      showAlert('Failed to reprocess video: ' + errorMessage, 'error');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleStopProcessing = async () => {
    setIsStopConfirmOpen(false);
    setIsStopping(true);
    try {
      const { ok } = await api(`/api/ai/stop/${project._id}`, 'POST');
      if (ok) {
        showAlert('AI processing stopped', 'success');
        setShowAiModal(false);
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else showAlert('Failed to stop processing', 'error');
    } catch { showAlert('Failed to stop processing', 'error'); }
    finally { setIsStopping(false); }
  };

  const handleResetAIData = async () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    try {
      const { ok, data } = await api(`/api/ai/reset/${project._id}`, 'POST');
      if (ok) {
        showAlert(`AI data reset — ${data?.data?.deletedDetections || 0} detections cleared`, 'success');
        setShowAiModal(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.projectVideos(project?._id) });
        queryClient.invalidateQueries({ queryKey: ['project', project._id, 'observations'] });
        queryClient.invalidateQueries({ queryKey: ['project', project._id, 'snapshots'] });
        setObsPage(1);
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else showAlert('Failed to reset AI data', 'error');
    } catch { showAlert('Failed to reset AI data', 'error'); }
    finally { setIsResetting(false); }
  };

  // Notify customer — send deliverable ready email and update status
  const handleNotifyCustomer = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    try {
      const res = await api(`/api/projects/notify-customer/${project._id}`, 'POST');
      if (res.ok) {
        showAlert('Customer notified — report delivered', 'success');
        // Refresh project data
        if (setSelectedProject) {
          try {
            const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
            if (data?.data) setSelectedProject(data.data);
          } catch {}
        }
      } else {
        showAlert(res.data?.message || 'Failed to notify customer', 'error');
      }
    } catch {
      showAlert('Failed to notify customer', 'error');
    } finally {
      setIsNotifying(false);
    }
  };

  // Play/pause toggle
  const togglePlay = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const toggleFullScreen = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    const container = videoContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      // Request fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Update currentTime as video plays
  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  // When metadata loads, get duration
  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  // Seek video by clicking progress bar
  const onSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Use fetched snapshots or fallback to empty array
  const displaySnapshots = snapshots.length > 0 ? snapshots : [];


  const recordingInfo = projectMetadata || project?.metadata || {
    recordingDate: project?.metadata?.recordingDate || '',
    upstreamMH: project?.metadata?.upstreamMH || '',
    downstreamMH: project?.metadata?.downstreamMH || '',
    shape: project?.metadata?.shape || project?.pipelineShape || '',
    material: project?.metadata?.material || project?.pipelineMaterial || '',
    remarks: project?.metadata?.remarks || '',
  };

  const isObservationClose = () => {
    setIsObservationOpen(false);
  };

  const observationOpen = () => {
    setIsObservationOpen(true);
  };

  // Format time (seconds) to hh:mm:ss
  const formatTime = (timeSec) => {
    if (!timeSec) return '00:00:00';
    const date = new Date(timeSec * 1000);
    return date.toISOString().substr(11, 8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 px-6 py-4 mb-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={handleBackToProjects}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Back to Projects</span>
              </button>

              <div className="h-6 w-px bg-gray-200"></div>

              <div className="flex items-center space-x-3">
                <h1 className="text-lg font-bold text-gray-900">Project Console</h1>
                <ProjectSwitcher
                  projects={allProjects}
                  currentId={project?._id}
                  onSelect={(p) => {
                    router.push(`?selectedProject=${p._id}`, { scroll: false });
                    setSelectedProject(p);
                  }}
                />
                <span className="font-semibold text-gray-700">{project?.name || 'Untitled Project'}</span>

                {/* Status Badge - Dynamic based on status */}
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
                  {project?.status === 'ai-processing' && <Zap className="w-3 h-3" />}
                  {project?.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                  {project?.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'In Progress'}
                </span>
              </div>
            </div>

            {/* Action Menu — consolidated dropdown */}
            <div className="flex items-center space-x-2">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleVideoUpload}
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,.mp4,.webm,.mov,.avi,.mpeg"
                className="hidden"
              />

              {(() => {
                const canStop = project?.status === 'ai-processing';
                const canReprocess = project?.status !== 'planning' && project?.status !== 'in-progress';
                const canReset = project?.aiDetections?.total > 0 && project?.status !== 'ai-processing';
                const canNotify =
                  (project?.status === 'completed' || project?.status === 'qc-review') &&
                  project?.status !== 'customer-notified';
                const isBusy = isStopping || isReprocessing || isResetting || isNotifying;

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={isBusy}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
                      >
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                        <span>
                          {isStopping
                            ? 'Stopping...'
                            : isReprocessing
                              ? 'Reprocessing...'
                              : isResetting
                                ? 'Resetting...'
                                : isNotifying
                                  ? 'Sending...'
                                  : 'Actions'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {canStop && (
                        <DropdownMenuItem
                          onClick={() => setIsStopConfirmOpen(true)}
                          disabled={isStopping}
                          className="text-red-600 focus:text-red-700"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop AI Processing
                        </DropdownMenuItem>
                      )}

                      {canReprocess && (
                        <DropdownMenuItem onClick={handleReprocess} disabled={isReprocessing}>
                          <Zap className="h-4 w-4 mr-2 text-violet-600" />
                          Reprocess AI
                        </DropdownMenuItem>
                      )}

                      {canReset && (
                        <DropdownMenuItem
                          onClick={() => setIsResetConfirmOpen(true)}
                          disabled={isResetting}
                          className="text-orange-600 focus:text-orange-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset AI Data
                        </DropdownMenuItem>
                      )}

                      {canNotify && (
                        <DropdownMenuItem
                          onClick={handleNotifyCustomer}
                          disabled={isNotifying}
                          className="text-emerald-600 focus:text-emerald-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Notify Customer
                        </DropdownMenuItem>
                      )}

                      {(canStop || canReprocess || canReset || canNotify) && <DropdownMenuSeparator />}

                      <DropdownMenuItem
                        onClick={() => router.push(`/user/project/editProject/${project._id}`)}
                      >
                        <Edit3 className="h-4 w-4 mr-2 text-gray-600" />
                        Edit Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })()}
            </div>
          </div>
        </div>

        <UploadStatusBanners
          project={project}
          onDismissError={() => {
            api(`/api/projects/update-project/${project._id}/${user_id}`, 'PUT', {
              projectData: JSON.stringify({ uploadError: '', status: 'planning' }),
            }).then(() => {
              if (setSelectedProject) setSelectedProject({ ...project, uploadError: '', status: 'planning' });
            });
          }}
        />

        <div className="flex gap-6 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ProjectInfoBanner
              project={project}
              statusGradient={statusGradient}
              isReprocessing={isReprocessing}
            />

            {/* Enhanced Video Player Container */}
            <div
              ref={videoContainerRef}
              className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden flex flex-col shadow-xl border border-gray-800/50"
            >
              {(selectedVideo?.filePath || project?.videoUrl) ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src={getVideoUrl(selectedVideo?._id || project.videoUrl)}
                    crossOrigin="anonymous"
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    controls={false}
                  />

                  {/* Video Info Overlay */}
                  {selectedVideo && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">
                        {selectedVideo.originalName || selectedVideo.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <span>{formatFileSize(selectedVideo.fileSize)}</span>
                        {selectedVideo.aiProcessingStatus && (
                          <Badge
                            variant={selectedVideo.aiProcessingStatus === 'completed' ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 ${selectedVideo.aiProcessingStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50' : ''
                              }`}
                          >
                            {selectedVideo.aiProcessingStatus === 'pending' ? 'Ready for AI' : selectedVideo.aiProcessingStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Controls */}
                  <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center space-x-4 bg-black bg-opacity-50 py-2 rounded z-20" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    {/* Progress bar */}
                    <div
                      className="flex-1 h-1 bg-gray-600 rounded cursor-pointer"
                      onClick={onSeek}
                      style={{ position: 'relative' }}
                    >
                      <div
                        className="h-1 bg-blue-600 rounded"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>

                    {/* Time display */}
                    <div className="text-white text-sm font-mono tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Fullscreen button */}
                    <button type="button" onClick={toggleFullScreen} className="text-white hover:text-blue-400 transition-colors">
                      <Maximize className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-white text-lg font-semibold flex flex-col items-center justify-center h-full gap-2">
                  <FileVideo className="w-12 h-12 text-gray-400" />
                  <span>No video available</span>
                  <span className="text-sm text-gray-400">Upload a video to get started</span>
                </div>
              )}
            </div>

            {/* Observations Section */}
            <ObservationsPanel
              observations={observations}
              onAddObservation={observationOpen}
              theme="indigo"
              pacpCodes={pacpCodes}
              projectId={project._id}
              page={obsPage}
              pageSize={obsPageSize}
              total={obsTotal}
              onPageChange={(nextPage) => {
                if (nextPage < 1) return;
                setObsPage(nextPage);
              }}
              onGoToTime={(obs) => {
                if (!videoRef.current || !obs?.time) return;
                const parts = String(obs.time).split(':').map((p) => parseInt(p, 10) || 0);
                const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                videoRef.current.currentTime = seconds;
                setIsPlaying(true);
                videoRef.current.play().catch(() => {});
              }}
              onViewDetail={(obs) => setDetailObs(obs)}
              onDeleteObservation={() => {
                queryClient.invalidateQueries({ queryKey: ['project', project?._id, 'observations'] });
              }}
            />
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="w-80 shrink-0 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 space-y-5 shadow-sm h-fit">
            <ProjectVideoList
              videos={projectVideos}
              selectedVideo={selectedVideo}
              onSelectVideo={setSelectedVideo}
              onTriggerUpload={triggerUpload}
              onRequestDelete={(video) => {
                setVideoToDelete(video);
                setIsDeleteVideoOpen(true);
              }}
              isVideosExpanded={isVideosExpanded}
              onToggleExpanded={() => setIsVideosExpanded(!isVideosExpanded)}
              loading={loadingVideos}
              isUploading={isUploading}
              allowDelete={isAdmin}
              formatFileSize={formatFileSize}
            />

            {/* Snapshots */}
            <div className="bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsSnapshotsExpanded(!isSnapshotsExpanded)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    {isSnapshotsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-medium">SNAPSHOTS</span>
                  </button>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {isSnapshotsExpanded && (
                <div className="space-y-2">
                  {displaySnapshots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">No snapshots available</div>
                    </div>
                  ) : (
                    <div className="relative max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                      {/* Vertical timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      {displaySnapshots.map((snapshot, index) => (
                        <div key={`snapshot-${snapshot.id}-${index}`} className="relative flex items-center space-x-3 py-3">
                          {/* Snapshot dot with color */}
                          <div className={`w-3 h-3 rounded-full ${snapshot.color} relative z-10 border-2 border-white shadow-sm`}></div>

                          {/* Snapshot content */}
                          <div className="flex-1 min-w-0 bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors">
                            {/* Snapshot image */}
                            {snapshot.imageUrl && (
                              <img
                                src={snapshot.imageUrl}
                                alt={snapshot.label}
                                className="w-full h-32 object-cover cursor-pointer"
                                onClick={() => window.open(snapshot.imageUrl, '_blank')}
                                loading="lazy"
                              />
                            )}
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{snapshot.distance || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{snapshot.label}</div>
                                  {snapshot.confidence && (
                                    <div className="text-xs text-gray-500 mt-0.5">{snapshot.confidence <= 1 ? Math.round(snapshot.confidence * 100) : Math.round(snapshot.confidence)}% confidence</div>
                                  )}
                                  {snapshot.timestamp && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(snapshot.timestamp).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <button className="p-1 hover:bg-white rounded-full transition-colors">
                                  <PlayCircle className="h-4 w-4 text-blue-600" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Arrow pointing down to next item */}
                          {index < displaySnapshots.length - 1 && (
                            <div
                              key={`arrow-${index}`}
                              className="absolute left-4 top-8 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-300"
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recording Information */}
            <div className="bg-white">
              <button onClick={() => setIsRecordingInfoExpanded(!isRecordingInfoExpanded)} className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  {isRecordingInfoExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  <span className="font-semibold text-sm text-gray-800">Recording Information</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRecordingInfoExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isRecordingInfoExpanded && (
                <div className="space-y-1">
                  {Object.entries(recordingInfo).map(([key, value], index) => (
                    <div key={`${key}-${index}`} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-xs font-semibold text-gray-800 text-right max-w-[55%] truncate">{value || '—'}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <Button variant="outline" size="sm" className="text-xs h-9 border-dashed" onClick={() => setIsAddMetadataOpen(true)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Field
                    </Button>
                    <Button size="sm" className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={openEditMetadata}>
                      <Edit3 className="h-3 w-3 mr-1" /> Edit All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dialogs - Outside flex container */}
          <AddObservation
            isOpen={isObservationOpen}
            onClose={isObservationClose}
            project_id={project._id}
            user_id={user_id}
            pacpCodes={pacpCodes}
            snapshots={displaySnapshots}
            videoRef={videoRef}
            currentTime={currentTime}
            currentDistance={project?.distance || "0.00"}
            theme="indigo"
          />

          <AddCustomMetadataDialog
            open={isAddMetadataOpen}
            onOpenChange={setIsAddMetadataOpen}
            keyValue={newMetadataKey}
            setKeyValue={setNewMetadataKey}
            value={newMetadataValue}
            setValue={setNewMetadataValue}
            onSubmit={handleAddMetadata}
            accent="indigo"
          />

          <EditMetadataDialog
            open={isEditMetadataOpen}
            onOpenChange={setIsEditMetadataOpen}
            metadata={editingMetadata}
            setMetadata={setEditingMetadata}
            onSubmit={handleEditMetadata}
            accent="indigo"
          />

          <DeleteVideoDialog
            open={isDeleteVideoOpen}
            onOpenChange={setIsDeleteVideoOpen}
            video={videoToDelete}
            onConfirm={handleDeleteVideo}
            onCancel={() => setVideoToDelete(null)}
            loading={deletingVideo}
          />

          <UploadProgressDialog open={isUploading} progress={uploadProgress} accent="indigo" />
        </div>
      </div>
      {/* AI Processing Modal with SSE */}
      <AiProcessingModal
        open={showAiModal}
        onOpenChange={setShowAiModal}
        project={project}
        selectedVideo={project?.videos?.[0] || null}
      />

      <ReprocessModal open={isStopConfirmOpen} onOpenChange={setIsStopConfirmOpen} onConfirm={handleStopProcessing}
        title="Stop AI Processing?" description="This will halt the current AI analysis mid-progress."
        bullets={['Processing stops after current batch', 'Existing detections remain', 'Project status changes to "On Hold"', 'You can reprocess again anytime']}
        confirmLabel="Yes, stop processing" confirmClassName="bg-red-600 hover:bg-red-700 text-white" />

      <ReprocessModal open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} onConfirm={handleResetAIData}
        title="Reset All AI Data?" description="This will permanently delete all AI-generated data for this project."
        bullets={['All AI detections deleted', 'All AI observations removed', 'All AI snapshots cleared', 'Project resets to "Planning"', 'Manual observations preserved']}
        confirmLabel="Yes, reset all AI data" confirmClassName="bg-orange-600 hover:bg-orange-700 text-white" />

      <ObservationDetailPanel
        open={!!detailObs}
        onOpenChange={(open) => { if (!open) setDetailObs(null); }}
        observation={detailObs}
        projectId={project?._id}
        videoRef={videoRef}
        onDelete={() => { queryClient.invalidateQueries({ queryKey: ['project', project?._id, 'observations'] }); setDetailObs(null); }}
        onUpdate={() => { queryClient.invalidateQueries({ queryKey: ['project', project?._id, 'observations'] }); }}
        onGoToTime={(obs) => { if (!videoRef.current || !obs?.time) return; const pts = String(obs.time).split(':').map((p) => parseInt(p, 10) || 0); videoRef.current.currentTime = pts[0] * 3600 + pts[1] * 60 + pts[2]; setIsPlaying(true); videoRef.current.play().catch(() => {}); }}
      />
    </div>
  );
};

export default ProjectDetail;
