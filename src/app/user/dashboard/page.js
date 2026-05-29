'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar as CalendarIcon,
  User,
  UserCheck,
  FileText,
  Inbox,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserContext';
import Link from 'next/link';

import StatsCards from '@/components/user/dashboard/StatsCards';
import WeeklyDigestWidget from '@/components/user/project/WeeklyDigestWidget';
import TeamMemberList from '@/components/user/dashboard/TeamMemberList';
import UserDashboardDetail from '@/components/user/dashboard/UserDashboardDetail';
import ComplianceSummaryCard from '@/components/user/dashboard/ComplianceSummaryCard';
import MemberComplianceSidePanel from '@/components/user/dashboard/MemberComplianceSidePanel';
import ProjectHealthRow from '@/components/user/dashboard/ProjectHealthRow';
import SLASummaryStrip from '@/components/user/dashboard/SLASummaryStrip';
import { useUserDashboard, useUserTeamMemberDashboard } from '@/hooks/useQueryHooks';
import { CHART_COLORS } from '@/components/user/constants';
import { applyChartTheme } from '@/lib/chartTheme';
import { useTheme } from '@/components/providers/ThemeProvider';

const loadChart = async () => {
  const chartModule = await import('chart.js/auto');
  return chartModule.default || chartModule;
};

