'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Loader2,
  FolderOpen,
  FileText,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/providers/UserContext';
import {
  useCustomerProjects,
  useCustomerReports,
  useCustomerNotifications,
} from '@/hooks/useQueryHooks';
import { statusConfig } from '@/components/customer/constants';

import StatsCards from '@/components/customer/dashboard/StatsCards';
import ProjectListCard from '@/components/customer/dashboard/ProjectListCard';

export default function CustomerDashboard() {
  const router = useRouter();
  const { userId, userData } = useUser();

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsError,
  } = useCustomerProjects(userId);

  const { data: reports = [] } = useCustomerReports(userId);
  const { data: notificationsData } = useCustomerNotifications(userId);

  const notifications = notificationsData?.data || notificationsData || [];
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  // Compute all dashboard stats from projects
  const stats = useMemo(() => {
    const active = projects.filter(
      (p) => !['completed', 'customer-notified', 'on-hold'].includes(p.status)
    ).length;
    const completed = projects.filter((p) =>
      ['completed', 'customer-notified'].includes(p.status)
    ).length;
    const totalDefects = projects.reduce(
      (sum, p) => sum + (p.aiDetections?.total || 0),
      0
    );

    return { total: projects.length, active, completed, totalDefects };
  }, [projects]);

  // Status distribution for breakdown bar
  const statusBreakdown = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        count,
        label: statusConfig[status]?.label || status,
        bgColor: statusConfig[status]?.bgColor || 'bg-gray-100 text-gray-800',
      }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  // Defect severity distribution across all projects
  const severityStats = useMemo(() => {
    let high = 0, medium = 0, low = 0, aiCount = 0;
    projects.forEach((p) => {
      const det = p.aiDetections;
      if (!det) return;
      high += det.high || 0;
      medium += det.medium || 0;
      low += det.low || 0;
      aiCount += det.total || 0;
    });
    const total = high + medium + low;
    return { high, medium, low, total, aiCount };
  }, [projects]);

  // Recent projects (last 5 by created date)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [projects]);

  // Projects needing attention (in-review or with high defects)
  const attentionProjects = useMemo(() => {
    return projects
      .filter(
        (p) =>
          p.status === 'completed' ||
          p.status === 'qc-review' ||
          (p.aiDetections?.high || 0) > 0
      )
      .slice(0, 3);
  }, [projects]);

  const handleNavigate = (projectId) => {
    router.push(`/customer/projects/${projectId}`);
  };

  // Loading state
  if (loadingProjects) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inspection projects</p>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
                <div className="h-7 w-12 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (projectsError) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inspection projects</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">
              {projectsError?.message || 'Failed to load dashboard'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{userData?.first_name ? `, ${userData.first_name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your inspection projects
          </p>
        </div>
        {unreadCount > 0 && (
          <Link
            href="/customer/notifications"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column – 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Status Breakdown */}
          {projects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {statusBreakdown.map(({ status, count }) => {
                    const pct = (count / projects.length) * 100;
                    const colorMap = {
                      completed: 'bg-green-500',
                      'customer-notified': 'bg-purple-500',
                      'qc-review': 'bg-yellow-500',
                      'ai-processing': 'bg-blue-500',
                      'field-capture': 'bg-gray-400',
                      uploading: 'bg-sky-400',
                      'on-hold': 'bg-red-500',
                      planning: 'bg-slate-400',
                    };
                    return (
                      <div
                        key={status}
                        className={`${colorMap[status] || 'bg-gray-300'} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${statusConfig[status]?.label || status}: ${count}`}
                      />
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3">
                  {statusBreakdown.map(({ status, count, label }) => {
                    const colorMap = {
                      completed: 'bg-green-500',
                      'customer-notified': 'bg-purple-500',
                      'qc-review': 'bg-yellow-500',
                      'ai-processing': 'bg-blue-500',
                      'field-capture': 'bg-gray-400',
                      uploading: 'bg-sky-400',
                      'on-hold': 'bg-red-500',
                      planning: 'bg-slate-400',
                    };
                    return (
                      <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className={`h-2.5 w-2.5 rounded-full ${colorMap[status] || 'bg-gray-300'}`} />
                        {label} ({count})
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Projects */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
              <Link
                href="/customer/projects"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No projects yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentProjects.map((project) => (
                    <ProjectListCard
                      key={project._id}
                      project={project}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column – 1/3 width */}
        <div className="space-y-6">
          {/* Defect Severity Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Defect Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {severityStats.total === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No defects detected
                </p>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{severityStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total defects across all projects</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'High', value: severityStats.high, color: 'bg-red-500', text: 'text-red-700' },
                      { label: 'Medium', value: severityStats.medium, color: 'bg-orange-400', text: 'text-orange-700' },
                      { label: 'Low', value: severityStats.low, color: 'bg-emerald-500', text: 'text-emerald-700' },
                    ].map(({ label, value, color, text }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${text}`}>{label}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{
                              width: severityStats.total
                                ? `${(value / severityStats.total) * 100}%`
                                : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Needs Attention */}
          {attentionProjects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attentionProjects.map((p) => {
                  const cfg = statusConfig[p.status] || { label: p.status, bgColor: 'bg-gray-100 text-gray-800' };
                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleNavigate(p._id)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <Badge variant="outline" className={`text-[10px] mt-0.5 ${cfg.bgColor}`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      {(p.aiDetections?.high || 0) > 0 && (
                        <Badge variant="destructive" className="text-[10px] ml-2 flex-shrink-0">
                          {p.aiDetections.high} high
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: '/customer/projects', label: 'All Projects', icon: FolderOpen, count: stats.total },
                { href: '/customer/reports', label: 'Reports', icon: FileText, count: reports.length },
              ].map(({ href, label, icon: Icon, count }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
