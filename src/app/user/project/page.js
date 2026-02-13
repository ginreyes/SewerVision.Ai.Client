"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, Plus, Loader2, FolderOpen, LayoutGrid, Rows, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ProjectDetail from "./components/ProjectDetail";
import ProjectCard from "./components/ProjectCard";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { useUser } from "@/components/providers/UserContext";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams } from "next/navigation";

const UserProjectModuleContent = () => {
  const { userId } = useUser();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("selectedProject");

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const router = useRouter();

  const handleLoadData = async (search = "", status = "all", pageNumber = 1) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: pageNumber.toString(),
        limit: limit.toString(),
        managerId: userId,
        search: search || "",
        status: status === "all" ? "" : status,
      });

      const response = await api(
        `/api/projects/get-all-projects?${query}`,
        "GET"
      );
      const { data, totalPages: total } = response.data ?? {};
      setProjects(Array.isArray(data) ? data : []);
      setTotalPages(total ?? 1);
    } catch (err) {
      console.error("Error fetching projects:", err);
      showAlert(err?.message || "Failed to load projects", "error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((value, status, pageNum) => {
    handleLoadData(value, status, pageNum);
  }, 400);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value, statusFilter, 1);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    debouncedSearch(searchTerm, value, 1);
    setPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "bg-slate-100 text-slate-800",
      "field-capture": "bg-blue-100 text-blue-800",
      uploading: "bg-indigo-100 text-indigo-800",
      "ai-processing": "bg-yellow-100 text-yellow-800",
      "qc-review": "bg-purple-100 text-purple-800",
      "in-progress": "bg-emerald-100 text-emerald-800",
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

  const handleNewProject = () => {
    router.push("/user/project/create");
  };

  useEffect(() => {
    if (userId) handleLoadData(searchTerm, statusFilter, page);
  }, [userId, page]);

  useEffect(() => {
    const fetchProjectById = async () => {
      if (!selectedProjectId) return;
      if (selectedProject && selectedProject._id === selectedProjectId) return;

      const found = projects.find((p) => p._id === selectedProjectId);
      if (found) {
        setSelectedProject(found);
        return;
      }

      try {
        const { data } = await api(
          `/api/projects/get-project/${selectedProjectId}`,
          "GET"
        );
        if (data?.data) setSelectedProject(data.data);
      } catch (error) {
        console.error("Error fetching project:", error);
        showAlert("Failed to load project from URL", "error");
      }
    };

    fetchProjectById();
  }, [selectedProjectId, projects, selectedProject]);

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
                        getStatusColor={getStatusColor}
                        getPriorityColor={getPriorityColor}
                        loadData={() =>
                          handleLoadData(searchTerm, statusFilter, page)
                        }
                      />
                    ))}
                  </div>
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
                              Videos
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.length === 0 ? (
                            <tr>
                              <td
                                className="px-4 py-6 text-center text-gray-500"
                                colSpan={7}
                              >
                                No projects found.
                              </td>
                            </tr>
                          ) : (
                            projects.map((project) => {
                              const isPendingDelete = project.deleteStatus === "pending";
                              const handleSelect = () => {
                                router.push(
                                  `?selectedProject=${project._id}`,
                                  { scroll: false }
                                );
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
                                    <div
                                      className={`font-semibold ${
                                        isPendingDelete ? "text-gray-700" : "text-gray-900"
                                      }`}
                                    >
                                      {project.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Work Order: {project.workOrder}
                                    </div>
                                    {isPendingDelete && (
                                      <div className="mt-1 text-[11px] text-amber-700 font-medium">
                                        Pending deletion — waiting for admin approval
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
                                    {project.videoCount ??
                                      (project.videoUrl ? 1 : 0)}
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
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-44"
                                      >
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
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(
                                            `/user/project/editProject/${project._id}`
                                          )
                                        }
                                        className="cursor-pointer"
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Project
                                      </DropdownMenuItem>
                                      {project.deleteStatus !== "pending" ? (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            showDelete({
                                              title: "Request project deletion",
                                              description:
                                                "This will send a delete request to the admin. The project will only be permanently removed after admin approval, and assigned members plus the customer will be notified.",
                                              onConfirm: async () => {
                                                try {
                                                  const response = await api(
                                                    `/api/projects/request-delete/${project._id}`,
                                                    "POST",
                                                    {}
                                                  );
                                                  if (!response.ok) {
                                                    showAlert(
                                                      "Delete request failed",
                                                      "error"
                                                    );
                                                  } else {
                                                    showAlert(
                                                      "Delete request submitted for admin approval",
                                                      "success"
                                                    );
                                                    handleLoadData(
                                                      searchTerm,
                                                      statusFilter,
                                                      page
                                                    );
                                                  }
                                                } catch (error) {
                                                  showAlert(
                                                    "Failed to request project deletion",
                                                    "error"
                                                  );
                                                }
                                              },
                                              onCancel: () =>
                                                showAlert("Cancelled", "info"),
                                            });
                                          }}
                                          className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Request deletion
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          disabled
                                          className="cursor-default text-gray-400 focus:text-gray-400"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Pending deletion
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
                    onClick={() => setPage((p) => p - 1)}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
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
