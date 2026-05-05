'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  Shield,
  ClipboardList,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Download,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeroBanner from '@/components/shared/PageHeroBanner';
import { BarChart, DonutRing } from '@/components/shared/charts';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUserTeamAnalyticsMetrics } from '@/hooks/useQueryHooks';
import { exportToExcel } from '@/lib/csvExport';

function MetricCard({ icon: Icon, label, value, sub, iconBg, iconColor }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-xs font-medium text-gray-600">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function UserAnalyticsPage() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { data, isLoading } = useUserTeamAnalyticsMetrics(userId);

  const trendData = useMemo(
    () => (data?.trend7d || []).map((d) => ({ value: d.count, label: d.label })),
    [data?.trend7d]
  );

  const handleExport = () => {
    if (!data) return;
    const rows = [
      { metric: 'Team total', value: data.kpis.teamTotal },
      { metric: 'Operators', value: data.kpis.operators },
      { metric: 'QC technicians', value: data.kpis.qcTechs },
      { metric: 'Active projects', value: data.kpis.activeProjects },
      { metric: 'Completed projects', value: data.kpis.completedProjects },
      { metric: 'Completion rate (%)', value: data.kpis.completionPct },
      { metric: 'Reports', value: data.kpis.reportsCount },
      ...data.trend7d.map((d) => ({ metric: `Projects created on ${d.iso}`, value: d.count })),
    ];
    exportToExcel(
      rows,
      [
        { key: 'metric', label: 'Metric' },
        { key: 'value', label: 'Value' },
      ],
      'team-analytics'
    );
    showAlert('Team analytics exported', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading analytics...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const roleSplit = data?.roleSplit || { operators: 0, qcTechs: 0, total: 0 };
  const operatorPct = roleSplit.total > 0 ? Math.round((roleSplit.operators / roleSplit.total) * 100) : 0;
  const qcPct = roleSplit.total > 0 ? Math.round((roleSplit.qcTechs / roleSplit.total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeroBanner
        role="team"
        title="Team Analytics"
        subtitle="Roll-up of team composition, project pipeline, and 7-day activity."
        icon={<BarChart3 className="w-6 h-6" />}
      >
        <div className="flex justify-end mt-1">
          <Button onClick={handleExport} variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>
      </PageHeroBanner>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={Users}
          label="Team total"
          value={kpis.teamTotal ?? 0}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricCard
          icon={Briefcase}
          label="Operators"
          value={kpis.operators ?? 0}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          icon={Shield}
          label="QC technicians"
          value={kpis.qcTechs ?? 0}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <MetricCard
          icon={ClipboardList}
          label="Active projects"
          value={kpis.activeProjects ?? 0}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={kpis.completedProjects ?? 0}
          sub={`${kpis.completionPct ?? 0}% completion`}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <MetricCard
          icon={FileText}
          label="Reports"
          value={kpis.reportsCount ?? 0}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Projects created — last 7 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <BarChart data={trendData} colorClass="bg-indigo-400" height={140} showValues showLabels />
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No project activity in the last 7 days.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Team role split
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roleSplit.total > 0 ? (
              <div className="grid grid-cols-2 gap-4 py-2">
                <DonutRing
                  pct={operatorPct}
                  size={110}
                  stroke={12}
                  colorClass="stroke-amber-500"
                  label="Operators"
                  sublabel={`${roleSplit.operators} of ${roleSplit.total}`}
                />
                <DonutRing
                  pct={qcPct}
                  size={110}
                  stroke={12}
                  colorClass="stroke-violet-500"
                  label="QC techs"
                  sublabel={`${roleSplit.qcTechs} of ${roleSplit.total}`}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No team members yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
