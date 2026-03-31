"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { Search, Plus, Loader2, FolderOpen, LayoutGrid, Rows, MapPin, Video } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ProjectDetail from "../../../components/user/project/ProjectDetail";
import ProjectCard from "../../../components/user/project/ProjectCard";
import { useUser } from "@/components/providers/UserContext";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProjects, useUserProject } from "@/hooks/useQueryHooks";
import { getProjectStatusColor, getProjectPriorityColor } from "@/components/user/constants";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";

const ProjectLiveTrackerView = dynamic(() => import("@/components/shared/ProjectLiveTrackerView"), { ssr: false });

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
    { key: "progress", name: "Progress" },
    { key: "team", name: "Team" },
    { key: "priority", name: "Priority" },
    { key: "videos", name: "Videos" },
  ];

  const projectTableData = useMemo(() => {
    return projects.map((p) => {
      const opUser = p.assignedOperator?.userId;
      const qcUser = p.qcTechnician?.userId;
      const operatorName = opUser && typeof opUser === 'object' ? `${opUser.first_name || ''} ${opUser.last_name || ''}`.trim() : null;
      const qcName = qcUser && typeof qcUser === 'object' ? `${qcUser.first_name || ''} ${qcUser.last_name || ''}`.trim() : null;
      return {
        _id: p._id,
        project: { name: p.name, workOrder: p.workOrder, deleteStatus: p.deleteStatus },
        client: p.client || "—",
        location: p.location || "—",
        status: p.status,
        progress: p.progress || 0,
        team: { operatorName, qcName, operatorId: opUser?._id, qcId: qcUser?._id },
        priority: p.priority,
        videos: p.videoCount ?? (p.videoUrl ? 1 : 0),
        _raw: p,
      };
    });
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
    if (col.key === "progress") {
      const pct = item.progress || 0;
      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-bold text-gray-600 w-8 text-right">{pct}%</span>
        </div>
      );
    }
    if (col.key === "team") {
      const { operatorName, qcName } = item.team || {};
      return (
        <div className="flex flex-col gap-0.5">
          {operatorName && (
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{operatorName}
            </span>
          )}
          {qcName && (
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />{qcName}
            </span>
          )}
          {!operatorName && !qcName && <span className="text-[10px] text-gray-400">—</span>}
        </div>
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
                    <button
                      type="button"
                      onClick={() => setViewMode("tracker")}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium border-l border-gray-200 ${
                        viewMode === "tracker"
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Live Tracker</span>
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
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-3 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search projects, clients, locations..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-9 w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => handleStatusChange({ target: { value: val } })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="field-capture">Field Capture</SelectItem>
                  <SelectItem value="uploading">Uploading</SelectItem>
                  <SelectItem value="ai-processing">AI Processing</SelectItem>
                  <SelectItem value="qc-review">QC Review</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="customer-notified">Customer Notified</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <>
                {viewMode === "tracker" ? (
                  <ProjectLiveTrackerView projects={projects} isLoading={loading} theme="indigo" />
                ) : viewMode === "grid" ? (
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
                    showActions={true}
                    showSearch={false}
                    showCsvActions={false}
                    onView={handleProjectRowView}
                    onEdit={(row) => router.push(`/user/project/editProject/${row._id}`)}
                    emptyMessage="No projects found"
                    emptySubtext="Try adjusting your filters or create a new project"
                    columnDefaults={{
                      project: 200,
                      client: 120,
                      location: 130,
                      status: 130,
                      progress: 120,
                      team: 130,
                      priority: 80,
                      videos: 70,
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
