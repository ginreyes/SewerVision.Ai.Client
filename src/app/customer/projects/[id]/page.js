'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Loader2,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useUser } from '@/components/providers/UserContext';
import { api } from '@/lib/helper';
import { useAlert } from '@/components/providers/AlertProvider';

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

const getSeverityVariant = (severity) => {
  const variants = {
    high: 'destructive',
    medium: 'warning',
    low: 'success',
  };
  return variants[severity] || 'outline';
};

export default function ProjectPageViewDetails() {
  const router = useRouter();
  const params = useParams();
  const { userId } = useUser();
  const { showAlert } = useAlert();
  
  const projectId = params?.id || params?.projectId;

  const [project, setProject] = useState(null);
  const [observations, setObservations] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch project
        const { data: projectData, ok: projectOk, error: projectError } = await api(
          `/api/customer/get-project/${projectId}?userId=${userId}`,
          'GET'
        );

        if (!projectOk || projectError) {
          throw new Error(projectError || 'Failed to fetch project');
        }

        setProject(projectData.data);

        // Fetch observations
        const { data: obsData, ok: obsOk } = await api(
          `/api/customer/get-project-observations/${projectId}?limit=100`,
          'GET'
        );

        if (obsOk && obsData?.data) {
          setObservations(obsData.data);
        }

        // Fetch snapshots
        const { data: snapData, ok: snapOk } = await api(
          `/api/customer/get-project-snapshots/${projectId}?limit=100`,
          'GET'
        );

        if (snapOk && snapData?.data) {
          setSnapshots(snapData.data);
        }
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'Failed to load project details');
        showAlert(err.message || 'Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, userId, showAlert]);

  const openVideoModal = (url) => {
    setVideoUrl(url);
    setIsDialogOpen(true);
  };

  const handleDownloadReport = async () => {
    try {
      const { data, ok, error: apiError } = await api(
        `/api/customer/download-report/${projectId}?userId=${userId}`,
        'GET'
      );

      if (!ok || apiError) {
        throw new Error(apiError || 'Failed to download report');
      }

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${projectId}-report.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showAlert('Report downloaded successfully', 'success');
    } catch (err) {
      console.error('Error downloading report:', err);
      showAlert(err.message || 'Failed to download report', 'error');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: project?.name || 'Project Details',
        text: `Check out this project: ${project?.name}`,
        url: url,
      }).catch((err) => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      showAlert('Link copied to clipboard', 'success');
    }
  };

  // Filter observations by severity
  const filteredObservations = observations.filter((obs) => {
    const matchesSeverity = severityFilter === 'all' || obs.severity === severityFilter;
    return matchesSeverity;
  });

  const renderStatusBadge = (status) => {
    const config = statusConfig[status] || {
      label: 'In Progress',
      color: 'outline',
    };
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading project details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/customer/projects')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">
              {error || 'Project not found'}
            </p>
            <Button onClick={() => router.push('/customer/projects')}>
              Return to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get operator name
  const operatorName = project.assignedOperator?.userId
    ? `${project.assignedOperator.userId.first_name || ''} ${project.assignedOperator.userId.last_name || ''}`.trim() ||
      project.assignedOperator.name
    : 'Not Assigned';

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/customer/projects')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {renderStatusBadge(project.status)}
          </div>
          <p className="text-muted-foreground">
            {project.client} • Work Order: {project.workOrder}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
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
                  {new Date(project.metadata?.recordingDate || project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Operator</p>
                <p className="font-medium">{operatorName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Defects Found</p>
                <p className="font-medium">{project.aiDetections?.total || 0} issues</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="defects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="defects">
            Defects ({observations.length})
          </TabsTrigger>
          <TabsTrigger value="snapshots">
            Snapshots ({snapshots.length})
          </TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>

        {/* Defects Tab */}
        <TabsContent value="defects" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
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
            {filteredObservations.map((observation) => (
              <Card
                key={observation._id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {observation.snapshotUrl ? (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={observation.snapshotUrl}
                      alt={observation.defectType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold capitalize">
                            {observation.defectType || 'Unknown'}
                          </h3>
                          <Badge variant={getSeverityVariant(observation.severity)}>
                            {observation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Distance: {observation.distance || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{observation.description || 'No description'}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {observation.timestamp || 'N/A'}
                      </span>
                      {observation.aiConfidence && (
                        <span className="text-xs">
                          AI: {(observation.aiConfidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredObservations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {severityFilter !== 'all'
                    ? 'No defects found matching filters'
                    : 'No defects have been detected yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots" className="space-y-4">
          {project.videoUrl ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="aspect-video w-48 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-grow space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Inspection Video</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.totalLength} total length
                        </p>
                      </div>
                      <Badge variant="outline">{observations.length} defects</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openVideoModal(project.videoUrl)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No video available for this project</p>
              </CardContent>
            </Card>
          )}

          {/* Show snapshots if any */}
          {snapshots.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {snapshots.map((snapshot) => (
                <Card key={snapshot._id} className="overflow-hidden">
                  {snapshot.imageUrl ? (
                    <img
                      src={snapshot.imageUrl}
                      alt={`Snapshot at ${snapshot.timestamp}`}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {snapshot.timestamp || 'N/A'}
                      </span>
                      <span className="text-sm font-medium">
                        {snapshot.distance || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="text-base mt-1">{project.client}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Work Order</p>
                  <p className="text-base mt-1">{project.workOrder}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operator</p>
                  <p className="text-base mt-1">{operatorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inspection Date</p>
                  <p className="text-base mt-1">
                    {new Date(project.metadata?.recordingDate || project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Length</p>
                  <p className="text-base mt-1">{project.totalLength}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{renderStatusBadge(project.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pipeline Material</p>
                  <p className="text-base mt-1">{project.pipelineMaterial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pipeline Shape</p>
                  <p className="text-base mt-1">{project.pipelineShape}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {project.priority}
                  </Badge>
                </div>
              </div>
              
              {/* Metadata */}
              {project.metadata && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Inspection Metadata</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Upstream Manhole
                        </p>
                        <p className="text-base mt-1">{project.metadata.upstreamMH}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Downstream Manhole
                        </p>
                        <p className="text-base mt-1">{project.metadata.downstreamMH}</p>
                      </div>
                      {project.metadata.remarks && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                          <p className="text-base mt-1">{project.metadata.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                  <Badge variant="outline" className="text-base">
                    {project.aiDetections?.total || observations.length}
                  </Badge>
                </div>
                {project.aiDetections && Object.keys(project.aiDetections).length > 1 ? (
                  Object.entries(project.aiDetections).map(([type, count]) => {
                    if (type === 'total') return null;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    Defect breakdown not available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Inspection Video</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            <video src={videoUrl} controls autoPlay className="w-full h-full object-contain">
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}