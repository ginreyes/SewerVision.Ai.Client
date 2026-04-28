"use client";

import React, { useState, useMemo } from "react";
import { Search, FolderOpen, MapPin, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ProjectsSkeleton from "@/components/customer-rep/skeletons/ProjectsSkeleton";

const STATUS_COLORS = {
  planning: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  "field-capture": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  uploading: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  "ai-processing": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  "qc-review": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  "customer-notified": "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
  "on-hold": "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "planning", label: "Planning" },
  { value: "field-capture", label: "Field Capture" },
  { value: "uploading", label: "Uploading" },
  { value: "ai-processing", label: "AI Processing" },
  { value: "qc-review", label: "QC Review" },
  { value: "completed", label: "Completed" },
  { value: "customer-notified", label: "Customer Notified" },
  { value: "on-hold", label: "On Hold" },
];

const PAGE_SIZE = 20;

export default function CustomerRepProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever filters change.
  React.useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const { data: projectsData, isLoading, isFetching } = useQuery({
    queryKey: ["customer-rep", "projects", { page, search: debouncedSearch, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      const { data } = await api(`/api/projects/get-all-projects?${params.toString()}`);
      return data || {};
    },
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });

  const projects = useMemo(() => {
    const all = Array.isArray(projectsData?.data) ? projectsData.data : [];
    return all;
  }, [projectsData]);

  const totalPages = projectsData?.totalPages || 1;
  const total = projectsData?.total || projects.length;

  if (isLoading) return <ProjectsSkeleton />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">View pipeline inspection projects and their current status</p>
        </div>
        <div className="text-xs text-gray-500">
          {total.toLocaleString()} project{total === 1 ? "" : "s"}
          {isFetching && <span className="ml-2 text-rose-600">refreshing…</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, client, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No projects found</p>
          <p className="text-xs mt-1">
            {debouncedSearch || statusFilter !== "all"
              ? "Try a different search term or status filter"
              : "No projects in the system yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm"
                onClick={() => router.push(`/customer-rep/projects/${project._id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 truncate flex-1 mr-2">{project.name}</h3>
                    <Badge className={`text-[10px] shrink-0 ${STATUS_COLORS[project.status] || STATUS_COLORS["on-hold"]}`}>
                      {(project.status || "unknown").replace(/-/g, " ")}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    {project.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    )}
                    {project.client && (
                      <div className="flex items-center gap-1.5">
                        <FolderOpen className="w-3 h-3" />
                        <span className="truncate">{project.client}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-medium text-gray-600">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#374151] rounded-full h-1.5">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
                      <Eye className="w-3 h-3" /> View Details
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
