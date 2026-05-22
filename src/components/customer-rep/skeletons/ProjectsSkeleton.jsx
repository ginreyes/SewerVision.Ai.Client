"use client";

/**
 * Page-specific skeleton for the customer-rep projects list. Three rows of
 * cards approximating the rendered grid; matches the page padding so there's
 * no layout shift when data resolves.
 */
export default function ProjectsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-72 bg-gray-100 rounded" />
        <div className="h-9 w-40 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-40 bg-gray-100 rounded" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
