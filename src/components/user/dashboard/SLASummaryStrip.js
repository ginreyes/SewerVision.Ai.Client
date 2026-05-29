'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, AlertTriangle, Clock3, CheckCircle2, Loader2 } from 'lucide-react';
import { useSLAStatus } from '@/data/pipelineApi';

const TONE = {
  overdue:  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300',
  atRisk:   'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  onTrack:  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  total:    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
};

function Tile({ tone, label, value, Icon }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${TONE[tone]}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
        <div className="text-lg font-bold tabular-nums leading-none">{value}</div>
      </div>
    </div>
  );
}

export default function SLASummaryStrip({ managerId }) {
  const { data, isLoading, isError, error } = useSLAStatus(managerId);
  const summary = data?.summary;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-500" />
              SLA at a glance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Pipeline target compliance for active projects
            </p>
          </div>
          {summary ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Compliance {summary.complianceRate}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                Avg {summary.averagePercentUsed}% used
              </Badge>
            </div>
          ) : null}
        </div>

        {isError ? (
          <p className="text-sm text-rose-600">
            Failed to load SLA summary — {error?.message || 'unknown error'}
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Computing SLA summary…
          </div>
        ) : !summary || summary.total === 0 ? (
          <p className="text-sm text-gray-500 py-2">No active projects to track.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Tile tone="total"   label="Total"    value={summary.total}    Icon={Gauge} />
            <Tile tone="overdue" label="Overdue"  value={summary.overdue}  Icon={AlertTriangle} />
            <Tile tone="atRisk"  label="At risk"  value={summary.atRisk}   Icon={Clock3} />
            <Tile tone="onTrack" label="On track" value={summary.onTrack}  Icon={CheckCircle2} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