export default function UserDashboardPage() {
  const { userId, userData } = useUser() || {};
  const { isDark } = useTheme();
  useEffect(() => { applyChartTheme(isDark); }, [isDark]);
  const [chartReady, setChartReady] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeamUser, setSelectedTeamUser] = useState(null);
  const [compliancePanel, setCompliancePanel] = useState({ open: false, memberId: null, memberName: null });

  // Deep-link from a "Certification reminder" notification (May 22).
  // /user/dashboard?compliance=<memberId>&memberName=<name> auto-opens the
  // compliance side-panel for that member. The query string is wiped from
  // the URL bar once consumed so a refresh doesn't re-open it.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const memberId = searchParams?.get('compliance');
    if (!memberId) return;
    const memberName = searchParams?.get('memberName') || null;
    setCompliancePanel({ open: true, memberId, memberName });
    const next = new URLSearchParams(searchParams.toString());
    next.delete('compliance');
    next.delete('memberName');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const chartRef = useRef(null);
  const teamChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const teamChartInstanceRef = useRef(null);

  const displayName =
    (userData && `${userData.first_name || ''} ${userData.last_name || ''}`.trim()) ||
    userData?.username ||
    'Team Manager';

  // ── Data fetching via TanStack Query ──
  const { data: dashboardData, isLoading: loading } = useUserDashboard(userId);
  const { data: teamMemberData, isLoading: loadingUserDashboard } = useUserTeamMemberDashboard(
    selectedTeamUser?.id,
    selectedTeamUser?.role
  );

  const events = dashboardData?.events ?? [];
  const projects = dashboardData?.projects ?? [];
  const teamList = dashboardData?.teamList ?? [];
  const teamCounts = dashboardData?.teamCounts ?? { operators: 0, qc: 0 };
  const reportsCount = dashboardData?.reportsCount ?? 0;

  // ── Chart loading ──
  useEffect(() => {
    loadChart().then((Chart) => {
      if (typeof window !== 'undefined') window.Chart = Chart;
      setChartReady(true);
    });
  }, []);

  const projectStatusCounts = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      const s = p.status || 'planning';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({
      label: String(label).replace(/-/g, ' '),
      value,
    }));
  }, [projects]);

  // ── Project status chart ──
  useEffect(() => {
    if (!chartReady) return;
    const Chart = typeof window !== 'undefined' ? window.Chart : null;
    if (!Chart || !chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    chartInstanceRef.current = null;
    if (projectStatusCounts.length === 0) return;
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: projectStatusCounts.map((d) => d.label),
        datasets: [{
          data: projectStatusCounts.map((d) => d.value),
          backgroundColor: CHART_COLORS.slice(0, projectStatusCounts.length),
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } } },
      },
    });
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartReady, projectStatusCounts]);

  // ── Team chart ──
  useEffect(() => {
    if (!chartReady || !teamChartRef.current) return;
    const Chart = typeof window !== 'undefined' ? window.Chart : null;
    if (!Chart) return;
    if (teamChartInstanceRef.current) teamChartInstanceRef.current.destroy();
    teamChartInstanceRef.current = new Chart(teamChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Operators', 'QC Technicians'],
        datasets: [{
          label: 'Team',
          data: [teamCounts.operators, teamCounts.qc],
          backgroundColor: ['#696CFF', '#10B981'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.raw} people` } },
        },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
    return () => {
      if (teamChartInstanceRef.current) teamChartInstanceRef.current.destroy();
    };
  }, [chartReady, teamCounts]);

  // Memoize so the arrays keep referential equality across renders (the
  // previous code recomputed `new Date()` inline, breaking memo of every
  // downstream <EventRow> / <ProjectRow> child).
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((e) => new Date(e.start_date || e.start).getTime() >= now)
      .sort((a, b) => new Date(a.start_date || a.start) - new Date(b.start_date || b.start))
      .slice(0, 5);
  }, [events]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0)
      )
      .slice(0, 5);
  }, [projects]);

  // Stable handler refs (May 22) — without useCallback, every dashboard
  // re-render (parent prop change, ANY upstream query refetch) recreated
  // onSelectMember / onViewCompliance, busting the memo on ComplianceSummaryCard
  // and TeamMemberList and producing the triple-render the plan called out.
  const openCompliancePanel = useCallback((m) => {
    setCompliancePanel({ open: true, memberId: m.memberId, memberName: m.memberName });
  }, []);
  const onPanelOpenChange = useCallback((open) => {
    setCompliancePanel((prev) => ({ ...prev, open }));
  }, []);
  const onSelectTeamUser = useCallback((u) => setSelectedTeamUser(u), []);
  const clearSelectedTeamUser = useCallback(() => setSelectedTeamUser(null), []);
  const switchToOverview = useCallback(() => {
    setActiveTab('overview');
    setSelectedTeamUser(null);
  }, []);

  if (loading && projects.length === 0 && events.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {displayName}. Here&apos;s your team, projects, and events at a glance.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-100/60 p-1 gap-0.5 w-fit">
        <button
          type="button"
          onClick={() => { setActiveTab('operator-qc'); setSelectedTeamUser(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'operator-qc'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Operator and QC Tech
        </button>
        <Link
          href="/user/calendar"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
        >
          <CalendarIcon className="w-4 h-4" />
          Calendar
        </Link>
        <Link
          href="/user/reports"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
        >
          <FileText className="w-4 h-4" />
          Reports
        </Link>
      </div>

      {/* Operator & QC Tech view */}
      {activeTab === 'operator-qc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TeamMemberList
              teamList={teamList}
              selectedTeamUser={selectedTeamUser}
              onSelectUser={onSelectTeamUser}
              onViewCompliance={openCompliancePanel}
            />
            <div className="lg:col-span-2">
              {!selectedTeamUser ? (
                <Card className="border-0 shadow-sm h-full min-h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Select an operator or QC technician</p>
                    <p className="text-sm">to view their dashboard data</p>
                  </div>
                </Card>
              ) : loadingUserDashboard ? (
                <Card className="border-0 shadow-sm min-h-[300px] flex items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </Card>
              ) : (
                <UserDashboardDetail
                  user={selectedTeamUser}
                  data={teamMemberData}
                  isOperator={selectedTeamUser.role === 'operator'}
                  onBack={clearSelectedTeamUser}
                  onBackToDashboard={switchToOverview}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overview content (default) */}
      {activeTab !== 'operator-qc' && (
        <>
          <StatsCards
            projectCount={projects.length}
            operatorCount={teamCounts.operators}
            qcCount={teamCounts.qc}
            reportsCount={reportsCount}
          />

          <WeeklyDigestWidget managerId={userId} />

          <SLASummaryStrip managerId={userId} />

          <ComplianceSummaryCard onSelectMember={openCompliancePanel} />

          <ProjectHealthRow limit={5} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-500" />
                  Projects by status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  {projectStatusCounts.length > 0 ? (
                    <canvas ref={chartRef} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">
                      No project data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Team: Operators & QC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <canvas ref={teamChartRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events & Projects list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  Upcoming events
                </CardTitle>
                <Link href="/user/calendar">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View calendar
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No upcoming events.</p>
                ) : (
                  upcomingEvents.map((ev) => (
                    <div
                      key={ev._id || ev.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ev.title || 'Event'}</p>
                        <p className="text-xs text-gray-500">
                          {ev.start_date || ev.start
                            ? new Date(ev.start_date || ev.start).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : '—'}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                        {ev.category || 'event'}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-500" />
                  Recent projects
                </CardTitle>
                <Link href="/user/project">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentProjects.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No projects yet.</p>
                ) : (
                  recentProjects.map((p) => (
                    <Link key={p._id} href={`/user/project?selectedProject=${p._id}`}>
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            {p.client || p.location || '—'} · {p.progress ?? 0}%
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                          {(p.status || '').replace(/-/g, ' ')}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <Card className="border-0 shadow-sm bg-gray-50/50">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-3">
                <Link href="/user/team">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Team management
                  </Button>
                </Link>
                <Link href="/user/device-assignments">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Device assignments
                  </Button>
                </Link>
                <Link href="/user/inbox">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Inbox className="w-4 h-4" />
                    Inbox
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <MemberComplianceSidePanel
        open={compliancePanel.open}
        onOpenChange={onPanelOpenChange}
        memberId={compliancePanel.memberId}
        memberName={compliancePanel.memberName}
      />
    </div>
  );
}
