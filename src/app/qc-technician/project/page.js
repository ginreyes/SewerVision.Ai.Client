"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import qcApi from "@/data/qcApi";
import ProjectCard from "@/app/admin/project/components/ProjectCard";
import ProjectDetail from "@/app/admin/project/components/ProjectDetail";

const QCProjectsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const { userId } = useUser();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const status = statusFilter === "all" ? "all" : statusFilter;
      const data = await qcApi.getAssignments(userId, status);
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Convert assignments to projects format and filter
  const projects = useMemo(() => {
    return assignments.map((assignment) => {
      const projectData = assignment.projectId || assignment;
      // Calculate progress based on detections
      const progress = assignment.totalDetections > 0 
        ? Math.round((assignment.reviewedDetections / assignment.totalDetections) * 100)
        : 0;
      
      return {
        ...projectData,
        _id: projectData._id || assignment._id,
        status: assignment.status || projectData.status,
        priority: assignment.priority || projectData.priority || 'medium',
        progress: progress,
        aiDetections: {
          total: assignment.totalDetections || 0,
        },
        videoCount: projectData.videoUrl ? 1 : 0,
        // Store assignment data for reference
        _assignmentData: assignment,
      };
    });
  }, [assignments]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const getStatusColor = (status) => {
    const colors = {
      assigned: "bg-rose-100 text-rose-800",
      "in-progress": "bg-pink-100 text-pink-800",
      completed: "bg-green-100 text-green-800",
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

  const handleLoadData = () => {
    fetchProjects();
  };

  const handleProjectClick = async (project) => {
    try {
      // Fetch full project data with observations and snapshots
      const { ok, data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
      if (ok && data?.data) {
        setSelectedProject(data.data);
      } else {
        // Fallback to project data if API fails
        setSelectedProject(project);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      showAlert('Failed to load project details', 'error');
      // Fallback to project data
      setSelectedProject(project);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      </div>
    );
  }

  // Show project detail if a project is selected
  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        setSelectedProject={setSelectedProject}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">QC Projects</h1>
        <p className="text-gray-600">View and manage your assigned QC projects</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">Loading projects...</div>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No projects found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              setSelectedProject={handleProjectClick}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              loadData={handleLoadData}
              hideActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QCProjectsPage;

