"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectDetail from "./components/ProjectDetail";
import ProjectCard from "./components/ProjectCard";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import debounce from "lodash/debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OperatorModulePage = () => {
  const { userId } = useUser();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigatingBackRef = useRef(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const selectedProjectId = searchParams.get("selectedProject");

  const isOperatorRoute = pathname?.startsWith("/operator");

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const { showAlert } = useAlert();

  const handleLoadData = async (
    search = "",
    status = "all",
    pageNumber = 1
  ) => {
    // For operator routes, only load once we know who the operator is
    if (isOperatorRoute && !userId) {
      return;
    }

    try {
      const query = new URLSearchParams({
        page: pageNumber.toString(),
        limit: limit.toString(),
        search,
        status: status === "all" ? "" : status,
      });

      // Restrict to the logged-in operator's own projects
      if (isOperatorRoute && userId) {
        query.append("assignedOperatorId", userId);
      }

      const response = await api(
        `/api/projects/get-all-projects?${query.toString()}`,
        "GET"
      );
      const { data, totalPages } = response.data;

      console.log("Fetched Projects:", data);

      setProjects(data);
      setTotalPages(totalPages);
    } catch (error) {
      console.error(`Error Fetching: ${error.message}`);
      showAlert(`Error Fetching Data: ${error.message}`, "error");
    }
  };

  const debouncedSearch = debounce((value, status, page) => {
    handleLoadData(value, status, page);
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

  const AddProject = () => {
    router.push("/operator/project/createProject");
  };

  useEffect(() => {
    handleLoadData(searchTerm, statusFilter, page);
  }, [page, userId, isOperatorRoute]);


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
    router.replace('/operator/project');
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
                {!isOperatorRoute && (
                  <Button
                    onClick={AddProject}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    New Project
                  </Button>
                )}
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="field-capture">Field Capture</option>
                <option value="uploading">Uploading</option>
                <option value="ai-processing">AI Processing</option>
                <option value="qc-review">QC Review</option>
                <option value="completed">Completed</option>
                <option value="customer-notified">Customer Notified</option>
                <option value="customer-notified">Planning</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  setSelectedProject={setSelectedProject}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  loadData={handleLoadData}
                  hideActions
                />
              ))}
            </div>

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
      <OperatorModulePage />
    </Suspense>
  );
};

export default SewerVisionInspectionModule;
