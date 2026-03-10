'use client';

import { MapPin, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusConfig, getSeverityConfig } from '@/components/customer/constants';

const ProjectListCard = ({ project, onNavigate }) => {
  const config = statusConfig[project.status] || { label: 'In Progress', color: 'outline' };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onNavigate(project._id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{project.name}</h3>
              <Badge variant={config.color}>{config.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {project.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(project.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {project.aiDetections?.total || 0} defects
              </div>
            </div>
            {project.aiDetections?.total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Severity:</span>
                <Badge variant={getSeverityConfig(project.aiDetections.total).variant}>
                  {getSeverityConfig(project.aiDetections.total).label}
                </Badge>
              </div>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectListCard;
