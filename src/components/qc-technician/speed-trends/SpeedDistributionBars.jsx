"use client";

/**
 * SpeedDistributionBars — stacked-by-bucket bars showing how the
 * technician's review-decision durations land across speed buckets
 * (under-30s, 30s-2min, 2-5min, 5min+) over the range.
 *
 * Pure CSS, matching the visual language of DefectTypeBars in the
 * sibling /defect-trends page. Sized to the same 160px chart height so
 * the two pages feel coherent.
 */

const BUCKET_ORDER = ["lt30s", "lt2m", "lt5m", "gte5m"];

const BUCKET_META = {
  lt30s: { label: "< 30s", color: "#10b981" },
  lt2m: { label: "30s – 2m", color: "#06b6d4" },
  lt5m: { label: "2m – 5m", color: "#f59e0b" },
  gte5m: { label: "5m+", color: "#ef4444" },
};

/**
 * @param {{
 *   dailyByBucket: Array<{ dayISO: string, lt30s: number, lt2m: number, lt5m: number, gte5m: number }>,
 * }} props
 */
export default function SpeedDistributionBars({ dailyByBucket }) {
  if (!Array.isArray(dailyByBucket) || dailyByBucket.length === 0) {
    return <EmptyState />;
  }

  const max = dailyByBucket.reduce(
    (acc, d) => Math.max(acc, sumBuckets(d)),
    0
  );

  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${dailyByBucket.length}, minmax(0, 1fr))` }}
      >
        {dailyByBucket.map((day) => {
          const total = sumBuckets(day);
          return (
            <div key={day.dayISO} className="flex flex-col items-center gap-1.5">
              <div className="text-[10px] text-gray-500 tabular-nums">{total}</div>
              <div
                className="w-full max-w-[28px] rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex flex-col-reverse"
                style={{ height: 160 }}
              >
                {BUCKET_ORDER.map((bucket) => {
                  const count = day[bucket] || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={bucket}
                      title={`${BUCKET_META[bucket].label}: ${count}`}
                      style={{
                        height: `${(count / Math.max(1, max)) * 100}%`,
                        backgroundColor: BUCKET_META[bucket].color,
                      }}
                    />
                  );
                })}
              </div>
              <div className="text-[10px] text-gray-500 tabular-nums">
                {formatDayLabel(day.dayISO)}
              </div>
            </div>
          );
        })}
      </div>

      <Legend />
    </div>
  );
}

function sumBuckets(day) {
  return BUCKET_ORDER.reduce((acc, b) => acc + (day[b] || 0), 0);
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {BUCKET_ORDER.map((bucket) => (
        <div
          key={bucket}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800"
        >
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: BUCKET_META[bucket].color }}
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {BUCKET_META[bucket].label}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatDayLabel(dayISO) {
  try {
    const d = new Date(dayISO);
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  } catch {
    return dayISO;
  }
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-sm text-gray-500">
      No reviews in this range.
    </div>
  );
}
