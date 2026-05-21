'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CalendarClock, AlertOctagon, Loader2 } from 'lucide-react';
import { useTeamMemberTraining } from '@/hooks/useSharedHooks';

/**
 * Side-panel showing a single team-member's training/certification rollup
 * (May 21). Opens from the dashboard's TeamMemberList rows + the
 * ComplianceSummaryCard riskMembersList. Grouped by category for an
 * at-a-glance read; per-row tone matches the certifications page.
 */

const CATEGORY_LABELS = {
  safety: 'Safety',
  qc_certification: 'QC certification',
  device_certification: 'Device certification',
  compliance: 'Compliance',
  onboarding: 'Onboarding',
  other: 'Other',
};

const STATUS_TONES = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
  expired: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300',
  pending: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
};

export default function MemberComplianceSidePanel({ memberId, memberName, open, onOpenChange }) {
  const { data, isLoading, isError, error } = useTeamMemberTraining(memberId, {
    enabled: !!memberId && open,
  });

  const counts = data?.counts || { total: 0, active: 0, expiring: 0, expired: 0, pending: 0 };
  const byCategory = data?.byCategory || {};
  const categoryKeys = Object.keys(byCategory);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{memberName || 'Member compliance'}</SheetTitle>
          <SheetDescription>
            Training and certification rollup grouped by category.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {isError ? (
            <p className="text-sm text-rose-600">
              Failed to load — {error?.message || 'unknown error'}
            </p>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : counts.total === 0 ? (
            <p className="text-sm text-gray-500">No tracked records for this member.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <CountPill tone="emerald" label="Active" value={counts.active} Icon={ShieldCheck} />
                <CountPill tone="amber" label="Expiring" value={counts.expiring} Icon={CalendarClock} />
                <CountPill tone="rose" label="Expired" value={counts.expired} Icon={AlertOctagon} />
              </div>

              {categoryKeys.map((cat) => (
                <div key={cat} className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                    {CATEGORY_LABELS[cat] || cat}
                  </p>
                  <ul className="space-y-1.5">
                    {byCategory[cat].map((r) => (
                      <li
                        key={r._id}
                        className="rounded-md border border-gray-200 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {formatExpiry(r.daysUntilExpiry, r.derivedStatus)}
                              {r.issuer ? ` · ${r.issuer}` : ''}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-4 px-1.5 shrink-0 ${STATUS_TONES[r.derivedStatus] || ''}`}
                          >
                            {r.derivedStatus}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatExpiry(days, status) {
  if (status === 'pending') return 'Pending verification';
  if (days === null || days === undefined) return 'No expiry on file';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `Expires in ${days}d`;
}

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function CountPill({ tone, label, value, Icon }) {
  return (
    <div className={`rounded-md p-2.5 ${TONE_CLASSES[tone]}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
