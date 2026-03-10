'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, AlertCircle, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/components/providers/UserContext';
import { useCustomerProjects } from '@/hooks/useQueryHooks';

import StatsCards from '@/components/customer/dashboard/StatsCards';
import ProjectListCard from '@/components/customer/dashboard/ProjectListCard';

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { userId } = useUser();

  const {
    data: projects = [],
    isLoading: loading,
    error,
  } = useCustomerProjects(userId);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: projects.length,
    completed: projects.filter((p) =>
      ['completed', 'customer-notified'].includes(p.status)
    ).length,
    inReview: projects.filter((p) => p.status === 'qc-review').length,
  };

  const handleNavigate = (projectId) => {
    router.push(`/customer/projects/${projectId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">View and manage your inspection projects</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading projects...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">View and manage your inspection projects</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">
              {error?.message || 'Failed to load projects'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">View and manage your inspection projects</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row" data-tour="customer-search-filter">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="field-capture">Field Capture</SelectItem>
            <SelectItem value="uploading">Uploading</SelectItem>
            <SelectItem value="ai-processing">Processing</SelectItem>
            <SelectItem value="qc-review">QC Review</SelectItem>
            <SelectItem value="completed">Ready for Review</SelectItem>
            <SelectItem value="customer-notified">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects List */}
      <div className="space-y-4" data-tour="customer-projects-list">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'No projects match your filters'
                  : 'No projects found'}
              </p>
              {(searchQuery || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <ProjectListCard
              key={project._id}
              project={project}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
}
