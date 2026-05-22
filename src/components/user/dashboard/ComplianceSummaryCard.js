'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  CalendarClock,
  AlertOctagon,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useTeamCertificationSummary } from '@/hooks/useSharedHooks';

/**
 * Team-lead dashboard compliance widget (May 21).
 *
 * Pills sit on the user dashboard above Recent Projects so the team-lead
 * sees compliance health at a glance on load. Backed by
 * GET /api/user/certifications/team-summary which derives status from the
 * latest expiry — a row stored as 'active' months ago still rolls into
 * 'expired' here if its expiry has passed.
 *
 * `onSelectMember` (optional) opens the dashboard's per-member compliance
 * side-panel; falls back to a Link to /user/certifications if not supplied.
 */
function ComplianceSummaryCard({ onSelectMember }) {
  const { data, isLoading, isError, error } = useTeamCertificationSummary();

  const active = data?.activeCount ?? 0;
  const expiring = data?.expiringCount ?? 0;
  const expired = data?.expiredCount ?? 0;
  const total = data?.totalRecords ?? 0;
  const riskList = data?.riskMembersList || [];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Team compliance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} tracked record{total === 1 ? '' : 's'} across your direct reports
            </p>
          </div>
          <Link href="/user/certifications">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Manage <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isError ? (
          <p className="text-sm text-rose-600">
            Failed to load compliance summary — {error?.message || 'unknown error'}
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Computing compliance…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Pill
                tone="emerald"
                label="Active"
                value={active}
                Icon={ShieldCheck}
              />
              <Pill
                tone="amber"
                label="Expiring"
                value={expiring}
                Icon={CalendarClock}
              />
              <Pill
                tone="rose"
                label="Expired"
                value={expired}
                Icon={AlertOctagon}
              />
            </div>

            {riskList.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Members to triage
                </p>
                <ul className="space-y-1">
                  {riskList.slice(0, 5).map((m) => (
                    <li key={m.memberId}>
                      <button
                        type="button"
                        onClick={() => onSelectMember?.(m)}
                        className="w-full flex items-center justify-between gap-2 text-left text-sm px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="truncate text-gray-700 dark:text-gray-300">
                          {m.memberName}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {m.expired > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                            >
                              {m.expired} expired
                            </Badge>
                          )}
                          {m.expiring > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              {m.expiring} expiring
                            </Badge>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function Pill({ tone, label, value, Icon }) {
  return (
    <div className={`rounded-lg p-3 ${TONE_CLASSES[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}

// memo'd (May 22) so neighbouring widgets refetching upstream (useUserDashboard
// + useProjectHealthRollup) don't cascade a re-render into this card just to
// re-paint the same useTeamCertificationSummary data. Callers need to wrap
// onSelectMember in useCallback for the memo to actually hold.
export default memo(ComplianceSummaryCard);
