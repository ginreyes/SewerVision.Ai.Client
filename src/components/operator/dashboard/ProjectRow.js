'use client';

import { MapPin, ChevronRight } from 'lucide-react';
import { getProjectStatusConfig } from '@/components/operator/constants';

export default function ProjectRow({ project, onClick }) {
    const config = getProjectStatusConfig(project.status);

    return (
        <div
            onClick={() => onClick(project)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
            <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 text-sm truncate">{project.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {project.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {project.location}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                    {config.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
}
