'use client';

import { Clock, ImageIcon, Zap, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSeverityVariant } from '@/components/customer/constants';
import { getSnapshotUrl } from '@/lib/getVideoUrl';

const severityBorder = {
  high: 'border-l-red-500',
  medium: 'border-l-orange-400',
  low: 'border-l-emerald-500',
};

const buildImgSrc = (rawUrl) => {
  return getSnapshotUrl(rawUrl);
};

const DefectCard = ({ observation, snapshot }) => {
  // 1) Use observation's own snapshotUrl if it has one
  // 2) Fall back to linked Snapshot document's imageUrl (matched by observationId)
  const rawUrl = observation.snapshotUrl || snapshot?.imageUrl;
  const hasSnapshot = rawUrl ? true : false;
  const snapshotSrc = buildImgSrc(rawUrl);
  const borderClass = severityBorder[observation.severity] || 'border-l-gray-300';

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow border-l-4 ${borderClass}`}>
      {hasSnapshot ? (
        <a href={snapshotSrc} target="_blank" rel="noopener noreferrer" className="block">
          <div className="aspect-video bg-muted overflow-hidden relative">
            <img
              src={snapshotSrc}
              alt={observation.pacpCode || observation.observation}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              loading="lazy"
            />
            {observation.aiGenerated && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 gap-1">
                  <Zap className="h-3 w-3" />
                  AI
                </Badge>
              </div>
            )}
          </div>
        </a>
      ) : (
        <div className="aspect-video bg-muted overflow-hidden relative">
          <img
            src="/background_pictures/no_picture.jpg"
            alt="No snapshot available"
            className="w-full h-full object-cover opacity-60"
          />
          {observation.aiGenerated && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 gap-1">
                <Zap className="h-3 w-3" />
                AI
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardContent className="p-4">
        <div className="space-y-2.5">
          {/* PACP Code + Severity */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono font-semibold text-xs">
              {observation.pacpCode || 'N/A'}
            </Badge>
            <Badge variant={getSeverityVariant(observation.severity)}>
              {observation.severity}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed line-clamp-2">
            {observation.observation || observation.remarks || 'No description'}
          </p>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {observation.time || 'N/A'}
              </span>
              <span>
                {observation.distance || 'N/A'}
              </span>
              {observation.clockPosition && (
                <span className="flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5" />
                  {observation.clockPosition}
                </span>
              )}
            </div>
            {observation.confidence != null && (
              <span className="text-blue-600 font-medium">
                {observation.confidence <= 1 ? (observation.confidence * 100).toFixed(0) : Math.round(observation.confidence)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefectCard;
