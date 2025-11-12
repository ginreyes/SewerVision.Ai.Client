'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  AlertCircle,
  Eye,
  FileText,
  Clock,
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

// Mock projects data
const mockProjects = [
  {
    _id: 'proj-001',
    name: 'Downtown Sewer Inspection',
    location: 'Beirut, Lebanon',
    status: 'completed',
    created_at: '2025-10-15T10:00:00Z',
    inspector: 'John Smith',
    totalFootage: 1250,
    defectsCount: 8,
    segmentsCount: 3,
  },
  {
    _id: 'proj-002',
    name: 'Main Street Pipeline Survey',
    location: 'Tripoli, Lebanon',
    status: 'ai-processing',
    created_at: '2025-11-05T14:30:00Z',
    inspector: 'Sarah Johnson',
    totalFootage: 890,
    defectsCount: 0,
    segmentsCount: 2,
  },
  {
    _id: 'proj-003',
    name: 'Residential Area Inspection',
    location: 'Sidon, Lebanon',
    status: 'qc-review',
    created_at: '2025-11-08T09:15:00Z',
    inspector: 'Michael Chen',
    totalFootage: 650,
    defectsCount: 5,
    segmentsCount: 2,
  },
  {
    _id: 'proj-004',
    name: 'Industrial Zone Assessment',
    location: 'Zahle, Lebanon',
    status: 'customer-notified',
    created_at: '2025-10-28T11:45:00Z',
    inspector: 'Emma Davis',
    totalFootage: 1450,
    defectsCount: 12,
    segmentsCount: 4,
  },
  {
    _id: 'proj-005',
    name: 'Airport Road Infrastructure',
    location: 'Beirut, Lebanon',
    status: 'completed',
    created_at: '2025-11-02T16:20:00Z',
    inspector: 'John Smith',
    totalFootage: 2100,
    defectsCount: 15,
    segmentsCount: 5,
  },
  {
    _id: 'proj-006',
    name: 'Coastal Highway Drainage',
    location: 'Jounieh, Lebanon',
    status: 'ai-processing',
    created_at: '2025-11-09T08:00:00Z',
    inspector: 'Sarah Johnson',
    totalFootage: 780,
    defectsCount: 0,
    segmentsCount: 2,
  },
];

// Status configuration
const statusConfig = {
  completed: { label: 'Ready for Review', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'customer-notified': { label: 'Completed', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'qc-review': { label: 'QC Review', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'ai-processing': { label: 'Processing', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
};

export default function ProjectPage() {
  const [projects] = useState(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.location.toLowerCase().includes(searchQuery.toLowerCase());
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
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
                    <SelectItem value="completed">Ready for Review</SelectItem>
                    <SelectItem value="customer-notified">Completed</SelectItem>
                    <SelectItem value="qc-review">QC Review</SelectItem>
                    <SelectItem value="ai-processing">Processing</SelectItem>
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
                      <p className="text-xs text-muted-foreground">Inspector</p>
                      <p className="text-sm font-medium truncate">{project.inspector}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{project.totalFootage} ft</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{project.segmentsCount} seg</span>
                      </div>
                    </div>
                    {project.defectsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium text-orange-500">{project.defectsCount}</span>
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
                  : 'Get started by creating your first project'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
      </div>
    </div>
  );
}