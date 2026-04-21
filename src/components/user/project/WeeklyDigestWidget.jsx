'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, AlertTriangle, Calendar } from 'lucide-react';
import { useWeeklyDigest } from '@/data/pipelineApi';

const WeeklyDigestWidget = ({ managerId }) => {
  const { data: digestData, isLoading } = useWeeklyDigest(managerId);
  const digest = digestData?.data;

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!digest) return null;

  return (
    <Card className="border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">This Week</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Completed
            </span>
            <span className="text-sm font-bold text-gray-900">{digest.completedThisWeek || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-500" /> New Projects
            </span>
            <span className="text-sm font-bold text-gray-900">{digest.newThisWeek || 0}</span>
          </div>
          {digest.stuckProject && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="text-xs text-amber-700 font-medium truncate">
                  {digest.stuckProject.name}
                </span>
              </div>
              <p className="text-[10px] text-amber-600 mt-0.5 ml-[18px]">
                Stuck in {digest.stuckProject.stage?.replace('-', ' ')} for {digest.stuckProject.daysStuck}d
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDigestWidget;
