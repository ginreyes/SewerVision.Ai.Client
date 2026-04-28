"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Loader2, LayoutGrid, Rows, MoreVertical, Eye, Pencil, MapPin, GitCompare, Columns3 } from "lucide-react";
import dynamic from "next/dynamic";
import StatusLegend from "@/components/shared/StatusLegend";

const ProjectLiveTrackerView = dynamic(() => import("@/components/shared/ProjectLiveTrackerView"), { ssr: false });
const ProjectCompare = dynamic(() => import("@/components/admin/project/ProjectCompare"), { ssr: false });
import { Button } from "@/components/ui/button";
import ExportButton from '@/components/shared/ExportButton';
import EmptyState from '@/components/shared/EmptyState';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import ProjectCard from "@/components/admin/project/ProjectCard";
import ProjectDetail from "@/components/admin/project/ProjectDetail";
import ProjectChatDrawer from "@/components/shared/project-chat/ProjectChatDrawer";
import ProjectHealthBadge from "@/components/admin/project/ProjectHealthBadge";
import ProjectTimelineLauncher from "@/components/shared/project-timeline/ProjectTimelineLauncher";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAdminProjects } from '@/hooks/useQueryHooks';
import { PipelineBoard } from '@/components/shared/ProjectPipeline';
import PipelineAnalyticsStrip from '@/components/admin/project/PipelineAnalyticsStrip';
import BulkActionsToolbar from '@/components/admin/project/BulkActionsToolbar';
import { usePipeline } from '@/data/pipelineApi';
import { SavedViewsDropdown, useSavedViewSync } from '@/components/shared/SavedViews';
import { BulkActionBar, BulkResultToast } from '@/components/shared/bulk';
import { useBulkMutation } from '@/data/bulkApi';
import { useDialog } from '@/components/providers/DialogProvider';
import { BulkAssignModal, BulkStatusModal, BulkTagModal } from '@/components/admin/project/BulkProjectModals';

