import {
  FileText,
  Play,
  CheckCircle,
  Clock,
  MapPin,
  Folder,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

// Project Card Component
const ProjectCard = ({ project, isSelected, onClick, onStartReview }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${isSelected
        ? 'border-red-600 shadow-md ring-2 ring-amber-100'
        : 'border-transparent hover:border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${project.status === 'in-progress' ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <Folder className={`w-5 h-5 ${project.status === 'in-progress' ? 'text-red-700' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{project.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location || 'No Location'}
            </p>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Radio className="w-3.5 h-3.5 text-red-600" />
          </div>
          <p className="text-xs font-medium text-gray-900">{project.totalDetections || 0}</p>
          <p className="text-[10px] text-gray-500">Detections</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <CheckCircle className={`w-3.5 h-3.5 ${project.progress === 100 ? 'text-green-500' : 'text-blue-500'}`} />
          </div>
          <p className="text-xs font-medium text-gray-900">{project.progress || 0}%</p>
          <p className="text-[10px] text-gray-500">Reviewed</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-xs font-medium text-gray-900 capitalize">{project.priority || 'Med'}</p>
          <p className="text-[10px] text-gray-500">Priority</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={`w-full gap-1.5 ${project.status === 'completed'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-700 hover:bg-red-800'}`}
          onClick={(e) => { e.stopPropagation(); onStartReview(project); }}
        >
          {project.status === 'completed' ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              View Report
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              {project.status === 'in-progress' ? 'Continue Review' : 'Start Review'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
