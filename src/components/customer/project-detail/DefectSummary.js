'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DefectSummary = ({ project, observations }) => {
  return (
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
  );
};

export default DefectSummary;
