'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Shield,
  Cloud,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  StopCircle,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useBackupLogs } from '@/hooks/useQueryHooks';

/**
 * Shared backup/storage audit log view.
 * Used by admin/uploads (history tab), user/backups, and operator/backups pages.
 *
 * Backend role-scopes results — admins see everything, non-admins see only
 * their own actions. Front-end just renders what comes back.
 */
const ACTION_META = {
  storage_config_updated: {
    label: 'Provider Changed',
    icon: Settings,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  storage_config_tested: {
    label: 'Connection Test',
    icon: ShieldCheck,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  storage_migration_started: {
    label: 'Backup Started',
    icon: ArrowRightLeft,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  storage_migration_completed: {
    label: 'Backup Completed',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  storage_migration_cancelled: {
    label: 'Backup Cancelled',
    icon: StopCircle,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  storage_migration_failed: {
    label: 'Backup Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

const ACTION_FILTER_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'storage_migration_started', label: 'Backups Started' },
  { value: 'storage_migration_completed', label: 'Backups Completed' },
  { value: 'storage_migration_cancelled', label: 'Backups Cancelled' },
  { value: 'storage_migration_failed', label: 'Backups Failed' },
  { value: 'storage_config_updated', label: 'Provider Changes' },
  { value: 'storage_config_tested', label: 'Connection Tests' },
];

const relativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const formatMetadata = (action, metadata) => {
  if (!metadata) return null;
  switch (action) {
    case 'storage_migration_started':
      return metadata.direction === 'b2-to-s3' ? 'B2 → S3' : 'S3 → B2';
    case 'storage_migration_completed':
      return `${metadata.migrated || 0} copied · ${metadata.skipped || 0} skipped · ${metadata.failed || 0} failed`;
    case 'storage_migration_cancelled':
      return `${metadata.migrated || 0}/${metadata.total || '?'} done before cancel`;
    case 'storage_migration_failed':
      return metadata.error || 'Unknown error';
    case 'storage_config_updated': {
      const parts = [];
      if (metadata.provider) parts.push(`active = ${metadata.provider}`);
      if (metadata.secretRotated) parts.push('secret rotated');
      return parts.join(' · ');
    }
    case 'storage_config_tested':
      return metadata.ok ? `✓ ${metadata.bucket}` : `✗ ${metadata.bucket}`;
    default:
      return null;
  }
};

export default function BackupLogTable({
  title = 'Backup & Storage Activity',
  description = 'Who changed storage settings and when backups ran.',
  showStats = true,
  accentColor = 'blue',
  pageSize = 25,
}) {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Simple debounce
  React.useEffect(() => {
    const h = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(h);
  }, [search]);

  const filters = {
    page,
    limit: pageSize,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    search: searchDebounced || undefined,
  };

  const { data, isLoading, refetch, isFetching } = useBackupLogs(filters);

  const logs = data?.logs || [];
  const pagination = data?.pagination || { total: 0, totalPages: 0 };
  const stats = data?.stats;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Backups Started" value={stats.started} icon={ArrowRightLeft} color="purple" />
          <MiniStat label="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" />
          <MiniStat label="Cancelled" value={stats.cancelled} icon={StopCircle} color="amber" />
          <MiniStat label="File Failures" value={stats.fileFailures} icon={AlertTriangle} color="red" />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search by actor, username, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[200px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Log entries */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Cloud className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No storage activity yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Actions like provider changes and backup runs will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const meta = ACTION_META[log.action] || {
                  label: log.action,
                  icon: Cloud,
                  color: 'bg-gray-100 text-gray-700 border-gray-200',
                };
                const Icon = meta.icon;
                const detail = formatMetadata(log.action, log.metadata);
                return (
                  <div
                    key={log._id}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition"
                  >
                    <div className={`p-1.5 rounded-md border ${meta.color} flex-shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{meta.label}</span>
                        {log.severity && log.severity !== 'low' && (
                          <Badge variant="outline" className={`text-[10px] h-4 ${severityColor(log.severity)}`}>
                            {log.severity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span>
                          by <strong className="text-gray-700">{log.targetSnapshot?.username || log.actor || 'unknown'}</strong>
                          {log.targetSnapshot?.email && (
                            <span className="text-gray-400"> ({log.targetSnapshot.email})</span>
                          )}
                        </span>
                        {log.actorRole && (
                          <Badge variant="outline" className="text-[10px] h-4 bg-gray-50">
                            {log.actorRole}
                          </Badge>
                        )}
                        <span>·</span>
                        <span>{relativeTime(log.createdAt)}</span>
                        {log.ipAddress && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px]">{log.ipAddress}</span>
                          </>
                        )}
                      </div>
                      {detail && (
                        <p className="text-xs text-gray-600 mt-1">{detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }) {
  const palette = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-600', value: 'text-purple-900' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', value: 'text-emerald-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', value: 'text-amber-900' },
    red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-600', value: 'text-red-900' },
  }[color] || { bg: 'bg-gray-50', border: 'border-gray-100', icon: 'text-gray-600', value: 'text-gray-900' };
  return (
    <div className={`p-3 rounded-lg border ${palette.border} ${palette.bg}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">{label}</p>
        <Icon className={`w-3.5 h-3.5 ${palette.icon}`} />
      </div>
      <p className={`text-xl font-bold mt-1 ${palette.value}`}>{value ?? 0}</p>
    </div>
  );
}

function severityColor(sev) {
  if (sev === 'critical') return 'bg-red-100 text-red-700 border-red-200';
  if (sev === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (sev === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}
