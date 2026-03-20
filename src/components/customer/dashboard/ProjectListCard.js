'use client';

import { MapPin, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { statusConfig } from '@/components/customer/constants';

const ProjectListCard = ({ project, onNavigate }) => {
  const config = statusConfig[project.status] || { label: 'In Progress', color: 'outline' };
  const defects = project.aiDetections?.total || 0;
  const progress = project.progress || 0;

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={() => onNavigate(project._id)}
    >
      {/* Progress ring indicator */}
      <div className="relative flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
        <span className="text-xs font-semibold">{progress}%</span>
        <svg className="absolute inset-0 h-10 w-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            className="text-muted stroke-current"
            strokeWidth="3"
            fill="none"
            cx="18"
            cy="18"
            r="15.5"
          />
          <circle
            className="text-primary stroke-current"
            strokeWidth="3"
            fill="none"
            cx="18"
            cy="18"
            r="15.5"
            strokeDasharray={`${progress * 0.975} 100`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{project.name}</p>
          <Badge variant={config.color} className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {project.location}
          </span>
          {defects > 0 && (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              {defects} defect{defects !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

export default ProjectListCard;
