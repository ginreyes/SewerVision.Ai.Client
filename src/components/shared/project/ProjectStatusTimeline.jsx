'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Clock } from 'lucide-react';
import { getRoleTheme } from '@/lib/roleThemes';

/* Backend `status` enum from models/Project.ts. Keys not present here will
 * fall back to a neutral grey style. */
const STATUS_LABELS = {
  planning: 'Planning',
  'field-capture': 'Field Capture',
  uploading: 'Uploading',
  'ai-processing': 'AI Processing',
  'qc-review': 'QC Review',
  completed: 'Completed',
  'customer-notified': 'Customer Notified',
  'on-hold': 'On Hold',
};

const STATUS_DOT_COLOR = {
  planning: 'bg-gray-400',
  'field-capture': 'bg-rose-500',
  uploading: 'bg-yellow-500',
  'ai-processing': 'bg-purple-500',
  'qc-review': 'bg-orange-500',
  completed: 'bg-green-500',
  'customer-notified': 'bg-emerald-500',
  'on-hold': 'bg-red-500',
};

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function changedByLabel(changedBy) {
  if (!changedBy) return null;
  if (typeof changedBy === 'string') return null; // raw ObjectId, no name
  const name = [changedBy.first_name, changedBy.last_name].filter(Boolean).join(' ').trim();
  return name || changedBy.username || changedBy.email || null;
}

/**
 * Vertical status-history timeline. Reads `Project.statusHistory[]` which the
 * backend already populates on every status update — no schema work needed,
 * we're just surfacing the data.
 *
 * Newest entry shown at the top. Empty state when the project hasn't had any
 * status transitions recorded yet.
 */
export default function ProjectStatusTimeline({ statusHistory = [], role = 'admin' }) {
  const theme = getRoleTheme(role);
  // Sort newest-first; statusHistory may arrive in insertion order.
  const entries = [...statusHistory].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <Card className={`border ${theme.cardBorder}`}>
      <CardHeader className={`pb-3 ${theme.cardHeaderBg}`}>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className={`w-4 h-4 ${theme.iconText}`} />
          Status History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {entries.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
            <Clock className="w-3.5 h-3.5" />
            No status changes recorded yet.
          </div>
        ) : (
          <ol className="relative border-l border-gray-200 ml-1.5 space-y-4">
            {entries.map((entry, idx) => {
              const dotColor = STATUS_DOT_COLOR[entry.status] || 'bg-gray-400';
              const label = STATUS_LABELS[entry.status] || entry.status;
              const author = changedByLabel(entry.changedBy);
              return (
                <li key={`${entry.status}-${entry.changedAt}-${idx}`} className="ml-4">
                  <span
                    className={`absolute -left-[5px] flex items-center justify-center w-2.5 h-2.5 rounded-full ${dotColor} ring-2 ring-white`}
                    aria-hidden="true"
                  />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                    <span className="text-[11px] text-gray-400">{formatTimestamp(entry.changedAt)}</span>
                  </div>
                  {(author || entry.note) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {author ? <span className="font-medium text-gray-600">{author}</span> : null}
                      {author && entry.note ? ' · ' : null}
                      {entry.note ? <span>{entry.note}</span> : null}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
