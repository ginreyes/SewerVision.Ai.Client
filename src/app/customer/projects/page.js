'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  AlertCircle,
  Eye,
  FileText,
  Clock,
  Loader2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/UserContext';
import { api } from '@/lib/helper';
import { useAlert } from '@/components/providers/AlertProvider';

// Status configuration
const statusConfig = {
  completed: { label: 'Ready for Review', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'customer-notified': { label: 'Completed', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'qc-review': { label: 'QC Review', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'ai-processing': { label: 'Processing', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'field-capture': { label: 'Field Capture', bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  uploading: { label: 'Uploading', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'on-hold': { label: 'On Hold', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  planning: { label: 'Planning', bgColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' },
};

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();
  const { userId } = useUser();
  const { showAlert } = useAlert();

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, ok, error: apiError } = await api(
          `/api/customer/get-all-projects/${userId}?page=1&limit=100`,
          'GET'
        );

        if (!ok || apiError) {
          throw new Error(apiError || 'Failed to fetch projects');
        }

        setProjects(data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to load projects');
        showAlert(err.message || 'Failed to load projects', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, showAlert]);

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

  const renderStatusBadge = (status) => {
    const config = statusConfig[status] || { label: 'In Progress', bgColor: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.bgColor}>
        {config.label}
      </Badge>
    );
  };

  const handleViewProject = (projectId) => {
    router.push(`/customer/projects/${projectId}`);
  };

  // Get operator name
  const getOperatorName = (project) => {
    if (project.assignedOperator?.userId) {
      const firstName = project.assignedOperator.userId.first_name || '';
      const lastName = project.assignedOperator.userId.last_name || '';
      return `${firstName} ${lastName}`.trim() || project.assignedOperator.name || 'Not Assigned';
    }
    return project.assignedOperator?.name || 'Not Assigned';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view your inspection projects
            </p>
          </div>

          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-destructive mb-4">{error}</p>
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
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search projects by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleViewProject(project._id)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {renderStatusBadge(project.status)}
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Operator</p>
                      <p className="text-sm font-medium truncate">{getOperatorName(project)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{project.totalLength}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{project.videoCount || 0} video</span>
                      </div>
                    </div>
                    {(project.aiDetections?.total || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium text-orange-500">{project.aiDetections.total}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProject(project._id);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

        {/* Summary */}
        {projects.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
        )}
      </div>
    </div>
  );
}