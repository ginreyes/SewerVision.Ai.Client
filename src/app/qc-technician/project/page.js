'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Play,
  CheckCircle,
  Clock,
  MapPin,
  Folder,
  Monitor,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Zap,
  Radio,
  Search,
  Calendar,
  User,
} from 'lucide-react';
import { api } from '@/lib/helper';
import qcApi from "@/data/qcApi";
import { useUser } from "@/components/providers/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'in-progress': { color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500 animate-pulse', label: 'In Progress' },
    'assigned': { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Assigned' },
    'completed': { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Completed' },
    'on-hold': { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'On Hold' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

// Project Card Component
const ProjectCard = ({ project, isSelected, onClick, onStartReview }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${isSelected
        ? 'border-rose-500 shadow-md ring-2 ring-rose-100'
        : 'border-transparent hover:border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${project.status === 'in-progress' ? 'bg-rose-100' : 'bg-gray-100'}`}>
            <Folder className={`w-5 h-5 ${project.status === 'in-progress' ? 'text-rose-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{project.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {project.location || 'No Location'}
            </p>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xs font-medium text-gray-900">{project.totalDetections || 0}</p>
          <p className="text-[10px] text-gray-500">Detections</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <CheckCircle className={`w-3.5 h-3.5 ${project.progress === 100 ? 'text-green-500' : 'text-blue-500'}`} />
          </div>
          <p className="text-xs font-medium text-gray-900">{project.progress || 0}%</p>
          <p className="text-[10px] text-gray-500">Reviewed</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-xs font-medium text-gray-900 capitalize">{project.priority || 'Med'}</p>
          <p className="text-[10px] text-gray-500">Priority</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={`w-full gap-1.5 ${project.status === 'completed'
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-rose-600 hover:bg-rose-700'}`}
          onClick={(e) => { e.stopPropagation(); onStartReview(project); }}
        >
          {project.status === 'completed' ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              View Report
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              {project.status === 'in-progress' ? 'Continue Review' : 'Start Review'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Review Queue Item Component
const ReviewQueueItem = ({ project }) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
      <div className={`p-2 rounded-lg ${project.status === 'completed' ? 'bg-green-100' : 'bg-rose-100'}`}>
        {project.status === 'completed' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Clock className="w-4 h-4 text-rose-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
          <span className="text-xs font-medium text-gray-500">
            {project.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${project.status === 'completed' ? 'bg-green-500' : 'bg-rose-500'}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Main Component
const QCProjectsPage = () => {
  const router = useRouter();
  const { userId } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProjects = useCallback(async () => {
    try {
      if (!userId) return;

      const status = statusFilter === "all" ? "all" : statusFilter;
      // Using qcApi as in the original file
      const data = await qcApi.getAssignments(userId, status);

      // Transform data to match the UI needs
      const formattedProjects = (data || []).map((assignment) => {
        const projectData = assignment.projectId || assignment;
        const totalDetections = assignment.totalDetections || 0;
        const reviewedDetections = assignment.reviewedDetections || 0;
        const progress = totalDetections > 0
          ? Math.round((reviewedDetections / totalDetections) * 100)
          : 0;

        return {
          id: projectData._id || assignment._id,
          name: projectData.name || 'Untitled Project',
          location: projectData.location || 'Unknown Location',
          client: projectData.client || 'Unknown Client',
          status: assignment.status || projectData.status || 'assigned',
          priority: assignment.priority || projectData.priority || 'medium',
          totalDetections,
          reviewedDetections,
          progress,
          date: new Date(projectData.createdAt || Date.now()).toLocaleDateString(),
          _raw: assignment
        };
      });

      setProjects(formattedProjects);

      // Select first project if none selected
      if (formattedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(formattedProjects[0].id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, statusFilter, selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const handleStartReview = (project) => {
    router.push(`/qc-technician/project/${project.id}`);
  };

  const handleFlagIssue = (projectId) => {
    console.log("Flagging issue for:", projectId);
  };

  // Filtering
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Stats
  const activeCount = projects.filter(p => p.status === 'in-progress').length;
  const pendingCount = projects.filter(p => p.status === 'assigned').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500 mx-auto mb-3" />
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage assignments and review inspection data</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Stats - hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-medium">{activeCount} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">{pendingCount} Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">{completedCount} Done</span>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Project Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm bg-transparent !p-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-rose-600" />
                Assignments
              </h3>
              <Badge variant="secondary">{filteredProjects.length} projects</Badge>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    onStartReview={handleStartReview}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No Projects Found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </Card>

          {/* Selected Project Detail - Large View */}
          {selectedProject && (
            <Card className="border-0 shadow-sm overflow-hidden mt-6">
              <div className={`p-4 ${selectedProject.status === 'completed'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                : 'bg-gradient-to-r from-rose-600 to-pink-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{selectedProject.name}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedProject.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold">{selectedProject.progress}%</div>
                    <p className="text-xs opacity-80">Completion</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Radio className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedProject.totalDetections}</p>
                    <p className="text-xs text-gray-500">Detections</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedProject.reviewedDetections}</p>
                    <p className="text-xs text-gray-500">Reviewed</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 line-clamp-1 text-xs pt-1">{selectedProject.date}</p>
                    <p className="text-xs text-gray-500">Assigned</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 text-xs pt-1 line-clamp-1">{selectedProject.client}</p>
                    <p className="text-xs text-gray-500">Client</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    className={`flex-1 gap-2 ${selectedProject.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                    onClick={() => handleStartReview(selectedProject)}
                  >
                    {selectedProject.status === 'completed' ? <FileText className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {selectedProject.status === 'completed' ? 'View Final Report' : 'Open Project Console'}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleFlagIssue(selectedProject.id)}>
                    <AlertTriangle className="w-4 h-4" />
                    Flag Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Pending Queue & Status */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  Review Queue
                </CardTitle>
                <Badge variant="secondary">{activeCount} active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.filter(p => p.status === 'in-progress' || p.status === 'assigned').slice(0, 5).map(project => (
                <ReviewQueueItem key={project.id} project={project} />
              ))}
              {projects.filter(p => p.status === 'in-progress' || p.status === 'assigned').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending reviews</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Status Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-rose-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">AI Models Active</p>
                  <p className="text-xs text-gray-500">Crack & fracture detection ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Monitor className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cloud Connection</p>
                  <p className="text-xs text-gray-500">Syncing with SewerVision Cloud</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">PACP v7.0</p>
                  <p className="text-xs text-gray-500">Standards enforced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QCProjectsPage;
