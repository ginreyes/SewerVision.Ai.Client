'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FileText, MapPin, Calendar, User, Building2,
  AlertTriangle, CheckCircle, BarChart3, Target, Zap, Loader2,
  HardDrive, UserCheck, Clock, Shield, PenLine, Eye,
  Copy, MoreHorizontal, ChevronRight, Share2, Activity,
  TrendingUp, Hash, Flag, Printer, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAlert } from '@/components/providers/AlertProvider';
import reportsApi from '@/data/reportsApi';

/* ─── Avatar / User helpers ─── */
const getInitials = (u) => {
  if (!u) return '?';
  if (u.first_name && u.last_name) return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
  if (u.first_name) return u.first_name[0].toUpperCase();
  if (u.username) return u.username[0].toUpperCase();
  if (u.email) return u.email[0].toUpperCase();
  return '?';
};

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-violet-500',
];
const getAvatarGradient = (str = '') => avatarColors[str.charCodeAt(0) % avatarColors.length];

const getBaseUrl = () =>
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : '';

const avatarSrc = (u) => {
  const id = u?._id || u?.id;
  if (!id) return null;
  return `${getBaseUrl()}/api/users/avatar/${id}`;
};

const getDisplayName = (u) => {
  if (!u) return '—';
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email || '—';
};

/* ─── Status helpers ─── */
const statusConfig = {
  completed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  'in-review': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    icon: Eye,
  },
  draft: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
    icon: FileText,
  },
};

const StatusPill = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  const Icon = cfg.icon;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') : 'Draft';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

