'use client';

import { Clock, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSeverityVariant } from '@/components/customer/constants';

const DefectCard = ({ observation }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const rawUrl = observation.snapshotUrl;
  const snapshotSrc = rawUrl?.startsWith('http') ? rawUrl : `${backendUrl}/api/videos/snapshot/${rawUrl}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {observation.snapshotUrl ? (
        <div className="aspect-video bg-muted overflow-hidden">
          <img
            src={snapshotSrc}
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
  );
};

export default DefectCard;
