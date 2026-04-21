'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video, Brain, Shield, Bell, MessageSquare, Upload,
  CheckCircle, Clock, FileText, User, Activity,
} from 'lucide-react';
import { useActivityFeed } from '@/data/pipelineApi';

const TYPE_CONFIG = {
  status_change: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  video_uploaded: { icon: Upload, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ai_started: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  ai_completed: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  qc_review_started: { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  qc_review_completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  detection_reviewed: { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  customer_notified: { icon: Bell, color: 'text-teal-600', bg: 'bg-teal-50' },
  customer_feedback: { icon: MessageSquare, color: 'text-teal-600', bg: 'bg-teal-50' },
  field_note: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
  assignment_change: { icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  escalation: { icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
  report_generated: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const ActivityFeed = ({ projectId }) => {
  const { data: feedData, isLoading } = useActivityFeed(projectId, { limit: 20 });
  const activities = feedData?.data || [];

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-5 text-center py-8">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Timeline</h3>
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-4">
            {activities.map((activity, idx) => {
              const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.status_change;
              const Icon = config.icon;
              const date = new Date(activity.createdAt);
              const timeAgo = getTimeAgo(date);
              const userName = activity.user
                ? `${activity.user.first_name || ''} ${activity.user.last_name || ''}`.trim() || 'System'
                : 'System';

              return (
                <div key={activity._id || idx} className="flex gap-3 relative">
                  <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10`}>
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{userName}</span>
                      <span className="text-xs text-gray-400">&middot;</span>
                      <span className="text-xs text-gray-400">{timeAgo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default ActivityFeed;
