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
  X,
  RefreshCw,
  Loader2,
  Video,
  Trash2,
  User,
  Clock,
  Film,
  FileVideo,
  Upload,
  MapPin,
  Building2,
  Ruler,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AddObservation from './AddObersavation';
import ObservationsPanel from './ObservationsPanel';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';
import { useRouter } from 'next/navigation';
import { getVideoUrl } from '@/lib/getVideoUrl';

const ProjectDetail = ({ project, setSelectedProject }) => {
  const [isRecordingInfoExpanded, setIsRecordingInfoExpanded] = useState(true);
  const [isSnapshotsExpanded, setIsSnapshotsExpanded] = useState(true);
  const [isVideosExpanded, setIsVideosExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [pacpCodes, setPacpCodes] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [projectMetadata, setProjectMetadata] = useState(null);
  const [isAddMetadataOpen, setIsAddMetadataOpen] = useState(false);
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [editingMetadata, setEditingMetadata] = useState({});
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Video list state
  const [projectVideos, setProjectVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
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
      router.replace(`/qc-technician/project`);
    } else {
      router.replace(`/admin/project`);
    }
  };

  const fetchpacpCodes = useCallback(async () => {
    try {
      const { ok, data } = await api('/api/pacpcodes/get-all-pacpcodes', 'GET');

      if (!ok) {
        showAlert('Failed to load pacpcodes', 'error');
      } else {
        setPacpCodes(data.codes);
      }
    } catch (error) {
      console.error(`error fetching pacpcodes: ${error.message}`, 'error');
    }
  }, [showAlert]);

  useEffect(() => {
    fetchpacpCodes();
  }, [fetchpacpCodes]);

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

  const fetchSnapshots = useCallback(async () => {
    if (!project?._id) return;
    try {
      const { ok, data } = await api(`/api/snapshots/get-all-snapshots?projectId=${project._id}`, 'GET');
      if (ok && data) {
        const formattedSnapshots = Array.isArray(data) ? data.map((snapshot) => ({
          id: snapshot._id || snapshot.id,
          distance: snapshot.distance || 'N/A',
          label: snapshot.label || 'Unlabeled',
          timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
          color: snapshot.color || getSnapshotColor(snapshot.label),
          imageUrl: snapshot.imageUrl,
        })) : [];
        setSnapshots(formattedSnapshots);
      } else if (project?.snapshots && Array.isArray(project.snapshots)) {
        // Fallback to project snapshots if API fails
        const formattedSnapshots = project.snapshots.map((snapshot) => ({
          id: snapshot._id || snapshot.id,
          distance: snapshot.distance || 'N/A',
          label: snapshot.label || 'Unlabeled',
          timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
          color: snapshot.color || getSnapshotColor(snapshot.label),
          imageUrl: snapshot.imageUrl,
        }));
        setSnapshots(formattedSnapshots);
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      // Fallback to project snapshots if available
      if (project?.snapshots && Array.isArray(project.snapshots)) {
        const formattedSnapshots = project.snapshots.map((snapshot) => ({
          id: snapshot._id || snapshot.id,
          distance: snapshot.distance || 'N/A',
          label: snapshot.label || 'Unlabeled',
          timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
          color: snapshot.color || getSnapshotColor(snapshot.label),
          imageUrl: snapshot.imageUrl,
        }));
        setSnapshots(formattedSnapshots);
      }
    }
  }, [project?._id, project?.snapshots, getSnapshotColor]);

  const fetchProjectMetadata = useCallback(async () => {
    // First, initialize from project prop if available
    if (project?.metadata && typeof project.metadata === 'object') {
      setProjectMetadata(project.metadata);
    }

    if (!project?._id) {
      return;
    }

    try {
      const { ok, data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
      if (ok && data?.data) {
        const metadata = data.data.metadata || {};
        setProjectMetadata(metadata);
      } else if (project?.metadata && typeof project.metadata === 'object') {
        // Fallback to project metadata if API fails
        setProjectMetadata(project.metadata);
      }
    } catch (error) {
      console.error('Error fetching project metadata:', error);
      // Fallback to project metadata if available
      if (project?.metadata && typeof project.metadata === 'object') {
        setProjectMetadata(project.metadata);
      }
    }
  }, [project?._id, project?.metadata]);

  // Fetch project videos
  const fetchProjectVideos = useCallback(async () => {
    if (!project?._id) return;

    setLoadingVideos(true);
    try {
      const { ok, data } = await api(`/api/videos/project/${project._id}`, 'GET');
      if (ok && data?.data) {
        setProjectVideos(data.data);
        // Auto-select first video if none selected
        if (data.data.length > 0 && !selectedVideo) {
          setSelectedVideo(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching project videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  }, [project?._id, selectedVideo]);

  // Handle video deletion (admin only)
  const handleDeleteVideo = async () => {
    if (!videoToDelete || !isAdmin) return;

    setDeletingVideo(true);
    try {
      const { ok } = await api(`/api/videos/${videoToDelete._id}`, 'DELETE');
      if (ok) {
        showAlert('Video deleted successfully', 'success');
        setProjectVideos(prev => prev.filter(v => v._id !== videoToDelete._id));
        if (selectedVideo?._id === videoToDelete._id) {
          setSelectedVideo(projectVideos.length > 1 ? projectVideos.find(v => v._id !== videoToDelete._id) : null);
        }
        setIsDeleteVideoOpen(false);
        setVideoToDelete(null);
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
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert('Video file is too large. Maximum size is 500MB.', 'error');
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
          fetchProjectVideos();
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

  useEffect(() => {
    if (project?._id) {
      fetchSnapshots();
      fetchProjectMetadata();
      fetchProjectVideos();
    }
  }, [project?._id, fetchSnapshots, fetchProjectMetadata, fetchProjectVideos]);

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
      fetchProjectVideos();

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
    fetchProjectVideos,
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

      console.log('Metadata update response:', response);

      if (response.ok) {
        showAlert('Custom metadata added successfully', 'success');
        setProjectMetadata(updatedMetadata);
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
        fetchProjectMetadata();
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

      console.log('Metadata edit response:', response);

      if (response.ok) {
        showAlert('Metadata updated successfully', 'success');
        setProjectMetadata(editingMetadata);
        setIsEditMetadataOpen(false);
        // Refresh project data
        if (setSelectedProject) {
          const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
          if (data?.data) {
            setSelectedProject(data.data);
          }
        }
        // Also refresh local metadata
        fetchProjectMetadata();
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
      console.log('🔄 Starting reprocess for project:', project._id);

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

      // Safely log response
      try {
        console.log('📥 Reprocess response status:', response?.status, 'ok:', response?.ok);
        if (response?.data) {
          // Use a replacer function to handle circular references
          const seen = new WeakSet();
          const safeStringify = (obj) => {
            try {
              return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                  if (seen.has(value)) {
                    return '[Circular]';
                  }
                  seen.add(value);
                }
                return value;
              }, 2);
            } catch (e) {
              return String(obj);
            }
          };
          console.log('📥 Reprocess response data:', safeStringify(response.data));
        }
      } catch (logError) {
        console.log('📥 Reprocess response received (could not log details)');
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
              try {
                const refreshErrorMsg = refreshError?.message || refreshError?.toString() || 'Unknown error';
                // Use console.log instead of console.error to avoid Next.js error handler interception
                console.log('Failed to refresh project data:', refreshErrorMsg);
              } catch (e) {
                // Silently fail if we can't log the error
              }
            }
          }
        }, 2000);
      } else {
        const errorMessage = response?.data?.error || response?.data?.message || response?.data?.details || `Failed to start reprocessing (Status: ${response?.status || 'unknown'})`;
        // Use console.log instead of console.error to avoid Next.js error handler interception
        try {
          console.log('❌ Reprocess error:', errorMessage);
        } catch (e) {
          // Silently fail if we can't log
        }
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

      // Use console.log instead of console.error to avoid Next.js error handler interception
      try {
        console.log('❌ Error reprocessing video:', errorMessage);
      } catch (logError) {
        // Silently fail if we can't log
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
                <ChevronDown className="h-4 w-4 text-gray-400" />
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
                  onClick={handleReprocess}
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

              {/* Settings Button - Navigates to edit project */}
              <Button
                onClick={() => router.push(`/admin/project/editProject/${project._id}`)}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 rounded-xl"
                title="Project Settings"
              >
                <Settings className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
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

            {/* Progress bar (project progress) */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">{formatTime(currentTime)}</div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Rewind className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button onClick={togglePlay} className="p-1 hover:bg-gray-100 rounded">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <FastForward className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500 mx-2">2X</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar (project progress) */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${project?.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Observations Section */}
            <ObservationsPanel
              observations={project.observations}
              onAddObservation={observationOpen}
              pacpCodes={pacpCodes}
              projectId={project._id}
            />
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="w-80 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 space-y-5 shadow-sm h-fit">
            {/* Project Videos Section */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-100/50">
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
                    <div className="relative">
                      {/* Vertical timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      {displaySnapshots.map((snapshot, index) => (
                        <div key={`snapshot-${snapshot.id}-${index}`} className="relative flex items-center space-x-3 py-3">
                          {/* Snapshot dot with color */}
                          <div className={`w-3 h-3 rounded-full ${snapshot.color} relative z-10 border-2 border-white shadow-sm`}></div>

                          {/* Snapshot content */}
                          <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{snapshot.distance || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{snapshot.label}</div>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsRecordingInfoExpanded(!isRecordingInfoExpanded)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    {isRecordingInfoExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="font-medium">Recording Information</span>
                  </button>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {isRecordingInfoExpanded && (
                <div className="space-y-4">
                  {Object.entries(recordingInfo).map(([key, value], index) => (
                    <div
                      key={`${key}-${index}`}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
                    </div>
                  ))}

                  <div className="flex space-x-2 mt-4">
                    <Button
                      className="flex-1 text-blue-600 border border-blue-600 px-3 py-1.5 rounded-md text-sm hover:bg-blue-50 flex items-center justify-center space-x-1"
                      variant="outline"
                      onClick={() => setIsAddMetadataOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      <span>ADD CUSTOM METADATA</span>
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                    onClick={openEditMetadata}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Metadata</span>
                  </Button>
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
          />

          {/* Add Custom Metadata Dialog */}
          <Dialog open={isAddMetadataOpen} onOpenChange={setIsAddMetadataOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Metadata</DialogTitle>
                <DialogDescription>
                  Add a custom key-value pair to the project metadata
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="metadataKey">Key</Label>
                  <Input
                    id="metadataKey"
                    placeholder="e.g., Inspection Type"
                    value={newMetadataKey}
                    onChange={(e) => setNewMetadataKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metadataValue">Value</Label>
                  <Input
                    id="metadataValue"
                    placeholder="e.g., Routine Inspection"
                    value={newMetadataValue}
                    onChange={(e) => setNewMetadataValue(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMetadataOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMetadata}>
                  Add Metadata
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Metadata Dialog */}
          <Dialog open={isEditMetadataOpen} onOpenChange={setIsEditMetadataOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Metadata</DialogTitle>
                <DialogDescription>
                  Edit the project metadata fields
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {Object.keys(editingMetadata).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No metadata to edit</p>
                ) : (
                  Object.entries(editingMetadata).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`metadata-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={`metadata-${key}`}
                        value={value || ''}
                        onChange={(e) => {
                          setEditingMetadata({
                            ...editingMetadata,
                            [key]: e.target.value
                          });
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditMetadataOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMetadata}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Video Confirmation Dialog */}
          <Dialog open={isDeleteVideoOpen} onOpenChange={setIsDeleteVideoOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Video</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this video? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {videoToDelete && (
                <div className="py-4">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="font-medium text-gray-900">{videoToDelete.originalName || videoToDelete.filename}</p>
                    <p className="text-sm text-gray-500">Size: {formatFileSize(videoToDelete.fileSize)}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(videoToDelete.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteVideoOpen(false);
                    setVideoToDelete(null);
                  }}
                  disabled={deletingVideo}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteVideo}
                  disabled={deletingVideo}
                >
                  {deletingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Video
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Upload Progress Modal */}
          <Dialog open={isUploading} onOpenChange={() => { }}>
            <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Uploading Video
                </DialogTitle>
                <DialogDescription>
                  Please wait while your video is being uploaded...
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                {/* Progress Circle */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * uploadProgress) / 100}
                        className="text-blue-600 transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{uploadProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}% complete</span>
                  </div>
                </div>

                {/* Processing indicator */}
                {uploadProgress === 100 && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Processing video...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
