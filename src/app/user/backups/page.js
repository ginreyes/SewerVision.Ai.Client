'use client';

import React from 'react';
import { Cloud, Database, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BackupLogTable from '@/components/shared/BackupLogTable';
import { useStorageSummary } from '@/hooks/useQueryHooks';

/**
 * User (team lead) backups page — read-only awareness view.
 *
 * Shows minimal provider status (which one is active, are both configured?) + this user's
 * own backup/storage activity log. Byte-level usage is admin-only.
 */
export default function UserBackupsPage() {
  const { data: summary, isLoading, isError } = useStorageSummary();

  const activeProvider = summary?.active || null;
  const primaryRead = summary?.primaryRead || null;
  const b2Configured = summary?.providers?.b2?.configured;
  const s3Configured = summary?.providers?.s3?.configured;

  const providerLabel = {
    b2: 'Backblaze B2',
    s3: 'Amazon S3',
    dual: 'Dual-Write (both)',
  }[activeProvider];

  const providerBadge = {
    b2: 'bg-blue-100 text-blue-700 border-blue-200',
    s3: 'bg-amber-100 text-amber-700 border-amber-200',
    dual: 'bg-purple-100 text-purple-700 border-purple-200',
  }[activeProvider] || 'bg-gray-100 text-gray-600';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header — matches user module style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Storage &amp; Backups</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Track where your team&apos;s files live and when backups run.
            </p>
          </div>
        </div>
      </div>

      {/* Active provider card */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/40 to-purple-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-indigo-100">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-base">Active Storage Destination</CardTitle>
                <CardDescription>
                  Where your team&apos;s new uploads are being stored right now.
                </CardDescription>
              </div>
            </div>
            {isError ? (
              <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unavailable
              </Badge>
            ) : isLoading ? (
              <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
                Loading…
              </Badge>
            ) : (
              <Badge className={providerBadge}>
                {providerLabel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeProvider === 'dual' && primaryRead && (
            <p className="text-xs text-gray-600">
              Files are mirrored to both providers. Reads come from{' '}
              <span className="font-medium">
                {primaryRead === 'b2' ? 'Backblaze B2' : 'Amazon S3'}
              </span>.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
            <span>
              Only admins can change storage settings or trigger backups. Contact your admin
              if you need a migration or a provider switch.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Provider status strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProviderStatusCard
          title="Backblaze B2"
          configured={b2Configured}
          isActive={activeProvider === 'b2' || (activeProvider === 'dual' && primaryRead === 'b2')}
          loading={isLoading}
          dotColor="bg-blue-500"
        />
        <ProviderStatusCard
          title="Amazon S3"
          configured={s3Configured}
          isActive={activeProvider === 's3' || (activeProvider === 'dual' && primaryRead === 's3')}
          loading={isLoading}
          dotColor="bg-amber-500"
        />
      </div>

      {/* Backup activity log — backend role-scopes to this user's actions only */}
      <BackupLogTable
        title="My Backup &amp; Storage Activity"
        description="Admin-triggered backups and provider changes that touched your team's data."
        showStats
      />
    </div>
  );
}

function ProviderStatusCard({ title, configured, isActive, loading, dotColor }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-sm font-semibold text-gray-800">{title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isActive && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] h-4">
                Active
              </Badge>
            )}
            {loading ? (
              <Badge variant="outline" className="text-[10px] h-4 bg-gray-50">
                …
              </Badge>
            ) : configured ? (
              <Badge variant="outline" className="text-[10px] h-4 border-emerald-200 bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-4 border-gray-200 text-gray-500">
                Not configured
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
