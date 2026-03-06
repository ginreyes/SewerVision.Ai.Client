'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  ArrowLeft,
  Monitor,
  ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';

const getAvatarUrl = (id) => (id ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/avatar/${id}` : null);
const getInitials = (name) => {
  if (!name || name === '—') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (name[0] || '?').toUpperCase();
};

const loadChart = async () => {
  const chartModule = await import('chart.js/auto');
  return chartModule.default || chartModule;
};

const CHART_COLORS = ['#D76A84', '#696CFF', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export default function UserDashboardPage() {
  const { userId, userData } = useUser() || {};
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamCounts, setTeamCounts] = useState({ operators: 0, qc: 0 });
  const [reportsCount, setReportsCount] = useState(0);
  const chartRef = useRef(null);
  const teamChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const teamChartInstanceRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [teamList, setTeamList] = useState([]);
  const [selectedTeamUser, setSelectedTeamUser] = useState(null);
  const [userDashboardData, setUserDashboardData] = useState(null);
  const [loadingUserDashboard, setLoadingUserDashboard] = useState(false);
 
  const displayName =
    (userData && `${userData.first_name || ''} ${userData.last_name || ''}`.trim()) ||
    userData?.username ||
    'Team Manager';

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [eventsRes, projectsRes, reportsRes, teamRes] = await Promise.all([
          api('/api/calendar/get-event', 'GET'),
          api(`/api/projects/get-all-projects?managerId=${userId}&limit=50`, 'GET'),
          api(`/api/reports/get-all-report?managerId=${userId}`, 'GET'),
          api(`/api/projects/get-team-members?managerId=${userId}`, 'GET'),
        ]);

        const eventsList = Array.isArray(eventsRes?.data) ? eventsRes.data : eventsRes?.data?.data ?? [];
        setEvents(eventsList);

        const projectsList = projectsRes?.data?.data ?? projectsRes?.data ?? [];
        setProjects(Array.isArray(projectsList) ? projectsList : []);

        const teamData = teamRes?.data ?? teamRes;
        const teamListData = Array.isArray(teamData?.data) ? teamData.data : [];
        setTeamList(teamListData);
        if (teamData?.teamCounts) setTeamCounts({ operators: teamData.teamCounts.operators ?? 0, qc: teamData.teamCounts.qc ?? 0 });

        const reportsData = reportsRes?.data ?? [];
        const reportsList = Array.isArray(reportsData) ? reportsData : reportsData?.data ?? [];
        setReportsCount(reportsList.length);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        showAlert(err?.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, showAlert]);

  useEffect(() => {
    if (!selectedTeamUser?.id) {
      setUserDashboardData(null);
      return;
    }
    const role = String(selectedTeamUser.role || '').toLowerCase();
    const isOperator = role === 'operator';
    const isQc = role === 'qc-technician';
    let cancelled = false;
    setLoadingUserDashboard(true);
    setUserDashboardData(null);
    const url = isOperator
      ? `/api/dashboard/operator/${selectedTeamUser.id}`
      : `/api/qc-technicians/dashboard-stats/${selectedTeamUser.id}`;
    api(url, 'GET')
      .then((res) => {
        if (cancelled) return;
        const raw = res?.data ?? res;
        const payload = raw?.data !== undefined ? raw.data : raw;
        setUserDashboardData(payload);
      })
      .catch((err) => {
        if (!cancelled) showAlert(err?.message || 'Failed to load user dashboard', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoadingUserDashboard(false);
      });
    return () => { cancelled = true; };
  }, [selectedTeamUser?.id, selectedTeamUser?.role, showAlert]);

  useEffect(() => {
    loadChart().then((Chart) => {
      if (typeof window !== 'undefined') window.Chart = Chart;
      setChartReady(true);
    });
  }, []);

  const projectStatusCounts = React.useMemo(() => {
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
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
        },
      },
    });
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartReady, projectStatusCounts]);

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
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
    return () => {
      if (teamChartInstanceRef.current) teamChartInstanceRef.current.destroy();
    };
  }, [chartReady, teamCounts]);

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.start_date || e.start) >= new Date())
    .sort((a, b) => new Date(a.start_date || a.start) - new Date(b.start_date || b.start))
    .slice(0, 5);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 5);

  if (loading && projects.length === 0 && events.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
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
            Welcome back, {displayName}. Here’s your team, projects, and events at a glance.
          </p>
        </div>
      </div>

      {/* Tab bar: Operator and QC Tech | Calendar | Reports */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-100/60 p-1 gap-0.5 w-fit">
        <button
          type="button"
          onClick={() => { setActiveTab('operator-qc'); setSelectedTeamUser(null); setUserDashboardData(null); }}
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
            <Card className="lg:col-span-1 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Operators & QC Technicians</CardTitle>
                <p className="text-xs text-gray-500 font-normal">Assigned to your projects. Click a user to view their dashboard.</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[420px] overflow-y-auto divide-y">
                  {teamList.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No operators or QC technicians found.</div>
                  ) : (
                    teamList.map((u) => {
                      const id = u._id ?? u.id;
                      const role = String(u.role || '').toLowerCase();
                      const isOperator = role === 'operator';
                      const name = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '—';
                      const isSelected = selectedTeamUser?.id === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            setSelectedTeamUser({
                              id,
                              name,
                              role,
                              firstName: u.first_name,
                              lastName: u.last_name,
                            })
                          }
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isSelected ? 'bg-[#d76b84] text-white shadow-sm' : 'hover:bg-gray-50'
                          }`}
                        >
                          <UserAvatar
                            src={getAvatarUrl(id)}
                            fallback={getInitials(name)}
                            size="sm"
                            className="shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                              {name}
                            </p>
                            <p className={`text-xs truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                              {isOperator ? 'Operator' : 'QC Technician'}
                            </p>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
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
                  <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                </Card>
              ) : (
                <UserDashboardDetail
                  user={selectedTeamUser}
                  data={userDashboardData}
                  isOperator={selectedTeamUser.role === 'operator'}
                  onBack={() => { setSelectedTeamUser(null); setUserDashboardData(null); }}
                  onBackToDashboard={() => { setActiveTab('overview'); setSelectedTeamUser(null); setUserDashboardData(null); }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overview content (default) */}
      {activeTab !== 'operator-qc' && (
        <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-pink-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projects.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-rose-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operators</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamCounts.operators}</p>
              </div>
              <User className="w-8 h-8 text-indigo-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">QC Technicians</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{teamCounts.qc}</p>
              </div>
              <UserCheck className="w-8 h-8 text-emerald-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reports</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{reportsCount}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-rose-500" />
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

      {/* Events list & Projects list */}
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
    </div>
  );
}

function UserDashboardDetail({ user, data, isOperator, onBack, onBackToDashboard }) {
  if (!data) return null;
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={onBackToDashboard}>
            <LayoutDashboard className="w-4 h-4" />
            Back to dashboard
          </Button>
          <CardTitle className="text-base">
            {user?.name} — {isOperator ? 'Operator' : 'QC Technician'} dashboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOperator ? (
          <OperatorDashboardContent data={data} />
        ) : (
          <QCDashboardContent data={data} />
        )}
      </CardContent>
    </Card>
  );
}

function OperatorDashboardContent({ data }) {
  const stats = data?.operationalStats ?? {};
  const recent = data?.recentOperations ?? [];
  const devices = data?.devices ?? [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Active operations</p>
          <p className="text-xl font-bold text-gray-900">{stats.activeOperations ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Equipment online</p>
          <p className="text-xl font-bold text-gray-900">{stats.equipmentOnline ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Maintenance due</p>
          <p className="text-xl font-bold text-gray-900">{stats.maintenanceDue ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">System uptime</p>
          <p className="text-xl font-bold text-gray-900">{stats.systemUptime ?? 0}%</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Critical alerts</p>
          <p className="text-xl font-bold text-gray-900">{stats.criticalAlerts ?? 0}</p>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Devices / recent operations</h4>
        <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
          {(devices.length ? devices : recent).slice(0, 10).map((d) => (
            <div key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-medium">{d.name}</span>
              <span className="text-gray-500 capitalize">{d.status || '—'}</span>
            </div>
          ))}
          {!(devices.length || recent.length) && (
            <div className="px-3 py-4 text-sm text-gray-500">No devices or operations</div>
          )}
        </div>
      </div>
    </div>
  );
}

function QCDashboardContent({ data }) {
  const stats = data?.stats ?? {};
  const recent = data?.recentAssignments ?? [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Total assignments</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalAssignments ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-gray-900">{stats.pendingAssignments ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">In review</p>
          <p className="text-xl font-bold text-gray-900">{stats.inReviewAssignments ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-gray-900">{stats.completedAssignments ?? 0}</p>
        </div>
      </div>
      <div className="rounded-lg border bg-gray-50 p-3">
        <p className="text-xs text-gray-500 mb-1">Review summary</p>
        <p className="text-sm text-gray-700">
          Approved: {stats.totalApproved ?? 0} · Rejected: {stats.totalRejected ?? 0} · Modified: {stats.totalModified ?? 0}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent assignments</h4>
        <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
          {recent.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-medium truncate">{a.projectName}</span>
              <span className="text-gray-500 capitalize shrink-0 ml-2">{a.status}</span>
            </div>
          ))}
          {!recent.length && <div className="px-3 py-4 text-sm text-gray-500">No assignments</div>}
        </div>
      </div>
    </div>
  );
}
