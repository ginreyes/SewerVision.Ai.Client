'use client';

import { MapPin, AlertCircle, Eye, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusConfig } from '@/components/customer/constants';

const ProjectCard = ({ project, onView }) => {
  const config = statusConfig[project.status] || { label: 'In Progress', bgColor: 'bg-gray-100 text-gray-800' };

  const getOperatorName = () => {
    if (project.assignedOperator?.userId) {
      const firstName = project.assignedOperator.userId.first_name || '';
      const lastName = project.assignedOperator.userId.last_name || '';
      return `${firstName} ${lastName}`.trim() || project.assignedOperator.name || 'Not Assigned';
    }
    return project.assignedOperator?.name || 'Not Assigned';
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onView(project._id)}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <Badge variant="outline" className={config.bgColor}>
              {config.label}
            </Badge>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Operator</p>
              <p className="text-sm font-medium truncate">{getOperatorName()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center justify-between pt-3 border-t text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{project.totalLength}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{project.videoCount || 0} video</span>
              </div>
            </div>
            {(project.aiDetections?.total || 0) > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-medium text-orange-500">{project.aiDetections.total}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onView(project._id);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
