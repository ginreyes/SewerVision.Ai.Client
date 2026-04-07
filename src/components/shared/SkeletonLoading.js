"use client";

/**
 * Reusable skeleton loading components for SewerVision.ai
 * Usage:
 *   <CardSkeleton />          — single card placeholder
 *   <TableSkeleton rows={5} /> — table rows placeholder
 *   <GridSkeleton count={6} /> — grid of card skeletons
 *   <StatsSkeleton count={4} /> — stat card row
 *   <ProfileSkeleton />       — profile page skeleton
 */

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Pulse className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
    <Pulse className="h-3 w-full" />
    <Pulse className="h-3 w-2/3" />
    <div className="flex justify-between items-center pt-2">
      <Pulse className="h-6 w-20 rounded-full" />
      <Pulse className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const ImageCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <Pulse className="h-36 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Pulse className="h-4 w-3/4" />
      <Pulse className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <Pulse key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
        {Array.from({ length: cols }).map((_, c) => (
          <Pulse key={c} className={`h-3 flex-1 ${c === 0 ? 'w-32' : ''}`} />
        ))}
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ count = 6, withImage = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      withImage ? <ImageCardSkeleton key={i} /> : <CardSkeleton key={i} />
    ))}
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-7 w-16" />
            <Pulse className="h-2 w-24" />
          </div>
          <Pulse className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-5">
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Pulse className="h-28 w-full rounded-none" />
      <div className="px-6 pb-6">
        <div className="flex items-end gap-5 -mt-10 mb-4">
          <Pulse className="w-20 h-20 rounded-full border-4 border-white" />
          <div className="flex-1 space-y-2 pb-1">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-3 w-32" />
            <div className="flex gap-2 mt-2">
              <Pulse className="h-5 w-20 rounded-full" />
              <Pulse className="h-5 w-32 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 text-center space-y-2">
              <Pulse className="h-4 w-8 mx-auto" />
              <Pulse className="h-6 w-12 mx-auto" />
              <Pulse className="h-2 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <Pulse className="h-4 w-36" />
      <div className="grid grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <StatsSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <Pulse className="h-5 w-40" />
          <Pulse className="h-48 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
        <Pulse className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-2/3" />
          <Pulse className="h-3 w-1/3" />
        </div>
        <Pulse className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

// Default export for convenience
const SkeletonLoading = {
  Card: CardSkeleton,
  ImageCard: ImageCardSkeleton,
  Table: TableSkeleton,
  Grid: GridSkeleton,
  Stats: StatsSkeleton,
  Profile: ProfileSkeleton,
  Dashboard: DashboardSkeleton,
  List: ListSkeleton,
};

export default SkeletonLoading;
