'use client';

import { MapPin, AlertCircle, Eye, Clock, FileText, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { statusConfig } from '@/components/customer/constants';
import ProgressPipeline from '@/components/customer/projects/ProgressPipeline';

const priorityBorder = {
  high: 'border-l-red-500',
  medium: 'border-l-orange-400',
  low: 'border-l-emerald-500',
};

const ProjectCard = ({ project, onView }) => {
  const config = statusConfig[project.status] || { label: 'In Progress', bgColor: 'bg-gray-100 text-gray-800' };
  const progress = project.progress || 0;
  const confidence = project.confidence ? (project.confidence <= 1 ? Math.round(project.confidence * 100) : Math.round(project.confidence)) : null;
  const borderClass = priorityBorder[project.priority] || 'border-l-gray-300';

  const getOperatorName = () => {
    if (project.assignedOperator?.userId) {
      const firstName = project.assignedOperator.userId.first_name || '';
      const lastName = project.assignedOperator.userId.last_name || '';
      return `${firstName} ${lastName}`.trim() || project.assignedOperator.name || 'Not Assigned';
    }
    return project.assignedOperator?.name || 'Not Assigned';
  };

  const totalDefects = project.aiDetections?.total || 0;

  return (
    <Card
      className={`border-l-4 ${borderClass} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}
      onClick={() => onView(project._id)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="space-y-3">
          {/* Progress Pipeline */}
          <ProgressPipeline currentStatus={project.status} size="sm" />

          {/* Header Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            </div>
            <Badge variant="outline" className={`${config.bgColor} flex-shrink-0 text-xs`}>
              {config.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="font-medium truncate text-sm">{getOperatorName()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium text-sm">
                {new Date(project.metadata?.recordingDate || project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {project.totalLength || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {project.videoCount || 0} vid
              </span>
              {confidence !== null && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-blue-600 font-medium">{confidence}%</span>
                </span>
              )}
            </div>

            {/* Defect Count */}
            {totalDefects > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${totalDefects >= 10 ? 'bg-red-500' : totalDefects >= 5 ? 'bg-orange-400' : 'bg-emerald-500'}`} />
                <span className={`text-xs font-semibold ${totalDefects >= 10 ? 'text-red-600' : totalDefects >= 5 ? 'text-orange-500' : 'text-emerald-600'}`}>
                  {totalDefects} defect{totalDefects !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <span className="text-xs text-emerald-600 font-medium">No defects</span>
            )}
          </div>

          {/* View Button */}
          <button
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 pt-2 border-t transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onView(project._id);
            }}
          >
            View Project
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
