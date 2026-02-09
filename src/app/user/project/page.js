"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, Plus, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectDetail from "./components/ProjectDetail";
import ProjectCard from "./components/ProjectCard";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
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

  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("selectedProject");

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const { showAlert } = useAlert();
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
                <Button
                  onClick={handleNewProject}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  New Project
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      setSelectedProject={setSelectedProject}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                      loadData={() => handleLoadData(searchTerm, statusFilter, page)}
                      hideActions
                    />
                  ))}
                </div>

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
