'use client';

import { useMemo } from 'react';
import { ImageIcon, Play, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const buildImageSrc = (rawUrl) => {
  if (!rawUrl) return '';
  // base64 or full URL → use as-is; otherwise prefix with backend snapshot route
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('http')) return rawUrl;
  return `${backendUrl}/api/videos/snapshot/${rawUrl}`;
};

const SnapshotGrid = ({ project, snapshots, detections = [], observations, videos = [], onOpenVideo }) => {
  const videoSrc = useMemo(() => {
    const videoList = Array.isArray(videos) ? videos : [];
    const latest = videoList[0];
    if (latest?._id) {
      return `${backendUrl}/api/videos/${latest._id}`;
    }
    if (project?.videoUrl) {
      return project.videoUrl.startsWith('http')
        ? project.videoUrl
        : `${backendUrl}/${project.videoUrl.startsWith('/') ? project.videoUrl.slice(1) : project.videoUrl}`;
    }
    return '';
  }, [videos, project?.videoUrl]);

  const hasVideo = videoSrc || project?.videoUrl;

  // Merge manual snapshots + AI detection snapshots (same pattern as admin ProjectDetail)
  const allSnapshots = useMemo(() => {
    const manual = snapshots.map((s) => ({
      _id: s._id,
      imageUrl: s.imageUrl,
      label: s.label,
      color: s.color,
      timestamp: s.timestamp,
      distance: s.distance,
      confidence: s.confidence,
      aiGenerated: s.aiGenerated,
    }));

    const detectionSnaps = (detections || [])
      .filter((d) => d.images && d.images.length > 0 && d.images[0].url)
      .map((d) => ({
        _id: d._id,
        imageUrl: d.images[0].url, // B2 filename — buildImageSrc will prefix it
        label: d.type || 'AI Detection',
        color: null,
        timestamp: d.timestamp || d.detectedAt || d.createdAt,
        distance: d.location?.distance != null ? String(d.location.distance) : `Frame ${d.frameNumber || 0}`,
        confidence: d.confidence,
        aiGenerated: true,
        severity: d.severity,
      }));

    return [...manual, ...detectionSnaps];
  }, [snapshots, detections]);

  return (
    <div className="space-y-4">
      {hasVideo ? (
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
                  onClick={() => onOpenVideo(videoSrc)}
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

      {allSnapshots.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allSnapshots.map((snapshot) => {
            const imgSrc = buildImageSrc(snapshot.imageUrl);
            return (
              <Card key={snapshot._id} className="overflow-hidden hover:shadow-md transition-shadow">
                {imgSrc ? (
                  <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative">
                      <img
                        src={imgSrc}
                        alt={`Snapshot at ${snapshot.timestamp}`}
                        className="w-full aspect-video object-cover hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                      {/* Label overlay */}
                      {snapshot.label && (
                        <div className="absolute bottom-2 left-2">
                          <Badge
                            className="text-white text-[10px] shadow-md"
                            style={{ backgroundColor: snapshot.color || '#3b82f6' }}
                          >
                            {snapshot.label}
                          </Badge>
                        </div>
                      )}
                      {/* AI badge */}
                      {snapshot.aiGenerated && (
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
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src="/background_pictures/no_picture.jpg"
                      alt="No snapshot available"
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {snapshot.timestamp || 'N/A'}
                    </span>
                    <div className="flex items-center gap-2">
                      {snapshot.confidence != null && (
                        <span className="text-xs text-blue-600 font-medium">
                          {snapshot.confidence <= 1 ? (snapshot.confidence * 100).toFixed(0) : Math.round(snapshot.confidence)}%
                        </span>
                      )}
                      <span className="text-sm font-medium">
                        {snapshot.distance || 'N/A'}
                      </span>
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
};

export default SnapshotGrid;
