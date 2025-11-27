'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Download,
  ChevronLeft,
  Info,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/helper';



const getSeverityConfig = (count) => {
  if (count > 20) return { label: 'High', variant: 'destructive' };
  if (count > 10) return { label: 'Medium', variant: 'warning' };
  return { label: 'Low', variant: 'success' };
};

export default function ReportDetailPage({params}) {
  const { id } = params;
  const router = useRouter();


  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadReport = async () => {
      try {
        const response = await api(`/api/customer/get-report/${id}`, 'GET');
        const data = response.data.data;
        setReport(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load report:', err);
        setError('Report not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  const handleDownload = () => {
    alert(`Downloading full PDF report for "${report?.name}"`);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-[250px]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Skeleton className="h-5 w-[150px] mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-3 text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severity = getSeverityConfig(report.aiDetections.total);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Button variant="ghost" size="sm" onClick={goBack} className="mb-2">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{report.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary">Work Order: {report.workOrder}</Badge>
            <Badge variant={severity.variant}>
              {severity.label} Severity • {report.aiDetections.total} Defects
            </Badge>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF Report
        </Button>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspection Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Location" value={report.location} icon={<MapPin className="h-4 w-4" />} />
          <InfoRow
            label="Inspection Date"
            value={report.metadata.recordingDate}
            icon={<Calendar className="h-4 w-4" />}
          />
          <InfoRow label="Client" value={report.client} />
          <InfoRow label="Pipeline Length" value={report.totalLength} />
          <InfoRow label="Material" value={report.pipelineMaterial} />
          <InfoRow label="Shape" value={report.pipelineShape} />
          <InfoRow label="Confidence Score" value={`${(report.confidence * 100).toFixed(1)}%`} />
          <InfoRow label="Status" value="Final Report Delivered" />
        </CardContent>
      </Card>

      {/* AI Defects Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            AI Detected Defects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DefectStat label="Cracks" value={report.aiDetections.cracks} color="text-blue-600" />
            <DefectStat
              label="Fractures"
              value={report.aiDetections.fractures}
              color="text-orange-600"
            />
            <DefectStat
              label="Broken Pipes"
              value={report.aiDetections.broken_pipes}
              color="text-red-600"
            />
            <DefectStat label="Root Intrusion" value={report.aiDetections.roots} color="text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      {report.metadata.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Inspector Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{report.metadata.remarks}</p>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Field Operator</h4>
            <p className="text-sm text-muted-foreground">{report.assignedOperator.name}</p>
            <p className="text-xs text-muted-foreground">{report.assignedOperator.email}</p>
          </div>
          <div>
            <h4 className="font-medium">QC Technician</h4>
            <p className="text-sm text-muted-foreground">{report.qcTechnician.name}</p>
            <p className="text-xs text-muted-foreground">{report.qcTechnician.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function DefectStat({ label, value, color }) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}