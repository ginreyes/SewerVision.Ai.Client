/**
 * unwrapList — normalises the common API response shapes for "list" endpoints
 * into a plain array. Several user pages were duplicating the same fallback
 * chain inline (`Array.isArray(data) ? data : data?.data || []`); migrating
 * them through a single helper means a future shape change touches one spot.
 *
 * Accepts:
 *   - undefined / null  → []
 *   - Array             → as-is
 *   - { data: Array }   → .data
 *   - { data: { records: Array } }  → .data.records (training, etc.)
 *   - anything else     → []
 */
export function unwrapList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') {
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === 'object') {
      if (Array.isArray(raw.data.records)) return raw.data.records;
      if (Array.isArray(raw.data.items)) return raw.data.items;
    }
    if (Array.isArray(raw.records)) return raw.records;
    if (Array.isArray(raw.items)) return raw.items;
  }
  return [];
}

export default unwrapList;
