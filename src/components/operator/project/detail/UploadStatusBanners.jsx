import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const UploadStatusBanners = ({ project }) => {
  return (
    <>
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
    </>
  );
};

export default UploadStatusBanners;
