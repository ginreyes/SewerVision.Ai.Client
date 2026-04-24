import { getSnapshotUrl } from './getVideoUrl';

/**
 * Severity / pacp color mapping for the timeline dot in the SNAPSHOTS card.
 * Keep these synced with the badge colors used elsewhere (SeverityBadge, etc.).
 */
const SEVERITY_COLOR = {
  critical: 'bg-red-600',
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

/**
 * Project snapshots = (user-created Snapshot docs) + (AI observations with snapshotUrl).
 *
 * The SNAPSHOTS card used to read only from the Snapshot collection, so AI-generated
 * snapshots (which the videoProcessingService writes to Observation.snapshotUrl) never
 * showed up there. This helper normalizes both sources to the same shape so the card
 * renders them side by side.
 *
 * @param {Array} manualSnapshots — docs from GET /api/snapshots/get-all-snapshots
 * @param {Array} observations — observations from useProjectObservations (must be the
 *   RAW list, not paginated-only page; the caller should fetch all if possible)
 * @returns {Array} normalized timeline items, sorted by created date descending
 */
export function deriveProjectSnapshots(manualSnapshots = [], observations = []) {
  const fromManual = (Array.isArray(manualSnapshots) ? manualSnapshots : []).map((s) => ({
    id: s._id || s.id,
    source: 'manual',
    imageUrl: s.imageUrl && s.imageUrl.startsWith('data:')
      ? s.imageUrl
      : getSnapshotUrl(s.imageUrl),
    label: s.label || 'Snapshot',
    distance: s.distance || 'N/A',
    confidence: undefined,
    color: s.color || 'bg-gray-500',
    timestamp: s.createdAt || s.created_at || s.timestamp,
  }));

  const fromObservations = (Array.isArray(observations) ? observations : [])
    .filter((o) => o && o.snapshotUrl)
    .map((o) => ({
      id: o._id,
      source: 'ai',
      imageUrl: getSnapshotUrl(o.snapshotUrl),
      label: o.pacpCode ? `${o.pacpCode} — ${o.observation || ''}`.trim() : (o.observation || 'Detection'),
      distance: o.distance || 'N/A',
      confidence: typeof o.confidence === 'number'
        ? Math.round(o.confidence <= 1 ? o.confidence * 100 : o.confidence)
        : undefined,
      color: SEVERITY_COLOR[o.severity] || 'bg-gray-500',
      timestamp: o.createdAt || o.created_at,
    }));

  const all = [...fromManual, ...fromObservations];
  all.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });
  return all;
}
