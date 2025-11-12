'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  Share2,
  Clock,
  Play,
  User,
  ImageIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// shadcn Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

// Mock project data
const mockProject = {
  _id: 'proj-001',
  name: 'Downtown Sewer Inspection',
  location: 'Beirut, Lebanon',
  status: 'completed',
  created_at: '2025-10-15T10:00:00Z',
  description: 'Comprehensive inspection of the downtown sewer system including main lines and branch connections.',
  client: 'City of Beirut',
  inspector: 'John Smith',
  totalFootage: 1250,
  aiDetections: {
    total: 8,
    byType: {
      crack: 3,
      root: 2,
      corrosion: 2,
      blockage: 1,
    },
  },
  segments: [
    {
      id: 'seg-001',
      name: 'Main Line A',
      footage: 450,
      defects: 3,
      status: 'reviewed',
      videoUrl: '/videos/seg-001.mp4',
      thumbnail: '/thumbnails/seg-001.jpg',
    },
    {
      id: 'seg-002',
      name: 'Branch Line B1',
      footage: 300,
      defects: 2,
      status: 'reviewed',
      videoUrl: '/videos/seg-002.mp4',
      thumbnail: '/thumbnails/seg-002.jpg',
    },
    {
      id: 'seg-003',
      name: 'Main Line C',
      footage: 500,
      defects: 3,
      status: 'reviewed',
      videoUrl: '/videos/seg-003.mp4',
      thumbnail: '/thumbnails/seg-003.jpg',
    },
  ],
  defects: [
    {
      id: 'def-001',
      type: 'crack',
      severity: 'high',
      location: 'Main Line A - 125ft',
      description: 'Longitudinal crack detected',
      timestamp: '00:03:45',
      segmentId: 'seg-001',
      image: '/defects/def-001.jpg',
      aiConfidence: 0.92,
    },
    {
      id: 'def-002',
      type: 'root',
      severity: 'medium',
      location: 'Branch Line B1 - 78ft',
      description: 'Root intrusion observed',
      timestamp: '00:02:15',
      segmentId: 'seg-002',
      image: '/defects/def-002.jpg',
      aiConfidence: 0.88,
    },
    {
      id: 'def-003',
      type: 'corrosion',
      severity: 'high',
      location: 'Main Line C - 320ft',
      description: 'Severe pipe corrosion',
      timestamp: '00:08:12',
      segmentId: 'seg-003',
      image: '/defects/def-003.jpg',
      aiConfidence: 0.95,
    },
    {
      id: 'def-004',
      type: 'crack',
      severity: 'low',
      location: 'Main Line A - 285ft',
      description: 'Minor surface crack',
      timestamp: '00:07:20',
      segmentId: 'seg-001',
      image: '/defects/def-004.jpg',
      aiConfidence: 0.78,
    },
    {
      id: 'def-005',
      type: 'blockage',
      severity: 'high',
      location: 'Branch Line B1 - 145ft',
      description: 'Partial blockage detected',
      timestamp: '00:04:52',
      segmentId: 'seg-002',
      image: '/defects/def-005.jpg',
      aiConfidence: 0.91,
    },
    {
      id: 'def-006',
      type: 'crack',
      severity: 'medium',
      location: 'Main Line C - 89ft',
      description: 'Circumferential crack',
      timestamp: '00:02:38',
      segmentId: 'seg-003',
      image: '/defects/def-006.jpg',
      aiConfidence: 0.85,
    },
    {
      id: 'def-007',
      type: 'root',
      severity: 'low',
      location: 'Main Line A - 412ft',
      description: 'Minor root penetration',
      timestamp: '00:10:45',
      segmentId: 'seg-001',
      image: '/defects/def-007.jpg',
      aiConfidence: 0.82,
    },
    {
      id: 'def-008',
      type: 'corrosion',
      severity: 'medium',
      location: 'Main Line C - 467ft',
      description: 'Moderate corrosion observed',
      timestamp: '00:11:28',
      segmentId: 'seg-003',
      image: '/defects/def-008.jpg',
      aiConfidence: 0.89,
    },
  ],
};

const statusConfig = {
  completed: { label: 'Ready for Review', color: 'success' },
  'customer-notified': { label: 'Completed', color: 'purple' },
  'qc-review': { label: 'QC Review', color: 'warning' },
  'ai-processing': { label: 'Processing', color: 'secondary' },
};

const getSeverityVariant = (severity) => {
  const variants  = {
    high: 'destructive',
    medium: 'warning',
    low: 'success',
  };
  return variants[severity] || 'outline';
};

export default function ProjectPageViewDetails() {
  const router = useRouter();
  const [project] = useState(mockProject);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Modal state for video
  const [videoUrl, setVideoUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openVideoModal = (url) => {
    setVideoUrl(url);
    setIsDialogOpen(true);
  };

  const filteredDefects = project.defects.filter((defect) => {
    const matchesSegment = selectedSegment === 'all' || defect.segmentId === selectedSegment;
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
    return matchesSegment && matchesSeverity;
  });

  const renderStatusBadge = (status) => {
    const config = statusConfig[status] || { label: 'In Progress', color: 'outline' };
    return <Badge variant={config.color }>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/customer/projects')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {renderStatusBadge(project.status)}
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{project.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Inspection Date</p>
                <p className="font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Inspector</p>
                <p className="font-medium">{project.inspector}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Defects Found</p>
                <p className="font-medium">{project.aiDetections.total} issues</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="defects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="defects">Defects ({project.aiDetections.total})</TabsTrigger>
          <TabsTrigger value="segments">Video Segments ({project.segments.length})</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                {project.segments.map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    {seg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDefects.map((defect) => (
              <Card key={defect.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold capitalize">{defect.type}</h3>
                          <Badge variant={getSeverityVariant(defect.severity)}>
                            {defect.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{defect.location}</p>
                      </div>
                    </div>
                    <p className="text-sm">{defect.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {defect.timestamp}
                      </span>
                      <span className="text-xs">AI: {(defect.aiConfidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDefects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No defects found matching filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4">
            {project.segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="aspect-video w-48 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-grow space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{segment.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {segment.footage} ft inspected
                          </p>
                        </div>
                        <Badge variant="outline">{segment.defects} defects</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openVideoModal(segment.videoUrl)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                  <p className="text-base mt-1">{project.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base mt-1">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inspector</p>
                  <p className="text-base mt-1">{project.inspector}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inspection Date</p>
                  <p className="text-base mt-1">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Footage</p>
                  <p className="text-base mt-1">{project.totalFootage} feet</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{renderStatusBadge(project.status)}</div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base mt-1">{project.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defect Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-medium">Total Defects</span>
                  <Badge variant="outline" className="text-base">{project.aiDetections.total}</Badge>
                </div>
                {Object.entries(project.aiDetections.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Modal using shadcn Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Inspection Video</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}