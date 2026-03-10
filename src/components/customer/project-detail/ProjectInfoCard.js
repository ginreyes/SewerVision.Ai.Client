'use client';

import { MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ProjectInfoCard = ({ project, operatorName }) => {
  return (
    <Card data-tour="customer-project-info">
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{project.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Inspection Date</p>
              <p className="font-medium">
                {new Date(project.metadata?.recordingDate || project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Operator</p>
              <p className="font-medium">{operatorName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Defects Found</p>
              <p className="font-medium">{project.aiDetections?.total || 0} issues</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
