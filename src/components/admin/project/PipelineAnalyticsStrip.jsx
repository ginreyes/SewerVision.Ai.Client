'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, BarChart3, Zap } from 'lucide-react';
import { usePipelineAnalytics } from '@/data/pipelineApi';

const PipelineAnalyticsStrip = ({ managerId }) => {
  const { data: analyticsData, isLoading } = usePipelineAnalytics(managerId);
  const analytics = analyticsData?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="p-4">
              <div className="h-12 bg-gray-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const { throughput, bottleneck, stageDurations } = analytics;

  // Calculate average completion time from stage durations
  const totalAvgHours = (stageDurations || []).reduce((sum, s) => sum + (s.avgHours || 0), 0);
  const avgDays = Math.round(totalAvgHours / 24);

  const throughputChange = throughput ? throughput.thisWeek - throughput.lastWeek : 0;
  const TrendIcon = throughputChange >= 0 ? TrendingUp : TrendingDown;
  const trendColor = throughputChange >= 0 ? 'text-emerald-600' : 'text-red-600';

  const stats = [
    {
      label: 'Completed This Week',
      value: throughput?.thisWeek ?? 0,
      sub: (
        <span className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          {throughputChange >= 0 ? '+' : ''}{throughputChange} vs last week
        </span>
      ),
      icon: Zap,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      label: 'Avg Completion',
      value: `${avgDays}d`,
      sub: <span className="text-xs text-gray-500">across all stages</span>,
      icon: Clock,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Bottleneck',
      value: bottleneck?.stage ? bottleneck.stage.replace('-', ' ') : 'None',
      sub: bottleneck?.count ? (
        <span className="text-xs text-amber-600">{bottleneck.count} projects stuck</span>
      ) : (
        <span className="text-xs text-gray-500">No bottlenecks</span>
      ),
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
    },
    {
      label: 'Pipeline Health',
      value: bottleneck?.count > 3 ? 'At Risk' : 'Healthy',
      sub: (
        <Badge variant="outline" className={`text-[10px] ${bottleneck?.count > 3 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          {bottleneck?.count > 3 ? 'Action needed' : 'On track'}
        </Badge>
      ),
      icon: BarChart3,
      bg: bottleneck?.count > 3 ? 'bg-red-50' : 'bg-emerald-50',
      color: bottleneck?.count > 3 ? 'text-red-600' : 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <Card key={s.label} className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 capitalize">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PipelineAnalyticsStrip;
