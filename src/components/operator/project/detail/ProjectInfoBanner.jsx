import React from 'react';
import {
  Loader2,
  MapPin,
  Building2,
  Ruler,
  Calendar,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ProjectInfoBanner = ({
  project,
  statusGradient,
  isReprocessing,
  userData,
  router,
  myDevices,
  selectedDeviceId,
  setSelectedDeviceId,
  handleSetDevice,
  updatingDevice,
}) => {
  if (!project) return null;

  return (
    <div className={`border rounded-2xl p-6 mb-6 transition-all duration-300 shadow-sm backdrop-blur-sm ${isReprocessing
      ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-blue-200 shadow-lg shadow-blue-100/50'
      : `bg-gradient-to-r ${statusGradient.banner} ${statusGradient.bannerBorder}`
      }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <Badge variant="outline" className={`${statusGradient.text} border-current`}>
              {project.status?.replace('-', ' ').toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>

          {/* Info Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{project.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{project.client}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Ruler className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{project.totalLength}</span>
            </div>
            {(project.estimatedCompletion || project.estimated_completion) && (
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Due: {new Date(project.estimatedCompletion || project.estimated_completion).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Monitor className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Device: {project.assignedDevice?.name || (project.assignedDevice ? '—' : 'Not set')}
                {(project.assignedDevice?._id ?? project.assignedDevice) && userData?.role === 'operator' && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 ml-1 text-blue-600 hover:text-blue-800 text-sm font-normal"
                    onClick={() => router.push(`/operator/equipement/${project.assignedDevice?._id ?? project.assignedDevice}`)}
                  >
                    View device
                  </Button>
                )}
              </span>
            </div>
            {userData?.role === 'operator' && myDevices.length > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedDeviceId || '__none__'}
                  onValueChange={(value) =>
                    setSelectedDeviceId(value === '__none__' ? '' : value)
                  }
                >
                  <SelectTrigger className="h-9 w-[200px] bg-white/80 border-gray-200">
                    <SelectValue placeholder="Select device..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {myDevices.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name} {d.serialNumber ? `(${d.serialNumber})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleSetDevice} disabled={updatingDevice}>
                  {updatingDevice ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set device'}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right min-w-[100px]">
            <div className="text-sm text-gray-500 font-medium">Progress</div>
            {isReprocessing ? (
              <div className="flex items-center justify-end gap-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm font-semibold text-blue-600">Processing</span>
              </div>
            ) : project.status === 'ai-processing' ? (
              <div className="flex items-center justify-end gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <span className="text-lg font-bold text-violet-600">AI Active</span>
              </div>
            ) : (
              <div className={`text-2xl font-bold bg-gradient-to-r ${statusGradient.textGradient} bg-clip-text text-transparent`}>
                {project.progress}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar with animation during reprocessing */}
      {(isReprocessing || project.status === 'ai-processing') && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full bg-gradient-to-r ${statusGradient.progressBg} animate-pulse`}
              style={{ width: isReprocessing ? '30%' : `${project.progress}%`, transition: 'width 0.3s ease' }}>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {isReprocessing ? 'Starting AI reprocessing...' : 'AI is analyzing the video footage'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectInfoBanner;
