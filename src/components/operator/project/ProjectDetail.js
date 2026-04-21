import React, { useState, useEffect, useRef, useMemo } from 'react';
import ObservationsPanel from './ObservationsPanel';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUploadLimits } from '@/hooks/useUploadLimits';
import { useProjectVideos, useProjectObservations, useProjectSnapshots, useProjectMetadata, usePacpCodes } from '@/hooks/useQueryHooks';
import { useRouter } from 'next/navigation';

import DetailHeader from './detail/DetailHeader';
import UploadStatusBanners from './detail/UploadStatusBanners';
import ProjectInfoBanner from './detail/ProjectInfoBanner';
import VideoPlayer from './detail/VideoPlayer';
import ProjectSidebar from './detail/ProjectSidebar';
import ProjectDialogs from './detail/ProjectDialogs';
import AiProcessingBubble from './detail/AiProcessingBubble';
import { getStatusGradient, formatFileSize, formatTime } from './detail/statusGradients';
import { useProjectDetailActions } from './detail/useProjectDetailActions';
import { useProjectVideoUpload } from './detail/useProjectVideoUpload';
import { useProjectDeviceAndPolling } from './detail/useProjectDeviceAndPolling';

const ProjectDetail = ({ project, setSelectedProject, onBack, allProjects = [] }) => {
  // --- UI expansion state ---
  const [isRecordingInfoExpanded, setIsRecordingInfoExpanded] = useState(true);
  const [isSnapshotsExpanded, setIsSnapshotsExpanded] = useState(true);
  const [isVideosExpanded, setIsVideosExpanded] = useState(true);

  // --- Video playback state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // --- Observation / detail state ---
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [detailObs, setDetailObs] = useState(null);
  const [obsPage, setObsPage] = useState(1);
  const obsPageSize = 10;

  // --- Metadata state ---
  const [isAddMetadataOpen, setIsAddMetadataOpen] = useState(false);
  const [isEditMetadataOpen, setIsEditMetadataOpen] = useState(false);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [editingMetadata, setEditingMetadata] = useState({});

  // --- AI / reprocess / reset state ---
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isReprocessConfirmOpen, setIsReprocessConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAiInfoOpen, setIsAiInfoOpen] = useState(false);

  // --- Video list selection ---
  const [selectedVideo, setSelectedVideo] = useState(null);

  // --- Providers / hooks ---
  const uploadLimits = useUploadLimits();
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();
  const user_id = userId;
  const isAdmin = userData?.role === 'admin';

  // --- Data fetching hooks ---
  const { data: pacpCodes = [] } = usePacpCodes();
  const { data: projectVideos = [], isLoading: loadingVideos, refetch: refetchVideos } = useProjectVideos(project?._id);
  const { data: obsData, refetch: refetchObservations } = useProjectObservations(project?._id, obsPage, obsPageSize);
  const observations = obsData?.observations ?? [];
  const obsTotal = obsData?.total ?? 0;
  const { data: manualSnapshots = [], refetch: refetchSnapshots } = useProjectSnapshots(project?._id);
  const { data: projectMetadata = null, refetch: refetchMetadata } = useProjectMetadata(project?._id);

  // --- Video upload / delete ---
  const {
    isUploading, uploadProgress, fileInputRef, handleVideoUpload, triggerUpload,
    isDeleteVideoOpen, setIsDeleteVideoOpen, videoToDelete, setVideoToDelete,
    deletingVideo, handleDeleteVideo,
  } = useProjectVideoUpload({
    project, isAdmin, showAlert, uploadLimits, refetchVideos,
    projectVideos, selectedVideo, setSelectedVideo,
  });

  // --- Device assignment + polling ---
  const {
    myDevices, selectedDeviceId, setSelectedDeviceId, updatingDevice, handleSetDevice,
  } = useProjectDeviceAndPolling({
    project, userId, user_id, showAlert, setSelectedProject,
    projectVideos, refetchVideos, isReprocessing, isAiInfoOpen,
  });

  // --- Metadata + reprocess + reset + snapshots ---
  const {
    snapshots, handleAddMetadata, handleEditMetadata, openEditMetadata,
    startReprocessFlow, handleResetAIData,
  } = useProjectDetailActions({
    project, user_id, setSelectedProject, showAlert,
    projectMetadata, refetchMetadata, refetchVideos,
    refetchObservations, refetchSnapshots, manualSnapshots,
    setObsPage, setIsAiInfoOpen,
    isReprocessing, setIsReprocessing,
    setIsReprocessConfirmOpen, setIsResetConfirmOpen, setIsResetting,
    setIsAddMetadataOpen, setIsEditMetadataOpen,
    newMetadataKey, setNewMetadataKey, newMetadataValue, setNewMetadataValue,
    editingMetadata, setEditingMetadata,
  });

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

  // Reset UI state when project changes (hooks handle data fetching via key change)
  useEffect(() => {
    setSelectedVideo(null);
    setObsPage(1);
  }, [project?._id]);

  // Status-based gradient colors
  const statusGradient = useMemo(() => getStatusGradient(project?.status), [project?.status]);

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

  // --- Video playback handlers ---
  const togglePlay = async (e) => {
    if (e?.preventDefault) { e.preventDefault(); e.stopPropagation(); }
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) { await video.play(); setIsPlaying(true); }
      else { video.pause(); setIsPlaying(false); }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const toggleFullScreen = (e) => {
    if (e?.preventDefault) { e.preventDefault(); e.stopPropagation(); }
    const container = videoContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      else if (container.msRequestFullscreen) container.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

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

  const isObservationClose = () => setIsObservationOpen(false);
  const observationOpen = () => setIsObservationOpen(true);

  // Derived flag for showing floating AI processing bubble
  const hasActiveAiVideos = projectVideos.some((v) =>
    ['processing', 'uploading'].includes(v.aiProcessingStatus)
  );
  const isProjectAiActive =
    project?.status === 'ai-processing' ||
    project?.status === 'uploading' ||
    project?.status === 'processing';
  const showAiBubble = isReprocessing || isProjectAiActive || hasActiveAiVideos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <DetailHeader
          project={project}
          allProjects={allProjects}
          fileInputRef={fileInputRef}
          handleVideoUpload={handleVideoUpload}
          handleBackToProjects={handleBackToProjects}
          setSelectedProject={setSelectedProject}
          router={router}
          isReprocessing={isReprocessing}
          setIsReprocessConfirmOpen={setIsReprocessConfirmOpen}
          isResetting={isResetting}
          setIsResetConfirmOpen={setIsResetConfirmOpen}
        />

        <UploadStatusBanners project={project} />

        <div className="flex gap-6 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ProjectInfoBanner
              project={project}
              statusGradient={statusGradient}
              isReprocessing={isReprocessing}
              userData={userData}
              router={router}
              myDevices={myDevices}
              selectedDeviceId={selectedDeviceId}
              setSelectedDeviceId={setSelectedDeviceId}
              handleSetDevice={handleSetDevice}
              updatingDevice={updatingDevice}
            />

            <VideoPlayer
              project={project}
              selectedVideo={selectedVideo}
              videoRef={videoRef}
              videoContainerRef={videoContainerRef}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              currentTime={currentTime}
              duration={duration}
              observations={observations}
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onSeek={onSeek}
              togglePlay={togglePlay}
              toggleFullScreen={toggleFullScreen}
              observationOpen={observationOpen}
              formatFileSize={formatFileSize}
              formatTime={formatTime}
            />

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
                onDeleteObservation={() => { refetchObservations(); }}
              />
            </div>
          </div>

          <ProjectSidebar
            projectVideos={projectVideos}
            loadingVideos={loadingVideos}
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
            isVideosExpanded={isVideosExpanded}
            setIsVideosExpanded={setIsVideosExpanded}
            isUploading={isUploading}
            triggerUpload={triggerUpload}
            isAdmin={isAdmin}
            setVideoToDelete={setVideoToDelete}
            setIsDeleteVideoOpen={setIsDeleteVideoOpen}
            formatFileSize={formatFileSize}
            displaySnapshots={displaySnapshots}
            isSnapshotsExpanded={isSnapshotsExpanded}
            setIsSnapshotsExpanded={setIsSnapshotsExpanded}
            recordingInfo={recordingInfo}
            isRecordingInfoExpanded={isRecordingInfoExpanded}
            setIsRecordingInfoExpanded={setIsRecordingInfoExpanded}
            setIsAddMetadataOpen={setIsAddMetadataOpen}
            openEditMetadata={openEditMetadata}
          />

          <ProjectDialogs
            isObservationOpen={isObservationOpen}
            isObservationClose={isObservationClose}
            project={project}
            user_id={user_id}
            pacpCodes={pacpCodes}
            displaySnapshots={displaySnapshots}
            videoRef={videoRef}
            currentTime={currentTime}
            isAddMetadataOpen={isAddMetadataOpen}
            setIsAddMetadataOpen={setIsAddMetadataOpen}
            newMetadataKey={newMetadataKey}
            setNewMetadataKey={setNewMetadataKey}
            newMetadataValue={newMetadataValue}
            setNewMetadataValue={setNewMetadataValue}
            handleAddMetadata={handleAddMetadata}
            isEditMetadataOpen={isEditMetadataOpen}
            setIsEditMetadataOpen={setIsEditMetadataOpen}
            editingMetadata={editingMetadata}
            setEditingMetadata={setEditingMetadata}
            handleEditMetadata={handleEditMetadata}
            isDeleteVideoOpen={isDeleteVideoOpen}
            setIsDeleteVideoOpen={setIsDeleteVideoOpen}
            videoToDelete={videoToDelete}
            setVideoToDelete={setVideoToDelete}
            handleDeleteVideo={handleDeleteVideo}
            deletingVideo={deletingVideo}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isReprocessConfirmOpen={isReprocessConfirmOpen}
            setIsReprocessConfirmOpen={setIsReprocessConfirmOpen}
            startReprocessFlow={startReprocessFlow}
            isResetConfirmOpen={isResetConfirmOpen}
            setIsResetConfirmOpen={setIsResetConfirmOpen}
            handleResetAIData={handleResetAIData}
            isAiInfoOpen={isAiInfoOpen}
            setIsAiInfoOpen={setIsAiInfoOpen}
            selectedVideo={selectedVideo}
            detailObs={detailObs}
            setDetailObs={setDetailObs}
            refetchObservations={refetchObservations}
            setIsPlaying={setIsPlaying}
          />
        </div>
      </div>

      <AiProcessingBubble showAiBubble={showAiBubble} setIsAiInfoOpen={setIsAiInfoOpen} />
    </div>
  );
};

export default ProjectDetail;
