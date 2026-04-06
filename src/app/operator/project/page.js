"use client";
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { Search, Plus, Loader2, LayoutGrid, Rows, MapPin, Video } from "lucide-react";
import dynamic from "next/dynamic";
const ProjectLiveTrackerView = dynamic(() => import("@/components/shared/ProjectLiveTrackerView"), { ssr: false });
import StatusLegend from "@/components/shared/StatusLegend";
import ExportButton from '@/components/shared/ExportButton';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useOperatorProjects, useOperatorProject } from "@/hooks/useQueryHooks";
import ProjectDetail from "@/components/operator/project/ProjectDetail";
import ProjectCard from "@/components/operator/project/ProjectCard";

const OperatorModulePage = () => {
  const { userId } = useUser();

  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const navigatingBackRef = useRef(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const selectedProjectId = searchParams.get("selectedProject");

  const isOperatorRoute = pathname?.startsWith("/operator");

  const [page, setPage] = useState(1);
  const [limit] = useState(6);


  // ── Data fetching via TanStack Query ──
  const { data: projectsData } = useOperatorProjects(
    isOperatorRoute ? userId : null,
    { page, limit, search: debouncedSearch, status: statusFilter },
  );
  const { data: deepLinkedProject } = useOperatorProject(
    selectedProjectId && !selectedProject ? selectedProjectId : null,
  );

  const projects = projectsData?.data ?? [];
  const totalPages = projectsData?.totalPages ?? 1;

  // Debounced search handler
  const debouncedSearchFn = React.useMemo(
    () => debounce((value) => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearchFn(value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    setPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      "field-capture": "bg-blue-100 text-blue-800",
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
      const isPending = item.project?.deleteStatus === "pending";
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-xs font-semibold ${getStatusColor(item.status)}`}>
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
        <span className={`text-xs font-semibold ${getPriorityColor(item.priority)}`}>
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

    // Try to find in loaded projects first
    if (projects.length > 0) {
      const found = projects.find((p) => p._id === selectedProjectId);
      if (found) {
        setSelectedProject(found);
        return;
      }
    }

    // Use deep-linked query result
    if (deepLinkedProject) {
      setSelectedProject(deepLinkedProject);
    }
  }, [selectedProjectId, projects, deepLinkedProject]);

  const handleBackToProjects = () => {
    navigatingBackRef.current = true;
    setSelectedProject(null);
    router.push('/operator/project');
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
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Inspection Projects
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage and monitor all your inspection projects
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View mode toggle */}
                  <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <Button
                      type="button"
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none gap-1"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Grid</span>
                    </Button>
                    <Button
                      type="button"
                      variant={viewMode === "table" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="rounded-none border-l border-gray-200 gap-1"
                    >
                      <Rows className="w-4 h-4" />
                      <span>Table</span>
                    </Button>
                    
                  </div>

                  <StatusLegend />

                  <ExportButton
                    data={projects}
                    columns={["name", "status", "location", "progress", "workOrder"]}
                    filename="operator-projects"
                  />

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
                  <SelectItem value="field-capture">Field Capture</SelectItem>
                  <SelectItem value="uploading">Uploading</SelectItem>
                  <SelectItem value="ai-processing">AI Processing</SelectItem>
                  <SelectItem value="qc-review">QC Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="customer-notified">Customer Notified</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {viewMode === "tracker" ? (
              <ProjectLiveTrackerView projects={projects} isLoading={false} theme="blue" />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    setSelectedProject={setSelectedProject}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    loadData={projects}
                    hideActions
                  />
                ))}
              </div>
            ) : (
              <SewerTable
                data={projectTableData}
                columns={projectColumns}
                loading={false}
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
      </div>
    </div>
  );
};

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
      <OperatorModulePage />
    </Suspense>
  );
};

export default SewerVisionInspectionModule;
