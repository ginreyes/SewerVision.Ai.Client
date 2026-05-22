'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HeartPulse,
  ShieldAlert,
  Activity,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useProjectHealthRollup } from '@/hooks/useSharedHooks';

/**
 * Team-lead Project Health row (May 22).
 *
 * Mirrors the admin Project Health Score endpoint
 * (GET /api/projects/:id/health) but scoped to the team-lead's owned projects
 * via the new GET /api/user/project-health-rollup endpoint. The row surfaces
 * the worst-N projects so the dashboard answers "which project should I look
 * at first" without the team lead having to scroll into Projects.
 */

const LEVEL_TONE = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300',
};

const LEVEL_LABEL = {
  low: 'Healthy',
  medium: 'Watch',
  high: 'At risk',
  critical: 'Critical',
};

export default function ProjectHealthRow({ limit = 5 }) {
  const { data, isLoading, isError, error } = useProjectHealthRollup({ limit });
  const rollup = data?.rollup || [];
  const counts = data?.counts || { low: 0, medium: 0, high: 0, critical: 0 };
  const total = data?.totalProjects ?? 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Project health
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} active project{total === 1 ? '' : 's'} · worst first
            </p>
          </div>
          <Link href="/user/project">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isError ? (
          <p className="text-sm text-rose-600">
            Failed to load project health — {error?.message || 'unknown error'}
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Computing project health…
          </div>
        ) : total === 0 ? (
          <p className="text-sm text-gray-500 py-2">No active projects to score.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              <LevelPill tone="critical" label="Critical" value={counts.critical} Icon={ShieldAlert} />
              <LevelPill tone="high" label="At risk" value={counts.high} Icon={ShieldAlert} />
              <LevelPill tone="medium" label="Watch" value={counts.medium} Icon={Activity} />
              <LevelPill tone="low" label="Healthy" value={counts.low} Icon={HeartPulse} />
            </div>

            <ul className="space-y-1.5">
              {rollup.map((row) => (
                <li key={row.projectId}>
                  <Link
                    href={`/user/project?selectedProject=${row.projectId}`}
                    className="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1.5 shrink-0 ${LEVEL_TONE[row.level] || ''}`}
                      >
                        {LEVEL_LABEL[row.level] || row.level}
                      </Badge>
                      <span className="truncate text-sm text-gray-800 dark:text-gray-200">
                        {row.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.topReason ? (
                        <span className="text-[11px] text-gray-500 hidden sm:inline">
                          {row.topReason}
                        </span>
                      ) : null}
                      <span className="text-sm font-bold tabular-nums text-gray-700 dark:text-gray-300">
                        {row.score}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const TONE_BG = {
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function LevelPill({ tone, label, value, Icon }) {
  return (
    <div className={`rounded-md p-2.5 ${TONE_BG[tone]}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
