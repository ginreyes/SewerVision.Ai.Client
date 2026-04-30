'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { getRoleTheme } from '@/lib/roleThemes';

/* Field labels and ordering. Fields not in this map are still rendered (so
 * custom metadata fields surface), with a humanized label. */
const FIELD_LABELS = {
  recordingDate: 'Recording Date',
  upstreamMH: 'Upstream Manhole',
  downstreamMH: 'Downstream Manhole',
  shape: 'Shape',
  material: 'Material',
  remarks: 'Remarks',
};

const FIELD_ORDER = [
  'recordingDate',
  'upstreamMH',
  'downstreamMH',
  'shape',
  'material',
  'remarks',
];

function humanize(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'recordingDate') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
  return String(value);
}

/**
 * Read-only metadata panel for project detail surfaces. Displays the standard
 * inspection fields in a stable order, then any custom fields the project may
 * have accumulated. Designed for customer / customer-rep views where edits
 * aren't allowed; admin/user already have their own editable panel inline.
 */
export default function ProjectMetadataPanel({ metadata, role = 'customer' }) {
  const theme = getRoleTheme(role);
  const m = metadata || {};
  const knownEntries = FIELD_ORDER
    .filter((k) => k in m)
    .map((k) => [k, m[k]]);
  const customEntries = Object.entries(m).filter(([k]) => !FIELD_ORDER.includes(k));
  const entries = [...knownEntries, ...customEntries];

  if (entries.length === 0) return null;

  return (
    <Card className={`border ${theme.cardBorder}`}>
      <CardHeader className={`pb-3 ${theme.cardHeaderBg}`}>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ClipboardList className={`w-4 h-4 ${theme.iconText}`} />
          Project Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <dl className="space-y-2.5">
          {entries.map(([key, value]) => {
            const label = FIELD_LABELS[key] || humanize(key);
            const isLong = key === 'remarks' || (typeof value === 'string' && value.length > 40);
            return (
              <div
                key={key}
                className={isLong ? 'flex flex-col gap-1' : 'flex items-baseline justify-between gap-3'}
              >
                <dt className="text-xs font-medium text-gray-500 shrink-0">{label}</dt>
                <dd className={`text-sm text-gray-800 ${isLong ? '' : 'text-right truncate'}`}>
                  {formatValue(key, value)}
                </dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
