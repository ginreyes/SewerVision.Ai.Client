'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  AlertCircle,
  Loader2,
  FolderOpen,
  CheckCircle2,
  Activity,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/UserContext';
import { useCustomerProjects } from '@/hooks/useQueryHooks';
import { statusConfig } from '@/components/customer/constants';

import ProjectCard from '@/components/customer/projects/ProjectCard';
import ProjectSearchFilter from '@/components/customer/projects/ProjectSearchFilter';
import { GridSkeleton } from '@/components/shared/SkeletonLoading';
import { SavedViewsDropdown, useSavedViewSync } from '@/components/shared/SavedViews';

export default function ProjectPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const router = useRouter();
  const { userId } = useUser();

  // Saved Views: two-way bind search/status/viewMode/sortBy <-> selected SavedView + URL
  const {
    activeViewId,
    applyView,
    clearView,
    snapshot: snapshotFilters,
  } = useSavedViewSync({
    applyFilters: (v) => {
      if (typeof v.searchQuery === 'string') setSearchQuery(v.searchQuery);
      if (typeof v.statusFilter === 'string') setStatusFilter(v.statusFilter);
      if (typeof v.sortBy === 'string') setSortBy(v.sortBy);
      if (typeof v.viewMode === 'string') setViewMode(v.viewMode);
    },
    captureFilters: () => ({ searchQuery, statusFilter, sortBy, viewMode }),
  });

  const {
    data: projects = [],
    isLoading: loading,
    error,
  } = useCustomerProjects(userId);

  // Summary stats
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(
      (p) => !['completed', 'customer-notified', 'on-hold'].includes(p.status)
    ).length;
    const completed = projects.filter(
      (p) => p.status === 'completed' || p.status === 'customer-notified'
    ).length;
    const totalDefects = projects.reduce(
      (sum, p) => sum + (p.aiDetections?.total || 0),
      0
    );
    return { total, active, completed, totalDefects };
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.client?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const handleViewProject = (projectId) => {
    router.push(`/customer/projects/${projectId}`);
  };

  // Loading state
  if (isLoading) return (<GridSkeleton count={6} />)
  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view your inspection projects
            </p>
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error?.message || 'Failed to load projects'}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view your inspection projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SavedViewsDropdown
              entityType="project"
              activeViewId={activeViewId}
              onApply={applyView}
              onClear={clearView}
              snapshotFilters={snapshotFilters}
              accentColor="blue"
            />
          </div>
        </div>

        {/* Summary Stats */}
        {projects.length > 0 && (
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-50 p-2">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-50 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalDefects}</p>
                    <p className="text-xs text-muted-foreground">Total Defects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <ProjectSearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredProjects.length}
          totalCount={projects.length}
        />

        {/* Projects Grid */}
        {viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="customer-projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onView={handleViewProject}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2" data-tour="customer-projects-grid">
            {filteredProjects.map((project) => {
              const config = statusConfig[project.status] || { label: 'In Progress', bgColor: 'bg-gray-100 text-gray-800' };
              const progress = project.progress || 0;
              const totalDefects = project.aiDetections?.total || 0;
              return (
                <Card
                  key={project._id}
                  className="hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleViewProject(project._id)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <Badge variant="outline" className={`${config.bgColor} flex-shrink-0 text-[10px]`}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.totalLength || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                        <div className="w-24">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>

                        <div className="text-center w-16">
                          <p className={`text-sm font-semibold ${totalDefects >= 10 ? 'text-red-600' : totalDefects >= 5 ? 'text-orange-500' : 'text-emerald-600'}`}>
                            {totalDefects}
                          </p>
                          <p className="text-[10px] text-muted-foreground">defects</p>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No projects have been assigned to you yet'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
