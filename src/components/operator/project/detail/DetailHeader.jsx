import React from 'react';
import {
  ArrowLeft,
  Edit3,
  Loader2,
  Zap,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectSwitcher from '@/components/shared/ProjectSwitcher';

const DetailHeader = ({
  project,
  allProjects,
  fileInputRef,
  handleVideoUpload,
  handleBackToProjects,
  setSelectedProject,
  router,
  isReprocessing,
  setIsReprocessConfirmOpen,
  isResetting,
  setIsResetConfirmOpen,
}) => {
  return (
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
  );
};

export default DetailHeader;