const SewerVisionInspectionModuleContent = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchValue = useDebouncedValue(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table' | 'tracker' | 'compare' | 'pipeline'
  const [selectedIds, setSelectedIds] = useState([]);
  // Sort by health (only meaningful in table view). Cycles off → desc → asc.
  const [healthSort, setHealthSort] = useState("off");

  // Saved Views: two-way bind current filters <-> selected SavedView + URL
  const {
    activeViewId,
    applyView,
    clearView,
    snapshot: snapshotFilters,
  } = useSavedViewSync({
    applyFilters: (filters) => {
      if (typeof filters.searchTerm === 'string') setSearchTerm(filters.searchTerm);
      if (typeof filters.statusFilter === 'string') setStatusFilter(filters.statusFilter);
      if (typeof filters.viewMode === 'string') setViewMode(filters.viewMode);
    },
    captureFilters: () => ({
      searchTerm,
      statusFilter,
      viewMode,
    }),
  });
  const navigatingBackRef = useRef(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const selectedProjectId = searchParams.get('selectedProject');
  const initialTime = searchParams.get('time');

  const isOperatorRoute = pathname?.startsWith('/operator');

  const [page, setPage] = useState(1);
  const limit = 6;

  const { showAlert } = useAlert();

  const { data: projectsData, isLoading, refetch } = useAdminProjects({
    page,
    limit,
    search: debouncedSearchValue,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const totalPages = projectsData?.totalPages || 1;

  // Health-sort wrapper. Looks up cached health scores from TanStack Query
  // (populated as ProjectHealthBadge mounts). Rows without a cached score
  // sort last so the toggle still feels responsive on first load.
  const queryClient = useQueryClient();
  const tableProjects = useMemo(() => {
    if (healthSort === 'off') return projects;
    const scoreFor = (p) => {
      const cached = queryClient?.getQueryData(['projectHealth', p._id]);
      return cached?.score ?? cached?.healthScore ?? null;
    };
    const dir = healthSort === 'asc' ? 1 : -1;
    return [...projects].sort((a, b) => {
      const sa = scoreFor(a);
      const sb = scoreFor(b);
      if (sa === null && sb === null) return 0;
      if (sa === null) return 1;
      if (sb === null) return -1;
      return (sa - sb) * dir;
    });
  }, [projects, healthSort, queryClient]);

  const { data: pipelineData, isLoading: pipelineLoading } = usePipeline({});

  // Bulk Actions v2 — wires list-view multi-select to the shared bulk surface
  const bulkMutation = useBulkMutation('project');
  const [bulkResult, setBulkResult] = useState(null);
  const { showDelete } = useDialog();
  // Open modal: 'assign' | 'status' | 'tag' | null
  const [bulkModal, setBulkModal] = useState(null);

  const runBulk = (op, payload) => {
    bulkMutation.mutate(
      { ids: selectedIds, op, payload },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          setSelectedIds([]);
          setBulkModal(null);
          refetch();
        },
        onError: (err) => {
          showAlert(err.message || 'Bulk op failed', 'error');
        },
      }
    );
  };

  const handleBulkAction = (op, action) => {
    if (action?.destructive) {
      showDelete({
        title: `Delete ${selectedIds.length} project(s)?`,
        description: 'This cannot be undone.',
        onConfirm: () => runBulk(op),
      });
      return;
    }
    if (action?.clientOnly && op === 'export') {
      // CSV export handled client-side — reuse existing ExportButton logic later
      showAlert('Use the Export button in the toolbar for CSV export', 'info');
      return;
    }
    if (op === 'status' || op === 'tag' || op === 'assign') {
      setBulkModal(op);
      return;
    }
    // archive / unarchive need no payload
    runBulk(op);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      "field-capture": "bg-rose-100 text-rose-800",
      uploading: "bg-indigo-100 text-indigo-800",
      "ai-processing": "bg-yellow-100 text-yellow-800",
      "qc-review": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      "customer-notified": "bg-teal-100 text-teal-800",
      "on-hold": "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    };
    return colors[priority] || "text-gray-600";
  };

  const AddProject = () => {
    router.push("/admin/project/createProject");
  };

  useEffect(() => {
    if (navigatingBackRef.current) {
      navigatingBackRef.current = false;
      setSelectedProject(null);
      return;
    }
    if (!selectedProjectId) {
      setSelectedProject(null);
      return;
    }

    const fetchProjectById = async () => {
      if (selectedProject && selectedProject._id === selectedProjectId) {
        return;
      }

      if (projects.length > 0) {
        const found = projects.find((p) => p._id === selectedProjectId);
        if (found) {
          setSelectedProject(found);
          return;
        }
      }

      try {
        const { data } = await api(`/api/projects/get-project/${selectedProjectId}`, 'GET');
        if (data?.data) {
          setSelectedProject(data.data);
        }
      } catch (error) {
        console.error('Error fetching deep-linked project:', error);
        showAlert('Failed to load project from URL', 'error');
      }
    };

    fetchProjectById();
  }, [selectedProjectId, projects, selectedProject]);

  const handleBackToProjects = () => {
    navigatingBackRef.current = true;
    setSelectedProject(null);
    router.replace('/admin/project');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Content */}
        {selectedProject ? (
          <>
            <div className="flex justify-center">
              <ProjectDetail
                project={selectedProject}
                setSelectedProject={setSelectedProject}
                onBack={handleBackToProjects}
                initialSeekTime={initialTime}
                allProjects={projects}
              />
            </div>
            <ProjectChatDrawer projectId={selectedProject._id} />
            <ProjectTimelineLauncher project={selectedProject} />
          </>
        ) : (
          <>
            {/* ── Page header ── */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white shrink-0">
                  Project Management
                </h1>

                <div className="flex items-center gap-2 flex-wrap">
                  <SavedViewsDropdown
                    entityType="project"
                    activeViewId={activeViewId}
                    onApply={applyView}
                    onClear={clearView}
                    snapshotFilters={snapshotFilters}
                    accentColor="rose"
                  />

                  {!isOperatorRoute && (
                    <Button
                      onClick={AddProject}
                      size="sm"
                      className="bg-gradient-to-r from-rose-500 to-rose-700 text-white hover:from-rose-600 hover:to-rose-800 flex items-center gap-1.5 h-9 text-xs font-medium"
                    >
                      <Plus size={14} />
                      New Project
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Toolbar: filters on the left, view + utilities on the right ── */}
            <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search projects, clients, locations..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9 pr-3 h-9 border border-gray-300 dark:border-[#27272a] rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-gray-100 w-64 text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="px-3 h-9 border border-gray-300 dark:border-[#27272a] rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white dark:bg-[#0c0c0e] text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="field-capture">Field Capture</option>
                  <option value="uploading">Uploading</option>
                  <option value="ai-processing">AI Processing</option>
                  <option value="qc-review">QC Review</option>
                  <option value="completed">Completed</option>
                  <option value="customer-notified">Customer Notified</option>
                  <option value="planning">Planning</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Compact icon-only segmented view-mode picker (label only on active) */}
                <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0e] shadow-sm overflow-hidden h-9">
                  {[
                    { key: "grid", Icon: LayoutGrid, label: "Grid" },
                    { key: "table", Icon: Rows, label: "Table" },
                    { key: "tracker", Icon: MapPin, label: "Tracker" },
                    ...(!isOperatorRoute ? [{ key: "compare", Icon: GitCompare, label: "Compare" }] : []),
                    ...(!isOperatorRoute ? [{ key: "pipeline", Icon: Columns3, label: "Pipeline" }] : []),
                  ].map(({ key, Icon, label }, i) => {
                    const active = viewMode === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setViewMode(key)}
                        title={label}
                        aria-label={label}
                        aria-pressed={active}
                        className={[
                          "inline-flex items-center h-full px-2.5 text-xs font-medium transition-colors gap-1.5",
                          i > 0 ? "border-l border-gray-200 dark:border-[#27272a]" : "",
                          active
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                            : "text-gray-500 hover:bg-gray-50 dark:text-[#a1a1aa] dark:hover:bg-[#18181b]",
                        ].join(" ")}
                      >
                        <Icon className="w-4 h-4" />
                        {active && <span className="hidden sm:inline">{label}</span>}
                      </button>
                    );
                  })}
                </div>

                <StatusLegend />

                <ExportButton
                  data={projects}
                  columns={[
                    { key: "name", label: "Name" },
                    { key: "status", label: "Status" },
                    { key: "location", label: "Location" },
                    { key: "progress", label: "Progress" },
                    { key: "workOrder", label: "Work Order" },
                    { key: "client", label: "Client" },
                  ]}
                  filename="projects"
                />
              </div>
            </div>

            {viewMode === "pipeline" ? (
              <>
                <PipelineAnalyticsStrip />
                <BulkActionsToolbar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
                <PipelineBoard
                  columns={pipelineData?.data?.columns || {}}
                  counts={pipelineData?.data?.counts || {}}
                  isLoading={pipelineLoading}
                  showSLA
                  accentColor="rose"
                  enableBulkSelect
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  quickActionsFactory={(project) => [
                    { label: 'View', icon: Eye, onClick: () => { router.push(`?selectedProject=${project._id}`, { scroll: false }); setSelectedProject(project); } },
                  ]}
                  onProjectClick={(project) => { router.push(`?selectedProject=${project._id}`, { scroll: false }); setSelectedProject(project); }}
                />
              </>
            ) : viewMode === "compare" ? (
              <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
                <ProjectCompare projects={projects} />
              </Suspense>
            ) : viewMode === "tracker" ? (
              <ProjectLiveTrackerView projects={projects} theme="rose" />
            ) : viewMode === "grid" ? (
              projects.length === 0 ? (
                <EmptyState
                  image="/background_pictures/no-projects.jpg"
                  title="No projects found"
                  description={searchTerm ? `No results for "${searchTerm}". Try a different search term.` : "No projects match the current filters."}
                  actionLabel="Clear Filters"
                  onAction={() => { setSearchTerm(""); setStatusFilter("all"); }}
                />
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    setSelectedProject={setSelectedProject}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    loadData={refetch}
                  />
                ))}
              </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="min-w-full overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Project
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Lead
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Videos
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          <button
                            type="button"
                            onClick={() =>
                              setHealthSort((s) =>
                                s === "off" ? "desc" : s === "desc" ? "asc" : "off"
                              )
                            }
                            className="flex items-center gap-1 hover:text-rose-700 transition-colors"
                          >
                            Health
                            <span className="text-[10px]">
                              {healthSort === "desc" ? "▼" : healthSort === "asc" ? "▲" : "↕"}
                            </span>
                          </button>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableProjects.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-center text-gray-500"
                            colSpan={9}
                          >
                            No projects found.
                          </td>
                        </tr>
                      ) : (
                        tableProjects.map((project) => {
                          const isPendingDelete = project.deleteStatus === "pending";
                          const mgr = project.managerId;
                          let leadName = "—";
                          if (mgr && typeof mgr === "object") {
                            const first = mgr.first_name || "";
                            const last = mgr.last_name || "";
                            leadName =
                              `${first} ${last}`.trim() ||
                              mgr.username ||
                              mgr.email ||
                              "—";
                          }

                          const handleSelect = () => {
                            router.push(`?selectedProject=${project._id}`, {
                              scroll: false,
                            });
                            setSelectedProject(project);
                          };

                          return (
                            <tr
                              key={project._id}
                              className={`border-t border-gray-100 cursor-pointer ${
                                isPendingDelete
                                  ? "bg-gray-50 hover:bg-gray-100"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={handleSelect}
                            >
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">
                                  {project.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Work Order: {project.workOrder}
                                </div>
                                {isPendingDelete && (
                                  <div className="mt-1 text-[11px] text-amber-700 font-medium">
                                    Pending deletion — review and approve or reject in the project card.
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {project.client}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {project.location}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                                    project.status
                                  )}`}
                                >
                                  {project.status
                                    ?.replace("-", " ")
                                    .toUpperCase()}
                                </span>
                                {isPendingDelete && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                    PENDING DELETION
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs font-semibold ${getPriorityColor(
                                    project.priority
                                  )}`}
                                >
                                  {project.priority?.toUpperCase?.() ||
                                    project.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {leadName}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {project.videoCount ??
                                  (project.videoUrl ? 1 : 0)}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                <ProjectHealthBadge projectId={project._id} compact />
                              </td>
                              <td
                                className="px-4 py-3 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                    >
                                      <MoreVertical className="w-4 h-4 text-gray-600" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuLabel className="text-xs text-gray-500">
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={handleSelect}
                                      className="cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Open Project
                                    </DropdownMenuItem>
                                    {!isOperatorRoute && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/admin/project/editProject/${project._id}`
                                          )
                                        }
                                        className="cursor-pointer"
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Project
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6 gap-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-gray-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Bulk Actions v2 — active for non-pipeline list views */}
      {viewMode !== 'pipeline' && (
        <BulkActionBar
          entity="project"
          selectedCount={selectedIds.length}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds([])}
          isPending={bulkMutation.isPending}
          accent="rose"
        />
      )}
      {bulkResult && (
        <BulkResultToast
          result={bulkResult}
          onDismiss={() => setBulkResult(null)}
        />
      )}

      <BulkAssignModal
        open={bulkModal === 'assign'}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedIds.length}
        isPending={bulkMutation.isPending}
        onConfirm={(payload) => runBulk('assign', payload)}
      />
      <BulkStatusModal
        open={bulkModal === 'status'}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedIds.length}
        isPending={bulkMutation.isPending}
        onConfirm={(payload) => runBulk('status', payload)}
      />
      <BulkTagModal
        open={bulkModal === 'tag'}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedIds.length}
        isPending={bulkMutation.isPending}
        onConfirm={(payload) => runBulk('tag', payload)}
      />
    </div>
  );
};

// Loading fallback for Suspense
const ProjectPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <span className="mt-2 block text-gray-600">Loading projects...</span>
    </div>
  </div>
);

// Main export wrapped in Suspense
const SewerVisionInspectionModule = () => {
  return (
    <Suspense fallback={<ProjectPageLoading />}>
      <SewerVisionInspectionModuleContent />
    </Suspense>
  );
};

export default SewerVisionInspectionModule;
