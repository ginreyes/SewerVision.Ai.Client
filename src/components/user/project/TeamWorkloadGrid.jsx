'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Loader2 } from 'lucide-react';
import { useTeamWorkload } from '@/data/pipelineApi';

const CAPACITY_CONFIG = {
  low: { label: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Moderate', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  high: { label: 'At Capacity', color: 'bg-red-100 text-red-700 border-red-200' },
};

const TeamWorkloadGrid = ({ managerId }) => {
  const { data: workloadData, isLoading } = useTeamWorkload(managerId);
  const members = workloadData?.data || [];

  if (isLoading) {
    return (
      <Card className="border-gray-200 mb-5">
        <CardContent className="p-5">
          <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) return null;

  return (
    <Card className="border-gray-200 mb-5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Team Workload</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {members.map((member) => {
            const capacity = member.capacity || 'low';
            const config = CAPACITY_CONFIG[capacity] || CAPACITY_CONFIG.low;
            const initials = member.name
              ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '?';

            return (
              <div
                key={member._id || member.userId}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name || 'Unknown'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">{member.projectCount || 0} projects</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamWorkloadGrid;
