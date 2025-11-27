'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  Eye,
  Info,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';

const getSeverityConfig = (count) => {
  if (count > 20) return { label: 'High', variant: 'destructive' };
  if (count > 10) return { label: 'Medium', variant: 'warning' };
  return { label: 'Low', variant: 'success' };
};

const statusLabels = {
  completed: 'Finalized',
  'customer-notified': 'Delivered',
};

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {userId} = useUser();


  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await api(`/api/customer/get-all-reports/${userId}`, 'GET');

        const data = response.data.data
        
        setReports(data);
      } 
      catch (error) {
        console.error('Failed to load reports:', error);
      } 
      finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const handleViewReport = (id) => {
    router.push(`/customer/reports/${id}`);
  };

  const handleDownload = (id) => {
    alert(`Downloading report for project ${id}`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground">
          Download or review finalized inspection reports
        </p>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-[200px]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <Skeleton className="h-3 w-[120px]" />
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-3 w-[90px]" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Available Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your inspection reports will appear here once they have been finalized and delivered. 
              Reports are generated after the inspection is completed and quality control is finished.
            </p>
            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/customer/projects')}
              >
                View My Projects
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Check your projects to see their current status
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const severity = getSeverityConfig(report.aiDetections.total);
            const statusLabel = statusLabels[report.status] || 'Report Ready';

            return (
              <Card
                key={report._id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{report.name}</h3>
                        <Badge variant="secondary">{statusLabel}</Badge>
                        {report.aiDetections.total > 0 && (
                          <Badge variant={severity.variant}>
                            {severity.label} Severity
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {report.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          {report.totalLength} • {report.pipelineMaterial}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {report.aiDetections.total} defects detected
                        </div>
                      </div>

                      <div className="text-sm mt-2">
                        <span className="font-medium">Work Order:</span> {report.workOrder}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row-reverse md:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReport(report._id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(report._id)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}