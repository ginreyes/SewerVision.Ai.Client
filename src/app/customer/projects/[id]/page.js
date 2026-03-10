'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  FileText,
  AlertCircle,
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
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { statusConfig } from '@/components/customer/constants';
import {
  useCustomerProject,
  useCustomerObservations,
  useCustomerSnapshots,
  useDownloadCustomerReport,
} from '@/hooks/useQueryHooks';

import ProjectInfoCard from '@/components/customer/project-detail/ProjectInfoCard';
import DefectCard from '@/components/customer/project-detail/DefectCard';
import SnapshotGrid from '@/components/customer/project-detail/SnapshotGrid';
import VideoModal from '@/components/customer/project-detail/VideoModal';
import DefectSummary from '@/components/customer/project-detail/DefectSummary';

export default function ProjectPageViewDetails() {
  const router = useRouter();
  const params = useParams();
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const projectId = params?.id || params?.projectId;

  const [severityFilter, setSeverityFilter] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // TanStack Query hooks
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useCustomerProject(projectId, userId);

  const {
    data: observations = [],
    isLoading: obsLoading,
  } = useCustomerObservations(projectId);

  const {
    data: snapshots = [],
    isLoading: snapsLoading,
  } = useCustomerSnapshots(projectId);

  const downloadReportMutation = useDownloadCustomerReport();

  const loading = projectLoading || obsLoading || snapsLoading;
  const error = projectError;

  const openVideoModal = (url) => {
    setVideoUrl(url);
    setIsDialogOpen(true);
  };

  const handleDownloadReport = async () => {
    try {
      const data = await downloadReportMutation.mutateAsync({ projectId, userId });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
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

  const filteredObservations = observations.filter((obs) => {
    return severityFilter === 'all' || obs.severity === severityFilter;
  });

  const renderStatusBadge = (status) => {
    const config = statusConfig[status] || { label: 'In Progress', color: 'outline' };
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

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
            <p className="text-destructive mb-4">{error?.message || 'Project not found'}</p>
            <Button onClick={() => router.push('/customer/projects')}>
              Return to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <ProjectInfoCard project={project} operatorName={operatorName} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="defects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="defects">Defects ({observations.length})</TabsTrigger>
          <TabsTrigger value="snapshots">Snapshots ({snapshots.length})</TabsTrigger>
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
              <DefectCard key={observation._id} observation={observation} />
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
          <SnapshotGrid
            project={project}
            snapshots={snapshots}
            observations={observations}
            onOpenVideo={openVideoModal}
          />
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

              {project.metadata && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Inspection Metadata</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Upstream Manhole</p>
                      <p className="text-base mt-1">{project.metadata.upstreamMH}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Downstream Manhole</p>
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
              )}
            </CardContent>
          </Card>

          <DefectSummary project={project} observations={observations} />
        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      <VideoModal videoUrl={videoUrl} isOpen={isDialogOpen} onClose={setIsDialogOpen} />
    </div>
  );
}
