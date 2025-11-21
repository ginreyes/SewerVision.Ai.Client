'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/components/providers/UserContext';
import { api } from '@/lib/helper';

// Helper: status config
const statusConfig = {
  completed: { label: 'Ready for Review', color: 'success' },
  'customer-notified': { label: 'Completed', color: 'purple' },
  'qc-review': { label: 'QC Review', color: 'warning' },
  'ai-processing': { label: 'Processing', color: 'secondary' },
  'field-capture': { label: 'Field Capture', color: 'default' },
  uploading: { label: 'Uploading', color: 'secondary' },
  'on-hold': { label: 'On Hold', color: 'destructive' },
  planning: { label: 'Planning', color: 'outline' },
};

// Helper: severity config
const getSeverityConfig = (count) => {
  if (count > 20) return { label: 'High', variant: 'destructive' };
  if (count > 10) return { label: 'Medium', variant: 'warning' };
  return { label: 'Low', variant: 'success' };
};

export default function CustomerDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { userId } = useUser();

  useEffect(() => {
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, ok, error: apiError } = await api(
        `/api/customer/get-all-projects/${userId}?page=1&limit=20&status=${filterStatus !== 'all' ? filterStatus : ''}`,
        'GET'
      );
      
      if (!ok || apiError) {
        console.error('Error fetching projects:', apiError);
        setError(apiError || 'Failed to load projects');
        return;
      }

      setProjects(data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

    if (userId) {
      fetchProjects();
    }
  }, [userId]);

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

  // Render status badge
  const renderStatusBadge = (status) => {
    const config = statusConfig[status] || { label: 'In Progress', color: 'outline' };
    return <Badge variant={config.color}>{config.label}</Badge>;
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
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
              {typeof error === 'string' ? error : 'Failed to load projects'}
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
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
      <div className="space-y-4">
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
            <Card
              key={project._id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/customer/projects/${project._id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      {renderStatusBadge(project.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {project.aiDetections?.total || 0} defects
                      </div>
                    </div>
                    {project.aiDetections?.total > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Severity:</span>
                        <Badge variant={getSeverityConfig(project.aiDetections.total).variant}>
                          {getSeverityConfig(project.aiDetections.total).label}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}