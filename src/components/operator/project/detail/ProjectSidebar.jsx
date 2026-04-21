import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Edit3,
  PlayCircle,
  Loader2,
  Trash2,
  Clock,
  Film,
  Upload,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const ProjectSidebar = ({
  // videos
  projectVideos,
  loadingVideos,
  selectedVideo,
  setSelectedVideo,
  isVideosExpanded,
  setIsVideosExpanded,
  isUploading,
  triggerUpload,
  isAdmin,
  setVideoToDelete,
  setIsDeleteVideoOpen,
  formatFileSize,
  // snapshots
  displaySnapshots,
  isSnapshotsExpanded,
  setIsSnapshotsExpanded,
  // recording info
  recordingInfo,
  isRecordingInfoExpanded,
  setIsRecordingInfoExpanded,
  setIsAddMetadataOpen,
  openEditMetadata,
}) => {
  return (
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
  );
};

export default ProjectSidebar;
