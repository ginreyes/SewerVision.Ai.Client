import React from 'react';
import {
  Play,
  Pause,
  Maximize,
  FileVideo,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getVideoUrl } from '@/lib/getVideoUrl';

const VideoPlayer = ({
  project,
  selectedVideo,
  videoRef,
  videoContainerRef,
  isPlaying,
  setIsPlaying,
  currentTime,
  duration,
  observations,
  onTimeUpdate,
  onLoadedMetadata,
  onSeek,
  togglePlay,
  toggleFullScreen,
  observationOpen,
  formatFileSize,
  formatTime,
}) => {
  return (
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
  );
};

export default VideoPlayer;
