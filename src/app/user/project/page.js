"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { Search, Plus, Loader2, FolderOpen, LayoutGrid, Rows, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectDetail from "./components/ProjectDetail";
import ProjectCard from "./components/ProjectCard";
import { useUser } from "@/components/providers/UserContext";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProjects, useUserProject } from "@/hooks/useQueryHooks";
import { getProjectStatusColor, getProjectPriorityColor } from "@/components/user/constants";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";

const UserProjectModuleContent = () => {
  const { userId } = useUser();
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("selectedProject");

  const [page, setPage] = useState(1);
  const limit = 6;

  const router = useRouter();

  // ── Data fetching via TanStack Query ──
  const {
    data: projectsData,
    isLoading: loading,
    refetch,
  } = useUserProjects(userId, { page, limit, search: searchTerm, status: statusFilter });

  const projects = projectsData?.data ?? [];
  const totalPages = projectsData?.totalPages ?? 1;

  // Hook for fetching a single project by ID (URL param)
  const { data: projectById } = useUserProject(
    selectedProjectId && !selectedProject ? selectedProjectId : null
  );


  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
    }, 400),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleNewProject = () => {
    router.push("/user/project/create");
  };

  // Sync URL-selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    if (selectedProject && selectedProject._id === selectedProjectId) return;

    const found = projects.find((p) => p._id === selectedProjectId);
    if (found) {
      setSelectedProject(found);
      return;
    }
    if (projectById) {
      setSelectedProject(projectById);
    }
  }, [selectedProjectId, projects, projectById, selectedProject]);

  /* ─── SewerTable config for table view ─── */
  const projectColumns = [
    { key: "project", name: "Project" },
    { key: "client", name: "Client" },
    { key: "location", name: "Location" },
    { key: "status", name: "Status" },
    { key: "priority", name: "Priority" },
    { key: "videos", name: "Videos" },
  ];

  const projectTableData = useMemo(() => {
    return projects.map((p) => ({
      _id: p._id,
      project: { name: p.name, workOrder: p.workOrder, deleteStatus: p.deleteStatus },
      client: p.client || "—",
      location: p.location || "—",
      status: p.status,
      priority: p.priority,
      videos: p.videoCount ?? (p.videoUrl ? 1 : 0),
      _raw: p,
    }));
  }, [projects]);

  const renderProjectCell = (item, col) => {
    if (col.key === "project") {
      const p = item.project;
      const isPending = p.deleteStatus === "pending";
      return (
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${isPending ? "text-gray-600" : "text-gray-900"}`}>{p.name}</p>
          <p className="text-[11px] text-gray-500">Work Order: {p.workOrder}</p>
          {isPending && (
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              Pending deletion — awaiting admin approval
            </p>
          )}
        </div>
      );
    }
    if (col.key === "location") {
      return (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {item.location}
        </span>
      );
    }
    if (col.key === "status") {
      const isPending = item._raw?.deleteStatus === "pending";
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-xs font-semibold ${getProjectStatusColor(item.status)}`}>
            {item.status?.replace("-", " ").toUpperCase()}
          </Badge>
          {isPending && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
              PENDING DELETION
            </Badge>
          )}
        </div>
      );
    }
    if (col.key === "priority") {
      return (
        <span className={`text-xs font-semibold ${getProjectPriorityColor(item.priority)}`}>
          {item.priority?.toUpperCase?.() || item.priority}
        </span>
      );
    }
    if (col.key === "videos") {
      return (
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <Video className="w-3.5 h-3.5" />
          {item.videos}
        </span>
      );
    }
    if (col.key === "client") {
      return <span className="text-sm text-gray-700">{item.client}</span>;
    }
    return null;
  };

  const handleProjectRowView = (row) => {
    const projectId = row._id;
    router.push(`?selectedProject=${projectId}`, { scroll: false });
    const found = projects.find((p) => p._id === projectId);
    if (found) setSelectedProject(found);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {selectedProject ? (
          <div className="flex justify-center">
            <ProjectDetail
              project={selectedProject}
              setSelectedProject={setSelectedProject}
            />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      My Projects
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Projects you manage as team lead — view progress and request deletion
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* View mode toggle */}
                  <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
                        viewMode === "grid"
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border-l border-gray-200 ${
                        viewMode === "table"
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Rows className="w-4 h-4" />
                      <span>Table</span>
                    </button>
                  </div>

                  <Button
                    onClick={handleNewProject}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    New Project
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects, clients, locations..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="field-capture">Field Capture</option>
                <option value="uploading">Uploading</option>
                <option value="ai-processing">AI Processing</option>
                <option value="qc-review">QC Review</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="customer-notified">Customer Notified</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        setSelectedProject={setSelectedProject}
                        loadData={() => refetch()}
                      />
                    ))}
                  </div>
                ) : (
                  <SewerTable
                    data={projectTableData}
                    columns={projectColumns}
                    loading={loading}
                    renderCell={renderProjectCell}
                    showCheckbox={false}
                    showActions={false}
                    showCsvActions={false}
                    onView={handleProjectRowView}
                    emptyMessage="No projects found"
                    emptySubtext="Try adjusting your filters or create a new project"
                    columnDefaults={{
                      project: 220,
                      client: 140,
                      location: 160,
                      status: 160,
                      priority: 100,
                      videos: 80,
                    }}
                    rowsPerPageOptions={[6, 12, 24]}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ProjectPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
      <span className="mt-2 block text-gray-600">Loading projects...</span>
    </div>
  </div>
);

export default function UserProjectPage() {
  return (
    <Suspense fallback={<ProjectPageLoading />}>
      <UserProjectModuleContent />
    </Suspense>
  );
}
