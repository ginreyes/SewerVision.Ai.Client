import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [pacpCodes, setPacpCodes] = useState([]);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  const { userId } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  const user_id = userId;

  const handleBackToProjects = () => {
    setSelectedProject(null);
    router.replace(`/admin/project`);
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

  // Play/pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullScreen = () => {
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

  // Enhanced snapshots with proper fallback
  const snapshots = project?.snapshots?.length > 0
    ? project.snapshots.map((snapshot) => ({
        ...snapshot,
        color: snapshot.color || getSnapshotColor(snapshot.label), // Ensure color exists
      }))
    : [
        { id: 1, distance: '0.00ft', label: 'MWL', color: 'bg-purple-500' },
        { id: 2, distance: '0.98ft', label: 'TFA', color: 'bg-orange-500' },
        { id: 3, distance: '38.77ft', label: 'CM', color: 'bg-yellow-500' },
        { id: 4, distance: '', label: 'SAM', color: 'bg-purple-400' },
      ];

  // Helper function to get color based on PACP code
  const getSnapshotColor = (label) => {
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
    return colorMap[label] || 'bg-gray-400';
  };

  const recordingInfo = project?.metadata || {
    recordingDate: '07/26/2022',
    workOrder: '5859483',
    project: 'Riveria Beach',
    totalLength: '129.05ft',
    confidenceScore: '96%',
    upstreamMH: 'MH20',
    downstreamMH: 'MH21',
    shape: 'Circular',
    material: 'PVC',
    remarks: '',
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
    <div className="w-full h-auto bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={handleBackToProjects}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Projects</span>
            </button>

            <span className="text-gray-300">|</span>

            <h1 className="text-xl font-semibold text-gray-900">Project Console</h1>
            <span className="text-gray-400">→</span>
            <span className="text-gray-700">{project?.name || 'Riveria Beach'}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {project?.status === 'ai-processing' ? 'AI Processing' : 'In Progress'}
            </span>
          </div>

          {/* Optional: Add more action buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Project Info Banner */}
          {project && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>📍 {project.location}</span>
                    <span>👤 {project.client}</span>
                    <span>📏 {project.totalLength}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={videoContainerRef} // Attach ref to container div
            className="relative aspect-video bg-black rounded-t-lg overflow-hidden flex flex-col"
          >
            {project?.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={getVideoUrl(project.videoUrl)}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  controls={false}
                />

                {/* Custom Controls */}
                <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center space-x-4 bg-black bg-opacity-50 py-2 rounded">
                  <button onClick={togglePlay} className="text-white">
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
                  <button onClick={toggleFullScreen} className="text-white">
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-white text-lg font-semibold flex items-center justify-center h-full">
                No video available
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

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 space-y-4">
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
                {snapshots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No snapshots available</div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    {snapshots.map((snapshot, index) => (
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
                                <div className="text-xs text-gray-400 mt-1">{snapshot.timestamp}</div>
                              )}
                            </div>
                            <button className="p-1 hover:bg-white rounded-full transition-colors">
                              <PlayCircle className="h-4 w-4 text-blue-600" />
                            </button>
                          </div>
                        </div>

                        {/* Arrow pointing down to next item */}
                        {index < snapshots.length - 1 && (
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
                  >
                    <Plus className="h-4 w-4" />
                    <span>ADD CUSTOM METADATA</span>
                  </Button>
                </div>

                <button className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Metadata</span>
                </button>
              </div>
            )}
          </div>

          <AddObservation
            isOpen={isObservationOpen}
            onClose={isObservationClose}
            project_id={project._id}
            user_id={user_id}
            pacpCodes={pacpCodes}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
