import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Maximize,
  MoreHorizontal,
  Plus,
  Edit3,
  PlayCircle,
  Loader2,
  FileVideo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddObservation from './AddObersavation';
import ObservationsPanel from './ObservationsPanel';
import ObservationDetailPanel from '@/components/shared/ObservationDetailPanel';
import { AiProcessingModal } from '@/components/project/AiProcessingModal';
import { ReprocessModal } from '@/components/project/ReprocessModal';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api, getCookie } from '@/lib/helper';
import { BACKEND_URL } from '@/lib/config';
import { useUploadLimits } from '@/hooks/useUploadLimits';
import { useProjectVideos, useProjectObservations, useProjectSnapshots, useProjectMetadata, usePacpCodes } from '@/hooks/useQueryHooks';
import { useRouter } from 'next/navigation';
import { getVideoUrl } from '@/lib/getVideoUrl';
import { deriveProjectSnapshots } from '@/lib/projectSnapshots';
import { AddCustomMetadataDialog, EditMetadataDialog, DeleteVideoDialog, UploadProgressDialog } from '@/components/shared/project-dialogs';
import { DetailHeader, ProjectInfoBanner, UploadStatusBanners, ProjectVideoList } from '@/components/shared/project-detail';
import ProjectStatusTimeline from '@/components/shared/project/ProjectStatusTimeline';

