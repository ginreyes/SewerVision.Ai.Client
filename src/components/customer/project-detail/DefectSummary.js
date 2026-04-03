'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

const DefectSummary = ({ project, observations }) => {
  const stats = useMemo(() => {
    const high = observations.filter((o) => o.severity === 'high').length;
    const medium = observations.filter((o) => o.severity === 'medium').length;
    const low = observations.filter((o) => o.severity === 'low').length;
    const total = observations.length || project.aiDetections?.total || 0;
    const aiCount = observations.filter((o) => o.aiGenerated).length;
    const avgConfidence = observations.length > 0
      ? observations.reduce((sum, o) => sum + (o.confidence || 0), 0) / observations.length
      : 0;
    return { high, medium, low, total, aiCount, avgConfidence };
  }, [observations, project.aiDetections?.total]);

  const maxCount = Math.max(stats.high, stats.medium, stats.low, 1);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Defect Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Total + AI Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Defects</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold flex items-center justify-center gap-1">
              <Zap className="h-5 w-5 text-blue-500" />
              {stats.aiCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">AI Detected</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold text-blue-600">
              {stats.avgConfidence > 0 ? `${stats.avgConfidence <= 1 ? (stats.avgConfidence * 100).toFixed(0) : Math.round(stats.avgConfidence)}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg Confidence</p>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Severity Distribution</h4>

          {/* Stacked bar */}
          {stats.total > 0 && (
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {stats.high > 0 && (
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(stats.high / stats.total) * 100}%` }}
                />
              )}
              {stats.medium > 0 && (
                <div
                  className="bg-orange-400 transition-all"
                  style={{ width: `${(stats.medium / stats.total) * 100}%` }}
                />
              )}
              {stats.low > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(stats.low / stats.total) * 100}%` }}
                />
              )}
            </div>
          )}

          {/* Individual bars */}
          <div className="space-y-2">
            {[
              { label: 'High', count: stats.high, color: 'bg-red-500', text: 'text-red-600' },
              { label: 'Medium', count: stats.medium, color: 'bg-orange-400', text: 'text-orange-600' },
              { label: 'Low', count: stats.low, color: 'bg-emerald-500', text: 'text-emerald-600' },
            ].map(({ label, count, color, text }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm w-16">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold w-8 text-right ${text}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Defect Type Breakdown */}
        {project.aiDetections && Object.keys(project.aiDetections).length > 1 && (
          <div className="space-y-2 pt-3 border-t">
            <h4 className="text-sm font-medium">Defect Types</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.aiDetections).map(([type, count]) => {
                if (type === 'total') return null;
                return (
                  <Badge key={type} variant="outline" className="gap-1 capitalize">
                    {type.replace('_', ' ')}
                    <span className="font-bold ml-0.5">{count}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefectSummary;