/* ─── Grade badge ─── */
const GradeBadge = ({ grade }) => {
  if (!grade) return null;
  const colors = {
    1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    2: 'bg-sky-50 text-sky-700 border-sky-200',
    3: 'bg-amber-50 text-amber-700 border-amber-200',
    4: 'bg-orange-50 text-orange-700 border-orange-200',
    5: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = colors[grade] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cls}`}>
      <Target className="w-3 h-3" />
      Grade {grade}
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
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

/* ─── Person card (compact for sidebar) ─── */
const PersonCard = ({ user, roleLabel, icon: Icon, accentColor = 'rose' }) => {
  if (!user)
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-300" />
        </div>
        <div>
          <p className="text-xs text-gray-400">{roleLabel}</p>
          <p className="text-sm text-gray-400 italic">Unassigned</p>
        </div>
      </div>
    );

  const name = getDisplayName(user);
  const gradient = getAvatarGradient(name);
  const src = avatarSrc(user);

  const handleImgError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) fallback.classList.remove('hidden');
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white shadow overflow-hidden relative`}
      >
        {src ? (
          <>
            <img
              src={src}
              alt={name}
              className="w-full h-full rounded-full object-cover absolute inset-0"
              onError={handleImgError}
            />
            <span className="hidden">{getInitials(user)}</span>
          </>
        ) : (
          <span>{getInitials(user)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={`w-3 h-3 text-${accentColor}-400 flex-shrink-0`} />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{roleLabel}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        {user.role && <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>}
      </div>
    </div>
  );
};

/* ─── Timeline item ─── */
const TimelineItem = ({ icon: Icon, title, time, description, isLast, color = 'bg-rose-500' }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
    </div>
    <div className="pb-5">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      {description && (
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{description}</p>
      )}
    </div>
  </div>
);

/* ─── Metric tile ─── */
const MetricTile = ({ label, value, sublabel, colorClass = 'text-gray-900', bg = 'bg-gray-50', icon: Icon }) => (
  <div className={`${bg} rounded-xl p-4 text-center`}>
    {Icon && <Icon className={`w-4 h-4 mx-auto mb-1.5 ${colorClass} opacity-60`} />}
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-xs font-medium text-gray-600 mt-1">{label}</div>
    {sublabel && <div className="text-[10px] text-gray-400 mt-0.5">{sublabel}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const reportId = params?.reportId;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    reportsApi
      .getReportById(reportId)
      .then((res) => setReport(res?.data ?? res))
      .catch((err) => {
        showAlert(err?.message || 'Failed to load report', 'error');
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [reportId, showAlert]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(reportId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#D76A84]" />
          </div>
          <p className="text-gray-900 font-medium">Loading report details</p>
          <p className="text-gray-400 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  /* ─── Not found state ─── */
  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report not found</h2>
            <p className="text-gray-400 mb-6">The report may have been removed or you don't have access.</p>
            <Button variant="outline" asChild>
              <Link href="/admin/report">← Back to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Derived values ─── */
  const projectName = report.projectId?.name || (report.projectId ? 'Project' : '—');
  const projectLocation = report.projectId?.location || report.location || '—';
  const leader = report.projectId?.managerId;
  const operator = report.operator;
  const qc = report.qcTechnician;
  const createdBy = report.createdBy || operator;
  const createdAt = report.createdAt ? new Date(report.createdAt) : null;
  const updatedAt = report.updatedAt ? new Date(report.updatedAt) : null;

  const sameUser = (a, b) =>
    (a?._id || a) && (b?._id || b) && String(a?._id || a) === String(b?._id || b);
  const isCreatorOperator = sameUser(createdBy, operator);
  const isCreatorQc = sameUser(createdBy, qc);
  const showCreatedByCard = createdBy && !isCreatorOperator && !isCreatorQc;

  const inspectionId = report.inspectionId || 'RPT-' + (reportId?.slice(-6) || '000000');

  // Build activity timeline
  const timeline = [];
  if (createdAt) {
    timeline.push({
      icon: FileText,
      title: 'Report created',
      time: createdAt.toLocaleString(),
      description: createdBy ? `By ${getDisplayName(createdBy)}` : null,
      color: 'bg-gray-400',
    });
  }
  if (operator) {
    timeline.push({
      icon: User,
      title: `Operator: ${getDisplayName(operator)}`,
      time: createdAt ? createdAt.toLocaleString() : '—',
      description: operator.role ? `Role: ${operator.role}` : null,
      color: 'bg-sky-500',
    });
  }
  if (qc) {
    timeline.push({
      icon: Shield,
      title: `QC Review: ${getDisplayName(qc)}`,
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: null,
      color: 'bg-emerald-500',
    });
  }
  if (report.status?.toLowerCase() === 'completed') {
    timeline.push({
      icon: CheckCircle,
      title: 'Report completed',
      time: updatedAt ? updatedAt.toLocaleString() : '—',
      description: report.overallGrade ? `Grade: ${report.overallGrade}` : null,
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {inspectionId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {projectName !== '—' ? projectName : report.location || 'Inspection Report'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {report.reportType || 'PACP Condition Assessment'}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusPill status={report.status} />
              <GradeBadge grade={report.overallGrade} />
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
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
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
            label: 'Footage',
            value: `${report.footage ?? 0} ft`,
            icon: TrendingUp,
            iconBg: 'bg-sky-50 text-sky-600',
          },
          {
            label: 'Total Defects',
            value: report.totalDefects ?? 0,
            icon: AlertTriangle,
            iconBg: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Critical',
            value: report.criticalDefects ?? 0,
            icon: Flag,
            iconBg: 'bg-red-50 text-red-600',
          },
          {
            label: 'AI Confidence',
            value: `${report.confidence != null ? Number(report.confidence).toFixed(1) : 0}%`,
            icon: Zap,
            iconBg: 'bg-violet-50 text-violet-600',
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
              <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── Left column ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Project & Location */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                Project & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="pr-0 sm:pr-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Building2}
                    label="Project"
                    value={projectName}
                    iconColor="text-rose-500"
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Location"
                    value={projectLocation}
                    iconColor="text-emerald-500"
                  />
                </div>
                <div className="pl-0 sm:pl-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Calendar}
                    label="Inspection Date"
                    value={
                      report.date ||
                      (createdAt
                        ? createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—')
                    }
                    iconColor="text-sky-500"
                  />
                  <InfoRow
                    icon={FileText}
                    label="Report Type"
                    value={report.reportType || 'PACP'}
                    iconColor="text-violet-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                <div className="pr-0 sm:pr-4 space-y-0 divide-y divide-gray-50">
                  <InfoRow
                    icon={Clock}
                    label="Created"
                    value={
                      createdAt
                        ? createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'
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
                    icon={Hash}
                    label="Report ID"
                    value={<span className="font-mono text-xs">{inspectionId}</span>}
                    iconColor="text-gray-400"
                  />
                </div>
                <div className="pl-0 sm:pl-4 space-y-0 divide-y divide-gray-50">
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
                    iconColor="text-amber-500"
                  />
                  <InfoRow
                    icon={BarChart3}
                    label="Overall Grade"
                    value={report.overallGrade || '—'}
                    iconColor="text-rose-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Metrics */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Inspection Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricTile label="Footage" value={report.footage ?? 0} sublabel="feet" icon={TrendingUp} />
                <MetricTile label="Total Defects" value={report.totalDefects ?? 0} icon={AlertTriangle} />
                <MetricTile
                  label="Critical"
                  value={report.criticalDefects ?? 0}
                  colorClass="text-red-600"
                  bg="bg-red-50"
                  icon={Flag}
                />
                <MetricTile
                  label="AI Confidence"
                  value={`${report.confidence != null ? Number(report.confidence).toFixed(1) : 0}%`}
                  colorClass="text-violet-600"
                  bg="bg-violet-50"
                  icon={Zap}
                />
              </div>

              {report.aiDetections != null && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <MetricTile
                    label="AI Detections"
                    value={report.aiDetections}
                    colorClass="text-sky-700"
                    bg="bg-sky-50"
                    icon={Eye}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues */}
          {report.issues && report.issues.length > 0 && (
            <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden border-l-4 border-l-amber-400">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Issues ({report.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {report.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-gray-700"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {issue}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right column (sidebar) ─── */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Quick Actions</CardTitle>
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
                  label: 'Download Report',
                  icon: Download,
                  color: 'text-violet-600',
                  bg: 'hover:bg-violet-50',
                },
                {
                  label: 'Print Report',
                  icon: Printer,
                  color: 'text-amber-600',
                  bg: 'hover:bg-amber-50',
                },
                {
                  label: 'Share Report',
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

          {/* Team & Personnel */}
          <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Team & Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {showCreatedByCard && (
                <PersonCard user={createdBy} roleLabel="Created by" icon={PenLine} accentColor="rose" />
              )}
              <PersonCard
                user={operator}
                roleLabel={isCreatorOperator ? 'Operator (created)' : 'Operator'}
                icon={User}
                accentColor="blue"
              />
              <PersonCard
                user={qc}
                roleLabel={isCreatorQc ? 'QC Technician (created)' : 'QC Technician'}
                icon={Shield}
                accentColor="emerald"
              />
              <PersonCard user={leader} roleLabel="Team Leader" icon={UserCheck} accentColor="purple" />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
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
                <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}