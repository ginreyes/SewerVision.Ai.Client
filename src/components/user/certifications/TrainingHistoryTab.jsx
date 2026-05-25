'use client';

import React, { useMemo, useState } from 'react';
import {
  History,
  CalendarPlus,
  BellPlus,
  BellRing,
  Zap,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTrainingAudit } from '@/hooks/useSharedHooks';

/**
 * Audit-trail view for the team-lead Training & Certifications page (May 22).
 *
 * Reads AuditLog rows emitted by bulk-renew / bulk-remind / per-record remind
 * (see backend teamTraining.controller.ts:emitTrainingAudit). The backend
 * constrains the action filter to TRAINING_ACTIONS server-side so this
 * surface can't pull non-training audit entries.
 *
 * Columns: when, action (renew/remind/remind-one), who (actor), record count,
 * details (per-action — new expiry on renew, schedule + notified count on
 * bulk-remind, target member on per-record remind).
 */

const ACTION_LABEL = {
  'training.bulk_renew': { label: 'Bulk renew', icon: CalendarPlus, tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  'training.bulk_remind': { label: 'Bulk remind', icon: BellPlus, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  'training.remind': { label: 'Remind member', icon: BellRing, tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
};

const ACTION_FILTER_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'training.bulk_renew', label: 'Bulk renew' },
  { value: 'training.bulk_remind', label: 'Bulk remind' },
  { value: 'training.remind', label: 'Per-member remind' },
];

function formatTimestamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function describeAction(entry) {
  const meta = entry.metadata || {};
  if (entry.action === 'training.bulk_renew') {
    const expiry = meta.newExpiryDate
      ? new Date(meta.newExpiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'unspecified date';
    return `Renewed ${meta.renewedCount ?? entry.recordCount} record${
      (meta.renewedCount ?? entry.recordCount) === 1 ? '' : 's'
    } to expire ${expiry}`;
  }
  if (entry.action === 'training.bulk_remind') {
    return `Scheduled ${meta.reminderSchedule || 'immediate'} reminders for ${entry.recordCount} record${
      entry.recordCount === 1 ? '' : 's'
    }${typeof meta.notifiedCount === 'number' ? ` (${meta.notifiedCount} notified now)` : ''}`;
  }
  if (entry.action === 'training.remind') {
    const memberFragment = entry.memberName ? `${entry.memberName}` : 'a member';
    const daysFragment =
      typeof meta.daysUntilExpiry === 'number'
        ? meta.daysUntilExpiry < 0
          ? `, expired ${Math.abs(meta.daysUntilExpiry)}d ago`
          : `, expires in ${meta.daysUntilExpiry}d`
        : '';
    return `Reminded ${memberFragment}${daysFragment}`;
  }
  return `${entry.action} · ${entry.recordCount} record${entry.recordCount === 1 ? '' : 's'}`;
}

export default function TrainingHistoryTab() {
  const [actionFilter, setActionFilter] = useState('all');
  // Show only forced reminders (24h cooldown overridden). Server-side filter
  // via ?overridden=true so the count reflects all matching rows, not just the
  // current page.
  const [overriddenOnly, setOverriddenOnly] = useState(false);
  const filters = useMemo(() => {
    const f = { limit: 100 };
    if (actionFilter !== 'all') f.action = actionFilter;
    if (overriddenOnly) f.overridden = true;
    return f;
  }, [actionFilter, overriddenOnly]);
  const { data, isLoading, isError, error } = useTrainingAudit(filters);
  const entries = data?.entries || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-500">Action</Label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setOverriddenOnly((v) => !v)}
          aria-pressed={overriddenOnly}
          className={`flex items-center gap-1 h-8 px-2.5 rounded-md border text-xs transition-colors ${
            overriddenOnly
              ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/30 dark:text-orange-300'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Forced only
        </button>
        <span className="text-xs text-gray-500">
          {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · most recent first
        </span>
      </div>

      {isError ? (
        <Card className="border-rose-200 dark:border-rose-900/40">
          <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
            Failed to load history — {error?.message || 'unknown error'}.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading audit history…</span>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
            <Inbox className="w-6 h-6" />
            <span className="text-sm text-center">
              No history yet. Bulk renew, bulk remind, and per-member remind actions appear here once executed.
            </span>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const cfg = ACTION_LABEL[entry.action] || {
              label: entry.action,
              icon: History,
              tone: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            };
            const Icon = cfg.icon;
            return (
              <li key={entry._id}>
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={`p-1.5 rounded-md shrink-0 ${cfg.tone}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${cfg.tone}`}>
                          {cfg.label}
                        </Badge>
                        {entry.cooldownOverridden ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 gap-0.5 bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-900/50"
                            title="24h reminder cooldown was overridden"
                          >
                            <Zap className="w-2.5 h-2.5" />
                            Forced
                          </Badge>
                        ) : null}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(entry.createdAt)}
                        </span>
                        {entry.actorName ? (
                          <span className="text-xs text-gray-500">by {entry.actorName}</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {describeAction(entry)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