const ProjectDetail = ({ project, setSelectedProject, onBack, initialSeekTime, allProjects = [] }) => {
  // Project switcher state removed — now using shadcn DropdownMenu via ProjectSwitcher
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
  const [isReprocessConfirmOpen, setIsReprocessConfirmOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAiInfoOpen, setIsAiInfoOpen] = useState(false);

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
  const uploadLimits = useUploadLimits();

  // --- TanStack Query hooks (replace manual fetch callbacks) ---
  const { data: projectVideos = [], isLoading: loadingVideos, refetch: refetchVideos } = useProjectVideos(project?._id);
  const { data: snapshotsData = [], refetch: refetchSnapshots } = useProjectSnapshots(project?._id);
  const { data: metadataData, refetch: refetchMetadata } = useProjectMetadata(project?._id);
  const { data: obsData, refetch: refetchObservations } = useProjectObservations(project?._id, obsPage, obsPageSize);
  const { data: pacpCodes = [] } = usePacpCodes();

  const snapshots = snapshotsData;
  const projectMetadata = metadataData ?? project?.metadata ?? null;
  const observations = obsData?.observations ?? [];
  const obsTotal = obsData?.total ?? 0;

  // Auto-select first video when project videos load or change
  useEffect(() => {
    if (projectVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(projectVideos[0]);
    } else if (selectedVideo?._id) {
      const updated = projectVideos.find((v) => v._id === selectedVideo._id);
      if (updated && updated !== selectedVideo) setSelectedVideo(updated);
    }
  }, [projectVideos]); // eslint-disable-line react-hooks/exhaustive-deps


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
    if (onBack) {
      onBack();
      return;
    }
    setSelectedProject(null);
    const currentPath = window.location.pathname;
    if (currentPath.includes('/qc-technician')) {
      router.replace(`/qc-technician/project`);
    } else if (currentPath.includes('/operator')) {
      router.replace(`/operator/projects`);
    } else {
      router.replace(`/admin/project`);
    }
  };

  // If an initialSeekTime (HH:MM:SS) is provided via URL, jump video once when ready
  useEffect(() => {
    if (!initialSeekTime || !videoRef.current) return;

    const video = videoRef.current;
    const parseToSeconds = (t) => {
      if (!t) return 0;
      const parts = String(t).split(':').map((p) => parseInt(p, 10) || 0);
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    };

    const seekWhenReady = () => {
      const seconds = parseToSeconds(initialSeekTime);
      if (!Number.isFinite(seconds) || seconds < 0) return;
      try {
        video.currentTime = seconds;
        setIsPlaying(true);
        video.play().catch(() => {});
      } catch {
        // ignore
      }
    };

    if (video.readyState >= 2) {
      seekWhenReady();
    } else {
      const onLoaded = () => {
        seekWhenReady();
        video.removeEventListener('loadedmetadata', onLoaded);
      };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }
  }, [initialSeekTime]);

  // Handle video deletion (admin only)
  const handleDeleteVideo = async () => {
    if (!videoToDelete || !isAdmin) return;

    setDeletingVideo(true);
    try {
      const { ok } = await api(`/api/videos/${videoToDelete._id}`, 'DELETE');
      if (ok) {
        showAlert('Video deleted successfully', 'success');
        if (selectedVideo?._id === videoToDelete._id) {
          const nextList = projectVideos.filter(v => v._id !== videoToDelete._id);
          setSelectedVideo(nextList.length > 0 ? nextList[0] : null);
        }
        setIsDeleteVideoOpen(false);
        setVideoToDelete(null);
        refetchVideos();
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
          refetchVideos();
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

      // Get auth token (cookie or localStorage for XHR)
      const token = typeof window !== 'undefined' ? (getCookie('authToken') || localStorage.getItem('authToken')) : null;

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

  // Reset local UI state when switching projects — TanStack Query
  // handles re-fetching automatically when project._id changes.
  useEffect(() => {
    if (project?._id) {
      setSelectedVideo(null);
      setObsPage(1);
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

    const shouldPoll = isProjectActive || hasActiveVideos || isReprocessing || isAiInfoOpen;

    if (!shouldPoll) return;

    // Poll every 3 seconds (or while AI modal is open so logs update without page reload)
    const intervalId = setInterval(() => {
      // Refresh videos to get latest AI status
      refetchVideos();

      // Refresh project to get latest overall status
      if (setSelectedProject) {
        api(`/api/projects/get-project/${project._id}`, 'GET')
          .then(({ data }) => {
            if (data?.data) {
              // Only update if something changed (React will handle deep equality or ref check, 
              // but passing new object is fine for now to ensure UI sync)
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
    isAiInfoOpen,
    refetchVideos,
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
        refetchMetadata();
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to add metadata';
        showAlert(errorMessage, 'error');
        console.error('Metadata update failed:', response);
      }
    } catch (error) {
      console.error('Error adding metadata:', error);
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
        refetchMetadata();
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to update metadata';
        showAlert(errorMessage, 'error');
        console.error('Metadata update failed:', response);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
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
        // Refresh project data after a short delay
        setTimeout(async () => {
          if (setSelectedProject) {
            try {
              const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
              if (data?.data) {
                setSelectedProject(data.data);
              }
            } catch (refreshError) {
              // Silently fail on refresh error
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

  // Combine user-created Snapshot docs with AI-generated observation snapshots.
  // AI pipeline writes snapshots to Observation.snapshotUrl (not the Snapshot collection),
  // so without this merge the SNAPSHOTS card would always appear empty for AI-processed videos.
  const displaySnapshots = useMemo(
    () => deriveProjectSnapshots(snapshots, observations),
    [snapshots, observations]
  );


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

  // Derived flag for showing floating AI processing bubble
  const hasActiveAiVideos = projectVideos.some((v) =>
    ['processing', 'uploading'].includes(v.aiProcessingStatus)
  );
  const isProjectAiActive =
    project?.status === 'ai-processing' ||
    project?.status === 'uploading' ||
    project?.status === 'processing';
  const showAiBubble = isReprocessing || isProjectAiActive || hasActiveAiVideos;

  const startReprocessFlow = async () => {
    if (!project?._id) {
      showAlert('Project ID is missing', 'error');
      return;
    }
    setIsReprocessConfirmOpen(false);
    setIsAiInfoOpen(true);
    await handleReprocess();
  };

  const handleStopProcessing = async () => {
    setIsStopConfirmOpen(false);
    setIsStopping(true);
    try {
      const { ok } = await api(`/api/ai/stop/${project._id}`, 'POST');
      if (ok) {
        showAlert('AI processing stopped', 'success');
        setIsAiInfoOpen(false);
        // Force refresh project data so UI reflects 'on-hold' status immediately
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else {
        showAlert('Failed to stop processing', 'error');
      }
    } catch {
      showAlert('Failed to stop processing', 'error');
    } finally {
      setIsStopping(false);
    }
  };

  const handleResetAIData = async () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    try {
      const { ok, data } = await api(`/api/ai/reset/${project._id}`, 'POST');
      if (ok) {
        showAlert(`AI data reset — ${data?.data?.deletedDetections || 0} detections cleared`, 'success');
        setIsAiInfoOpen(false);
        refetchVideos();
        setObsPage(1);
        refetchObservations();
        refetchSnapshots();
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else {
        showAlert('Failed to reset AI data', 'error');
      }
    } catch {
      showAlert('Failed to reset AI data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <DetailHeader
          role="admin"
          project={project}
          allProjects={allProjects}
          onBack={handleBackToProjects}
          onSelectProject={(p) => {
            router.push(`?selectedProject=${p._id}`, { scroll: false });
            setSelectedProject(p);
          }}
          fileInputRef={fileInputRef}
          onVideoUpload={handleVideoUpload}
          onStop={() => setIsStopConfirmOpen(true)}
          onReprocess={() => setIsReprocessConfirmOpen(true)}
          onReset={() => setIsResetConfirmOpen(true)}
          onEdit={() => router.push(`/admin/project/editProject/${project._id}`)}
          isStopping={isStopping}
          isReprocessing={isReprocessing}
          isResetting={isResetting}
        />

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
          {/* Main Content — min-w-0 prevents observation table from blowing out the flex layout */}
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
            <div className='pt-6'>
              <ObservationsPanel
                observations={observations}
                onAddObservation={observationOpen}
                pacpCodes={pacpCodes}
                projectId={project._id}
                theme="rose"
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
                  refetchObservations();
                }}
              />
            </div>            
          </div>

          {/* Right Sidebar — shrink-0 keeps it at exactly 320px regardless of left content size */}
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
                  {displaySnapshots.length > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {displaySnapshots.length}
                    </span>
                  )}
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {isSnapshotsExpanded && (
                <div>
                  {displaySnapshots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">No snapshots available</div>
                    </div>
                  ) : (
                    <div className="relative max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                      {/* Vertical timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      {displaySnapshots.map((snapshot, index) => (
                        <div key={`snapshot-${snapshot.id}-${index}`} className="relative flex items-start space-x-3 py-3">
                          {/* Snapshot dot with color */}
                          <div className={`w-3 h-3 rounded-full ${snapshot.color} relative z-10 border-2 border-white shadow-sm mt-1 shrink-0`}></div>

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
                                    <div className="text-xs text-gray-500 mt-0.5">{snapshot.confidence}% confidence</div>
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
              <button
                onClick={() => setIsRecordingInfoExpanded(!isRecordingInfoExpanded)}
                className="flex items-center justify-between w-full mb-3"
              >
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 border-dashed"
                      onClick={() => setIsAddMetadataOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Field
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white"
                      onClick={openEditMetadata}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <ProjectStatusTimeline statusHistory={project?.statusHistory} role="admin" />
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
            theme="rose"
          />

          <AddCustomMetadataDialog
            open={isAddMetadataOpen}
            onOpenChange={setIsAddMetadataOpen}
            keyValue={newMetadataKey}
            setKeyValue={setNewMetadataKey}
            value={newMetadataValue}
            setValue={setNewMetadataValue}
            onSubmit={handleAddMetadata}
            accent="blue"
          />

          <EditMetadataDialog
            open={isEditMetadataOpen}
            onOpenChange={setIsEditMetadataOpen}
            metadata={editingMetadata}
            setMetadata={setEditingMetadata}
            onSubmit={handleEditMetadata}
            accent="blue"
          />

          <DeleteVideoDialog
            open={isDeleteVideoOpen}
            onOpenChange={setIsDeleteVideoOpen}
            video={videoToDelete}
            onConfirm={handleDeleteVideo}
            loading={deletingVideo}
            onCancel={() => { setIsDeleteVideoOpen(false); setVideoToDelete(null); }}
          />

          <UploadProgressDialog
            open={isUploading}
            progress={uploadProgress}
            accent="blue"
          />
        </div>
      </div>

      {/* Floating AI processing bubble */}
      {showAiBubble && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsAiInfoOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-white shadow-lg border border-violet-100 hover:shadow-xl transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-violet-700">AI processing in progress</p>
              <p className="text-[11px] text-gray-500">
                You can keep working while SewerVision.ai analyzes this project.
              </p>
            </div>
          </button>
        </div>
      )}

      <ReprocessModal
        open={isReprocessConfirmOpen}
        onOpenChange={setIsReprocessConfirmOpen}
        onConfirm={startReprocessFlow}
      />

      <ReprocessModal
        open={isStopConfirmOpen}
        onOpenChange={setIsStopConfirmOpen}
        onConfirm={handleStopProcessing}
        title="Stop AI Processing?"
        description="This will halt the current AI analysis mid-progress. Any detections already found will be kept."
        bullets={[
          'Processing will stop after the current batch completes',
          'Existing detections from this run will remain',
          'Project status will change to "On Hold"',
          'You can reprocess again at any time',
        ]}
        confirmLabel="Yes, stop processing"
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      />

      <ReprocessModal
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        onConfirm={handleResetAIData}
        title="Reset All AI Data?"
        description="This will permanently delete all AI-generated data for this project. This action cannot be undone."
        bullets={[
          'All AI detections will be deleted',
          'All AI-generated observations will be removed',
          'All AI snapshots will be cleared',
          'Project will reset to "Planning" status',
          'Manual observations will be preserved',
        ]}
        confirmLabel="Yes, reset all AI data"
        confirmClassName="bg-orange-600 hover:bg-orange-700 text-white"
      />

      <AiProcessingModal
        open={isAiInfoOpen}
        onOpenChange={setIsAiInfoOpen}
        project={project}
        selectedVideo={selectedVideo}
        logPanelHeight="min-h-[420px] md:min-h-[480px]"
      />

      <ObservationDetailPanel
        open={!!detailObs}
        onOpenChange={(open) => { if (!open) setDetailObs(null); }}
        observation={detailObs}
        projectId={project?._id}
        videoRef={videoRef}
        onDelete={() => {
          refetchObservations();
          setDetailObs(null);
        }}
        onUpdate={() => {
          refetchObservations();
        }}
        onGoToTime={(obs) => {
          if (!videoRef.current || !obs?.time) return;
          const parts = String(obs.time).split(':').map((p) => parseInt(p, 10) || 0);
          const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          videoRef.current.currentTime = seconds;
          setIsPlaying(true);
          videoRef.current.play().catch(() => {});
        }}
      />
    </div>
  );
};

export default ProjectDetail;
