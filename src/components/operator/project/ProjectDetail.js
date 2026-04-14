import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Maximize,
  Settings,
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Edit3,
  PlayCircle,
  Loader2,
  Trash2,
  Clock,
  Film,
  FileVideo,
  Upload,
  MapPin,
  Building2,
  Ruler,
  Calendar,
  CheckCircle2,
  Zap,
  Monitor,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { AiProcessingModal } from '@/components/project/AiProcessingModal';
import { ReprocessModal } from '@/components/project/ReprocessModal';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api, getCookie } from '@/lib/helper';
import { useUploadLimits } from '@/hooks/useUploadLimits';
import { useProjectVideos, useProjectObservations, useProjectSnapshots, useProjectMetadata, usePacpCodes } from '@/hooks/useQueryHooks';
import { useRouter } from 'next/navigation';
import { getVideoUrl, getSnapshotUrl } from '@/lib/getVideoUrl';
import ProjectSwitcher from '@/components/shared/ProjectSwitcher';

const ProjectDetail = ({ project, setSelectedProject, onBack, allProjects = [] }) => {
  const [isRecordingInfoExpanded, setIsRecordingInfoExpanded] = useState(true);
  const [isSnapshotsExpanded, setIsSnapshotsExpanded] = useState(true);
  const [isVideosExpanded, setIsVideosExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const uploadLimits = useUploadLimits();
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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAiInfoOpen, setIsAiInfoOpen] = useState(false);

  // Video list state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDeleteVideoOpen, setIsDeleteVideoOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [myDevices, setMyDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [updatingDevice, setUpdatingDevice] = useState(false);

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
    // Check if label contains any of the keys
    const labelUpper = label.toUpperCase();
    for (const [key, color] of Object.entries(colorMap)) {
      if (labelUpper.includes(key)) {
        return color;
      }
    }
    return 'bg-gray-400';
  }, []);

  // --- TanStack Query hooks for data fetching ---
  const { data: pacpCodes = [] } = usePacpCodes();

  const {
    data: projectVideos = [],
    isLoading: loadingVideos,
    refetch: refetchVideos,
  } = useProjectVideos(project?._id);

  const {
    data: obsData,
    refetch: refetchObservations,
  } = useProjectObservations(project?._id, obsPage, obsPageSize);
  const observations = obsData?.observations ?? [];
  const obsTotal = obsData?.total ?? 0;

  const {
    data: manualSnapshots = [],
    refetch: refetchSnapshots,
  } = useProjectSnapshots(project?._id);

  const {
    data: projectMetadata = null,
    refetch: refetchMetadata,
  } = useProjectMetadata(project?._id);

  // --- AI detection snapshots (operator-specific merge) ---
  const [aiDetectionSnapshots, setAiDetectionSnapshots] = useState([]);

  useEffect(() => {
    if (!project?._id) {
      setAiDetectionSnapshots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detRes = await api(`/api/qc-technicians/projects/${project._id}/detections`, 'GET');
        if (cancelled) return;
        if (detRes.ok && detRes.data?.data && Array.isArray(detRes.data.data)) {
          setAiDetectionSnapshots(
            detRes.data.data
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
              }))
          );
        } else {
          setAiDetectionSnapshots([]);
        }
      } catch {
        if (!cancelled) setAiDetectionSnapshots([]);
      }
    })();
    return () => { cancelled = true; };
  }, [project?._id, getSnapshotColor]);

  // Merge manual snapshots (from hook) + AI detection snapshots
  const snapshots = useMemo(() => {
    const mapped = (manualSnapshots || []).map((snapshot) => ({
      id: snapshot._id || snapshot.id,
      distance: snapshot.distance || 'N/A',
      label: snapshot.label || 'Unlabeled',
      timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
      color: snapshot.color || getSnapshotColor(snapshot.label),
      imageUrl: snapshot.imageUrl,
    }));
    return [...mapped, ...aiDetectionSnapshots];
  }, [manualSnapshots, aiDetectionSnapshots, getSnapshotColor]);

  // Auto-select first video when videos load and no video is selected
  useEffect(() => {
    if (projectVideos.length > 0 && !selectedVideo) {
      setSelectedVideo(projectVideos[0]);
    } else if (selectedVideo?._id) {
      const updated = projectVideos.find((v) => v._id === selectedVideo._id);
      if (updated && updated !== selectedVideo) {
        setSelectedVideo(updated);
      }
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
      router.push(`/qc-technician/project`);
    } else if (currentPath.includes('/operator')) {
      router.push(`/operator/project`);
    } else {
      router.push(`/admin/project`);
    }
  };

  const fetchMyDevices = useCallback(async () => {
    if (!userId) return;
    try {
      const { ok, data } = await api(`/api/devices/get-all-devices?operatorId=${userId}`, 'GET');
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setMyDevices(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Fetch my devices:', e);
      setMyDevices([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyDevices();
  }, [fetchMyDevices]);

  useEffect(() => {
    const deviceId = project?.assignedDevice?._id ?? project?.assignedDevice;
    setSelectedDeviceId(deviceId || '');
  }, [project?._id, project?.assignedDevice]);

  const handleSetDevice = useCallback(async () => {
    if (!project?._id || !user_id) return;
    setUpdatingDevice(true);
    try {
      const form = new FormData();
      form.append('projectData', JSON.stringify({ assignedDevice: selectedDeviceId || null }));
      const { ok } = await api(`/api/projects/update-project/${project._id}/${user_id}`, 'PUT', form);
      if (ok) {
        showAlert('Device updated for this project', 'success');
        setSelectedProject?.((p) => (p?._id === project._id ? { ...p, assignedDevice: myDevices.find((d) => d._id === selectedDeviceId) || p.assignedDevice } : p));
      } else {
        showAlert('Failed to update device', 'error');
      }
    } catch (e) {
      showAlert(e?.message || 'Failed to update device', 'error');
    } finally {
      setUpdatingDevice(false);
    }
  }, [project?._id, user_id, selectedDeviceId, myDevices, showAlert, setSelectedProject]);

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
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

      xhr.open('POST', `${apiUrl}/api/videos/upload`);
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

  // Reset UI state when project changes (hooks handle data fetching via key change)
  useEffect(() => {
    setSelectedVideo(null);
    setObsPage(1);
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

  const handleResetAIData = async () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    try {
      const { ok, data } = await api(`/api/ai/reset/${project._id}`, 'POST');
      if (ok) {
        showAlert(`AI data reset — ${data?.data?.deletedDetections || 0} detections cleared`, 'success');
        setIsAiInfoOpen(false);
        refetchVideos(); setObsPage(1); refetchObservations(); refetchSnapshots();
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else showAlert('Failed to reset AI data', 'error');
    } catch { showAlert('Failed to reset AI data', 'error'); }
    finally { setIsResetting(false); }
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleVideoUpload}
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,.mp4,.webm,.mov,.avi,.mpeg"
                className="hidden"
              />

              {/* Reprocess AI Button - Show for applicable statuses */}
              {project?.status !== 'planning' && project?.status !== 'in-progress' && (
                <Button
                  onClick={() => setIsReprocessConfirmOpen(true)}
                  disabled={isReprocessing}
                  className={`flex items-center gap-2 transition-all duration-300 ${isReprocessing
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-200'
                    : 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800'
                    } text-white`}
                >
                  {isReprocessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Reprocessing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Reprocess AI</span>
                    </>
                  )}
                </Button>
              )}

              {/* Reset AI Data Button — operator can reset */}
              {project?.aiDetections?.total > 0 && project?.status !== 'ai-processing' && (
                <Button onClick={() => setIsResetConfirmOpen(true)} disabled={isResetting} variant="outline"
                  className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                  {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  <span>{isResetting ? 'Resetting...' : 'Reset AI Data'}</span>
                </Button>
              )}

              {/* Edit Button - Navigates to edit project */}
              <Button
                onClick={() => router.push(`/admin/project/editProject/${project._id}`)}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-xl"
                title="Edit Project"
              >
                <Edit3 className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Error Banner */}
        {project?.uploadError && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">Video Upload Failed</p>
              <p className="text-xs text-red-600 truncate">{project.uploadError}</p>
            </div>
          </div>
        )}
        {project?.status === 'uploading' && !project?.uploadError && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Video Uploading</p>
              <p className="text-xs text-blue-600">Video is being uploaded in the background.</p>
            </div>
          </div>
        )}

        <div className="flex gap-6 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Project Info Banner */}
            {project && (
              <div className={`border rounded-2xl p-6 mb-6 transition-all duration-300 shadow-sm backdrop-blur-sm ${isReprocessing
                ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-blue-200 shadow-lg shadow-blue-100/50'
                : `bg-gradient-to-r ${statusGradient.banner} ${statusGradient.bannerBorder}`
                }`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                      <Badge variant="outline" className={`${statusGradient.text} border-current`}>
                        {project.status?.replace('-', ' ').toUpperCase() || 'ACTIVE'}
                      </Badge>
                    </div>

                    {/* Info Pills */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{project.client}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        <Ruler className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{project.totalLength}</span>
                      </div>
                      {(project.estimatedCompletion || project.estimated_completion) && (
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">
                            Due: {new Date(project.estimatedCompletion || project.estimated_completion).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Device: {project.assignedDevice?.name || (project.assignedDevice ? '—' : 'Not set')}
                          {(project.assignedDevice?._id ?? project.assignedDevice) && userData?.role === 'operator' && (
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800 text-sm font-normal"
                              onClick={() => router.push(`/operator/equipement/${project.assignedDevice?._id ?? project.assignedDevice}`)}
                            >
                              View device
                            </Button>
                          )}
                        </span>
                      </div>
                      {userData?.role === 'operator' && myDevices.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedDeviceId || '__none__'}
                            onValueChange={(value) =>
                              setSelectedDeviceId(value === '__none__' ? '' : value)
                            }
                          >
                            <SelectTrigger className="h-9 w-[200px] bg-white/80 border-gray-200">
                              <SelectValue placeholder="Select device..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">None</SelectItem>
                              {myDevices.map((d) => (
                                <SelectItem key={d._id} value={d._id}>{d.name} {d.serialNumber ? `(${d.serialNumber})` : ''}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={handleSetDevice} disabled={updatingDevice}>
                            {updatingDevice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set device'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right min-w-[100px]">
                      <div className="text-sm text-gray-500 font-medium">Progress</div>
                      {isReprocessing ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">Processing</span>
                        </div>
                      ) : project.status === 'ai-processing' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                          <span className="text-lg font-bold text-violet-600">AI Active</span>
                        </div>
                      ) : (
                        <div className={`text-2xl font-bold bg-gradient-to-r ${statusGradient.textGradient} bg-clip-text text-transparent`}>
                          {project.progress}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar with animation during reprocessing */}
                {(isReprocessing || project.status === 'ai-processing') && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full bg-gradient-to-r ${statusGradient.progressBg} animate-pulse`}
                        style={{ width: isReprocessing ? '30%' : `${project.progress}%`, transition: 'width 0.3s ease' }}>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {isReprocessing ? 'Starting AI reprocessing...' : 'AI is analyzing the video footage'}
                    </p>
                  </div>
                )}
              </div>
            )}

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

                  {/* Mark Defect floating button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) videoRef.current.pause();
                      setIsPlaying(false);
                      observationOpen();
                    }}
                    className="absolute bottom-16 right-4 z-30 flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-lg transition-all opacity-80 hover:opacity-100"
                    title="Mark defect at current timestamp (or Shift+click for quick mark)"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Mark Defect
                  </button>

                  {/* Custom Controls */}
                  <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center space-x-4 bg-black bg-opacity-50 py-2 rounded z-20" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    {/* Progress bar with observation markers */}
                    <div
                      className="flex-1 h-1 bg-gray-600 rounded cursor-pointer relative"
                      onClick={onSeek}
                    >
                      <div
                        className="h-1 bg-blue-600 rounded"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      {/* Observation dots on progress bar */}
                      {duration > 0 && observations.map((obs, i) => {
                        const parts = String(obs.time || '').split(':').map(Number);
                        const sec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                        const pct = (sec / duration) * 100;
                        if (pct < 0 || pct > 100) return null;
                        return (
                          <div key={i} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 border border-white/50 z-10"
                            style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
                            title={`${obs.pacpCode || 'Defect'} at ${obs.time}`}
                          />
                        );
                      })}
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
            <div className="mt-6">
              <ObservationsPanel
                observations={observations}
                onAddObservation={observationOpen}
                theme="blue"
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
                  refetchObservations();
                }}
              />
            </div>
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="w-80 shrink-0 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 space-y-5 shadow-sm h-fit">
            {/* Project Videos Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl p-4 border border-blue-100/50 dark:border-blue-500/15">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsVideosExpanded(!isVideosExpanded)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {isVideosExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-semibold text-sm">PROJECT VIDEOS</span>
                  </button>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    {projectVideos.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {loadingVideos && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={triggerUpload}
                    disabled={isUploading}
                    title="Upload Video"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Plus className="h-4 w-4 text-blue-600" />}
                  </Button>
                </div>
              </div>

              {isVideosExpanded && (
                <div className="space-y-2">
                  {projectVideos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white/60 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Film className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">No videos uploaded</p>
                      <p className="text-xs text-gray-400 mb-3">Upload a video to get started</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={triggerUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                        {isUploading ? 'Uploading...' : 'Upload Video'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {projectVideos.map((video) => (
                        <div
                          key={video._id}
                          onClick={() => setSelectedVideo(video)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedVideo?._id === video._id
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {video.originalName || video.filename}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(video.fileSize)}
                                </span>
                                <Badge
                                  variant={video.aiProcessingStatus === 'completed' ? 'default' :
                                    video.aiProcessingStatus === 'processing' ? 'secondary' : 'outline'}
                                  className={`text-[10px] px-1.5 py-0 ${video.aiProcessingStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''
                                    }`}
                                >
                                  {video.aiProcessingStatus === 'pending' ? 'Ready for AI' : video.aiProcessingStatus}
                                </Badge>
                              </div>

                              {/* Uploader info */}
                              {video.uploadedBy && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={video.uploadedBy.avatar} />
                                    <AvatarFallback className="text-[10px]">
                                      {video.uploadedBy.first_name?.[0] || video.uploadedBy.username?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500 truncate">
                                    {video.uploadedBy.first_name
                                      ? `${video.uploadedBy.first_name} ${video.uploadedBy.last_name || ''}`
                                      : video.uploadedBy.username}
                                  </span>
                                </div>
                              )}

                              {/* Upload date */}
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {new Date(video.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {selectedVideo?._id === video._id && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              )}
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoToDelete(video);
                                    setIsDeleteVideoOpen(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Delete video"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
                    <Button size="sm" className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white" onClick={openEditMetadata}>
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
            theme="blue"
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
            onCancel={() => setVideoToDelete(null)}
            loading={deletingVideo}
          />

          <UploadProgressDialog open={isUploading} progress={uploadProgress} accent="blue" />
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
        description="Reprocessing will send this project's video back through the AI pipeline. This can take several minutes depending on video length and system load, but you can safely continue working while it runs."
        bullets={[
          'Existing AI detections may be updated with the latest model.',
          'New detections can appear if the model finds additional issues.',
          'Project status will reflect active AI processing.',
        ]}
      />

      <ReprocessModal open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} onConfirm={handleResetAIData}
        title="Reset All AI Data?" description="This will permanently delete all AI-generated data for this project."
        bullets={['All AI detections deleted', 'All AI observations removed', 'All AI snapshots cleared', 'Project resets to "Planning"', 'Manual observations preserved']}
        confirmLabel="Yes, reset all AI data" confirmClassName="bg-orange-600 hover:bg-orange-700 text-white" />

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
        onDelete={() => { refetchObservations(); setDetailObs(null); }}
        onUpdate={() => { refetchObservations(); }}
        onGoToTime={(obs) => { if (!videoRef.current || !obs?.time) return; const pts = String(obs.time).split(':').map((p) => parseInt(p, 10) || 0); videoRef.current.currentTime = pts[0] * 3600 + pts[1] * 60 + pts[2]; setIsPlaying(true); videoRef.current.play().catch(() => {}); }}
      />
    </div>
  );
};

export default ProjectDetail;
