'use client';

import { ImageIcon, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SnapshotGrid = ({ project, snapshots, observations, onOpenVideo }) => {
  return (
    <div className="space-y-4">
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
                  onClick={() => onOpenVideo(project.videoUrl)}
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
    </div>
  );
};

export default SnapshotGrid;
