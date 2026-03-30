'use client';

import { MapPin, Calendar, User, AlertCircle, Zap, Ruler } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ProjectInfoCard = ({ project, operatorName }) => {
  const progress = project.progress || 0;
  const confidence = project.confidence ? (project.confidence <= 1 ? Math.round(project.confidence * 100) : Math.round(project.confidence)) : null;
  const totalDefects = project.aiDetections?.total || 0;

  return (
    <Card data-tour="customer-project-info">
      <CardContent className="pt-6 space-y-5">
        {/* Key Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium text-sm">{project.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Inspection Date</p>
              <p className="font-medium text-sm">
                {new Date(project.metadata?.recordingDate || project.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="font-medium text-sm">{operatorName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Defects Found</p>
              <p className="font-semibold text-sm">{totalDefects} issues</p>
            </div>
          </div>
        </div>

        {/* Progress + AI Confidence */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {confidence !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-blue-500" />
                  AI Confidence
                </span>
                <span className="font-semibold text-blue-600">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>
          )}
        </div>

        {/* Metadata Chips */}
        <div className="flex flex-wrap gap-2 pt-1 border-t">
          {project.priority && (
            <Badge variant="outline" className={`capitalize ${priorityColors[project.priority] || ''}`}>
              {project.priority} priority
            </Badge>
          )}
          {project.pipelineMaterial && (
            <Badge variant="outline" className="capitalize">
              {project.pipelineMaterial}
            </Badge>
          )}
          {project.pipelineShape && (
            <Badge variant="outline" className="capitalize">
              {project.pipelineShape}
            </Badge>
          )}
          {project.totalLength && (
            <Badge variant="outline" className="gap-1">
              <Ruler className="h-3 w-3" />
              {project.totalLength}
            </Badge>
          )}
          {project.workOrder && (
            <Badge variant="outline">WO: {project.workOrder}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
