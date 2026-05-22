"use client";

/**
 * DefectTypeBars — stacked-by-defect-type bars across the weekly buckets
 * returned by /api/qc-analytics/personal-defect-trends.
 *
 * Pure CSS / no chart lib: the page already has heavy data tables and a
 * 14-row stacked bar chart doesn't justify pulling chart.js up the tree.
 * Colors come from a small fixed palette mapped to defect types in
 * insertion order — stable across re-renders for a given input.
 */

const PALETTE = [
  "#6366f1", // indigo-500
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#84cc16", // lime-500
];

/** @param {{ weeklyByType: Array<{ weekISO: string, type: string, count: number }> }} props */
export default function DefectTypeBars({ weeklyByType }) {
  if (!Array.isArray(weeklyByType) || weeklyByType.length === 0) {
    return <EmptyState />;
  }

  const { weeks, typeColors, max } = buildBarModel(weeklyByType);

  return (
    <div className="space-y-3">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks.map(({ weekISO, segments, total }) => (
          <div key={weekISO} className="flex flex-col items-center gap-1.5">
            <div className="text-[10px] text-gray-500 tabular-nums">{total}</div>
            <div
              className="w-full max-w-[36px] rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex flex-col-reverse"
              style={{ height: 160 }}
            >
              {segments.map(({ type, count }) => (
                <div
                  key={type}
                  title={`${type}: ${count}`}
                  style={{
                    height: `${(count / Math.max(1, max)) * 100}%`,
                    backgroundColor: typeColors.get(type),
                  }}
                />
              ))}
            </div>
            <div className="text-[10px] text-gray-500 tabular-nums">{formatWeekLabel(weekISO)}</div>
          </div>
        ))}
      </div>

      <Legend typeColors={typeColors} />
    </div>
  );
}

function buildBarModel(rows) {
  const weekMap = new Map();
  const typeColors = new Map();

  for (const row of rows) {
    if (!typeColors.has(row.type)) {
      typeColors.set(row.type, PALETTE[typeColors.size % PALETTE.length]);
    }
    const existing = weekMap.get(row.weekISO) || { weekISO: row.weekISO, segments: [], total: 0 };
    existing.segments.push({ type: row.type, count: row.count });
    existing.total += row.count;
    weekMap.set(row.weekISO, existing);
  }

  const weeks = Array.from(weekMap.values()).sort((a, b) => a.weekISO.localeCompare(b.weekISO));
  const max = weeks.reduce((acc, w) => Math.max(acc, w.total), 0);
  return { weeks, typeColors, max };
}

function Legend({ typeColors }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {Array.from(typeColors.entries()).map(([type, color]) => (
        <div key={type} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">{type}</span>
        </div>
      ))}
    </div>
  );
}

function formatWeekLabel(weekISO) {
  const match = /-W(\d+)/.exec(weekISO);
  return match ? `W${match[1]}` : weekISO;
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-sm text-gray-500">
      No defect activity in this range.
    </div>
  );
}
