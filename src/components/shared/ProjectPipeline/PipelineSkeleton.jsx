"use client";

function SkeletonColumn({ columnIndex }) {
  return (
    <div className="min-w-[260px] max-w-[300px] flex flex-col bg-gray-50/60 rounded-xl border border-gray-200">
      {/* Color bar placeholder */}
      <div className="h-[3px] rounded-t-xl bg-gray-200 animate-pulse" />

      {/* Header placeholder */}
      <div className="px-3 py-2.5">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Skeleton cards */}
      <div className="px-2 pb-2 space-y-2">
        {[0, 1, 2].map((cardIndex) => (
          <div
            key={cardIndex}
            className="h-32 rounded-xl bg-gray-100 animate-pulse"
            style={{
              animationDelay: `${columnIndex * 100 + cardIndex * 75}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonColumn key={i} columnIndex={i} />
      ))}
    </div>
  );
}
