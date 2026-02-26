'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { maintenanceApi } from '@/data/maintenanceApi';
import { useAlert } from '@/components/providers/AlertProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Flag,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Wrench,
  Timer,
  ChevronRight,
  Copy,
  Share2,
  MoreHorizontal,
  Activity,
  TrendingUp,
  Users,
  Hash,
} from 'lucide-react';

/* ─── Priority helpers ─── */
const priorityConfig = {
  low: {
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: 'Low',
    ring: 'ring-slate-200',
  },
  medium: {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Medium',
    ring: 'ring-amber-200',
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'High',
    ring: 'ring-orange-200',
  },
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Critical',
    ring: 'ring-red-200',
  },
};

const PriorityBadge = ({ priority }) => {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      <Flag className="w-3 h-3" fill="currentColor" />
      {cfg.label}
    </span>
  );
};

/* ─── Status pill ─── */
const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  scheduled: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    icon: Calendar,
  },
  'in-progress': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    icon: Activity,
  },
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    icon: Clock,
  },
  urgent: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: AlertTriangle,
  },
};

const StatusPill = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  const label =
    status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

/* ─── Info row component ─── */
const InfoRow = ({ icon: Icon, label, value, subValue, iconColor = 'text-gray-400' }) => (
  <div className="flex items-start gap-3 py-3">
    <div className={`mt-0.5 p-2 rounded-lg bg-gray-50 ${iconColor}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      {subValue && (
        <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>
      )}
    </div>
  </div>
);

/* ─── Timeline item ─── */
const TimelineItem = ({ icon: Icon, title, time, description, isLast, color = 'bg-blue-500' }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
    </div>
    <div className={`pb-5 ${isLast ? '' : ''}`}>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      {description && (
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </div>
);

/* ─── Main page ─── */
export default function AdminTaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert } = useAlert();

  const taskId = params?.taskId;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const response = await maintenanceApi.getTasks({});
        if (!response.ok) {
          throw new Error(
            response.data?.error || 'Failed to load maintenance tasks'
          );
        }

        const tasks = response.data?.data || [];
        const found = tasks.find(
          (t) => t._id === taskId || t.taskId === taskId
        );

        if (!found) {
          showAlert('Task not found', 'error');
          router.back();
          return;
        }

        setTask(found);
      } catch (err) {
        console.error('Error loading task details:', err);
        showAlert(
          err?.message || 'Failed to load task details',
          'error'
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      loadTask();
    }
  }, [taskId, router, showAlert]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(taskId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </div>
          <p className="text-gray-900 font-medium">Loading task details</p>
          <p className="text-gray-400 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const createdAt = task.createdAt ? new Date(task.createdAt) : null;
  const updatedAt = task.updatedAt ? new Date(task.updatedAt) : null;
  const estimatedCompletion = task.estimatedCompletion
    ? new Date(task.estimatedCompletion)
    : null;

  const durationMinutes =
    createdAt && estimatedCompletion
      ? Math.max(
          0,
          Math.round(
            (estimatedCompletion.getTime() - createdAt.getTime()) / (60 * 1000)
          )
        )
      : null;

  const durationLabel = durationMinutes
    ? durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : `${durationMinutes}m`
    : null;

  const derivedStatus =
    task.priority === 'critical' &&
    ['pending', 'scheduled', 'in-progress'].includes(task.status)
      ? 'urgent'
      : task.status;

  const progress = task.progress || 0;
  const progressColor =
    progress >= 80
      ? 'bg-emerald-500'
      : progress >= 50
        ? 'bg-sky-500'
        : progress >= 25
          ? 'bg-amber-500'
          : 'bg-gray-300';

  // Build a simple activity timeline from available data
  const timeline = [];
  if (createdAt) {
    timeline.push({
      icon: FileText,
      title: 'Task created',
      time: createdAt.toLocaleString(),
      description: `Created with ${task.priority || 'medium'} priority`,
      color: 'bg-gray-400',
    });
  }
  if (task.assignedTo) {
    timeline.push({
      icon: User,
      title: `Assigned to ${task.assignedTo}`,
      time: createdAt ? createdAt.toLocaleString() : '—',
      description: task.assignedTeam
        ? `Team: ${task.assignedTeam}`
        : null,
      color: 'bg-violet-500',
    });
  }
  if (task.status === 'in-progress' || task.status === 'completed') {
    timeline.push({
      icon: Wrench,
      title: 'Work started',
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: null,
      color: 'bg-sky-500',
    });
  }
  if (task.status === 'completed') {
    timeline.push({
      icon: CheckCircle2,
      title: 'Task completed',
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: task.completionNotes || null,
      color: 'bg-emerald-500',
    });
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 pb-20">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0 mt-0.5 h-9 w-9 border-gray-200 hover:bg-gray-50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {task.task}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusPill status={derivedStatus} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-gray-200 hover:bg-gray-50 rounded-lg hidden sm:flex"
            onClick={handleCopyId}
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-200 hover:bg-gray-50 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ─── Quick stats strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Progress',
            value: `${progress}%`,
            icon: TrendingUp,
            iconBg: 'bg-sky-50 text-sky-600',
          },
          {
            label: 'Priority',
            value: (task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1),
            icon: Flag,
            iconBg:
              task.priority === 'critical'
                ? 'bg-red-50 text-red-600'
                : task.priority === 'high'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Duration',
            value: durationLabel || '—',
            icon: Timer,
            iconBg: 'bg-violet-50 text-violet-600',
          },
          {
            label: 'Category',
            value: task.category || 'General',
            icon: MapPin,
            iconBg: 'bg-emerald-50 text-emerald-600',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── Left column: Overview + Notes ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {task.description || 'No description provided for this task.'}
              </p>
            </CardContent>
          </Card>

          {/* Details card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-gray-400" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="pr-0 sm:pr-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={User}
                    label="Assignee"
                    value={task.assignedTo || 'Unassigned'}
                    subValue={task.assignedTeam ? `Team: ${task.assignedTeam}` : null}
                    iconColor="text-violet-500"
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Category"
                    value={task.category || 'General'}
                    iconColor="text-emerald-500"
                  />
                  <InfoRow
                    icon={Hash}
                    label="Task ID"
                    value={
                      <span className="font-mono text-xs">
                        {task.taskId || task._id || '—'}
                      </span>
                    }
                    iconColor="text-gray-400"
                  />
                </div>
                <div className="pl-0 sm:pl-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Calendar}
                    label="Created"
                    value={
                      createdAt
                        ? createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'
                    }
                    subValue={
                      createdAt
                        ? createdAt.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : null
                    }
                    iconColor="text-sky-500"
                  />
                  <InfoRow
                    icon={Clock}
                    label="Estimated Completion"
                    value={
                      estimatedCompletion
                        ? estimatedCompletion.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'
                    }
                    subValue={durationLabel ? `Duration: ${durationLabel}` : null}
                    iconColor="text-amber-500"
                  />
                  <InfoRow
                    icon={Activity}
                    label="Last Updated"
                    value={
                      updatedAt
                        ? updatedAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Same as created'
                    }
                    subValue={
                      updatedAt
                        ? updatedAt.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : null
                    }
                    iconColor="text-gray-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {progress}%
                </span>
                <span className="text-xs text-gray-500">
                  {progress >= 100
                    ? 'Complete'
                    : progress >= 75
                      ? 'Almost there'
                      : progress >= 50
                        ? 'Halfway'
                        : progress > 0
                          ? 'In progress'
                          : 'Not started'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Milestone markers */}
              <div className="flex justify-between mt-2 px-0.5">
                {[0, 25, 50, 75, 100].map((m) => (
                  <div key={m} className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        progress >= m ? progressColor : 'bg-gray-200'
                      }`}
                    />
                    <span className="text-[10px] text-gray-400 mt-1">
                      {m}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes card */}
          {task.notes && (
            <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {task.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right column: Timeline + Quick Actions ─── */}
        <div className="space-y-5">

          {/* Quick Actions card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {[
                {
                  label: 'Update Status',
                  icon: Activity,
                  color: 'text-sky-600',
                  bg: 'hover:bg-sky-50',
                },
                {
                  label: 'Reassign Task',
                  icon: Users,
                  color: 'text-violet-600',
                  bg: 'hover:bg-violet-50',
                },
                {
                  label: 'Add Notes',
                  icon: FileText,
                  color: 'text-amber-600',
                  bg: 'hover:bg-amber-50',
                },
                {
                  label: 'Share Task',
                  icon: Share2,
                  color: 'text-emerald-600',
                  bg: 'hover:bg-emerald-50',
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 ${action.bg} transition-colors`}
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Activity Timeline card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {timeline.length > 0 ? (
                <div>
                  {timeline.map((item, i) => (
                    <TimelineItem
                      key={i}
                      icon={item.icon}
                      title={item.title}
                      time={item.time}
                      description={item.description}
                      color={item.color}
                      isLast={i === timeline.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No activity recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Assignee card */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Assignee
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {task.assignedTo
                    ? task.assignedTo
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {task.assignedTo || 'Unassigned'}
                  </p>
                  {task.assignedTeam && (
                    <p className="text-xs text-gray-500">{task.assignedTeam}</p>
                  )}
                  {task.assignedRole && (
                    <p className="text-xs text-gray-400">{task.assignedRole}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}