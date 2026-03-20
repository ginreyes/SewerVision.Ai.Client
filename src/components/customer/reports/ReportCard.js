'use client';

import { MapPin, Calendar, AlertCircle, Download, Eye, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSeverityConfig, statusLabels } from '@/components/customer/constants';

const ReportCard = ({ report, onView, onDownload }) => {
  const severity = getSeverityConfig(report.aiDetections.total);
  const statusLabel = statusLabels[report.status] || 'Report Ready';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
              onClick={() => onView(report._id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(report._id)}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
