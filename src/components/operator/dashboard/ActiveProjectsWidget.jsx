'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Video, Clock, ChevronRight, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { useMyActiveProjects, useCreateActivity } from '@/data/pipelineApi';
import { PipelineProgressBar } from '@/components/shared/ProjectPipeline';
import { useAlert } from '@/components/providers/AlertProvider';

const ActiveProjectsWidget = ({ userId, onProjectClick }) => {
  const { data: projectsData, isLoading } = useMyActiveProjects(userId);
  const createActivity = useCreateActivity();
  const { showAlert } = useAlert();
  const projects = projectsData?.data || [];

  if (isLoading) {
    return (
      <Card className="mb-6 border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="min-w-[280px] h-44 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) return null;

  const handleAddNote = (projectId) => {
    const note = prompt('Add a field note:');
    if (!note?.trim()) return;
    createActivity.mutate(
      { projectId, type: 'field_note', message: note.trim(), userId },
      {
        onSuccess: (res) => {
          if (res?.ok) showAlert('Field note added', 'success');
          else showAlert('Failed to add note', 'error');
        },
      }
    );
  };

  return (
    <Card className="mb-6 border-gray-200 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Video className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">My Active Projects</h3>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
              {projects.length}
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          {projects.map((project) => (
            <div
              key={project._id}
              className="min-w-[280px] max-w-[300px] bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer shrink-0 group"
              onClick={() => onProjectClick?.(project)}
            >
              {/* Progress Bar */}
              <div className="mb-3">
                <PipelineProgressBar currentStatus={project.status} size="sm" showLabels={false} />
              </div>

              {/* Project Name */}
              <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                {project.name}
              </h4>

              {/* Details Row */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                {project.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {project.location}
                  </span>
                )}
                {project.videoCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" /> {project.videoCount}
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {project.status?.replace('-', ' ')}
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 flex-1"
                  onClick={(e) => { e.stopPropagation(); handleAddNote(project._id); }}
                >
                  <AlertTriangle className="w-3 h-3" /> Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 flex-1"
                  onClick={(e) => { e.stopPropagation(); onProjectClick?.(project); }}
                >
                  <ChevronRight className="w-3 h-3" /> Open
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectsWidget;
