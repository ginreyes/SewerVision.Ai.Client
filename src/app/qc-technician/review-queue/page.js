'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ListChecks, Search, ChevronRight, Zap, Clock, Shield,
  CheckCircle, AlertTriangle, Filter, Loader2, BarChart3,
} from 'lucide-react';
import { usePipeline } from '@/data/pipelineApi';
import { useUser } from '@/components/providers/UserContext';
import { PipelineProgressBar } from '@/components/shared/ProjectPipeline';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export default function ReviewQueuePage() {
  const router = useRouter();
  const { userId } = useUser() || {};
  const [search, setSearch] = useState('');

  // Fetch only qc-review projects via pipeline
  const { data: pipelineData, isLoading } = usePipeline({});

  // Extract qc-review projects and sort by priority score
  const qcProjects = (pipelineData?.data?.columns?.['qc-review'] || [])
    .map((project) => {
      const detections = project.aiDetections || {};
      const priorityScore = (detections.total || 0) * 2;

      // Calculate days waiting
      const history = project.statusHistory || [];
      const qcEntry = [...history].reverse().find(h => h.status === 'qc-review');
      const enteredAt = qcEntry ? new Date(qcEntry.changedAt) : new Date(project.updatedAt);
      const daysWaiting = Math.max(0, Math.floor((Date.now() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)));

      return { ...project, priorityScore: priorityScore * Math.max(1, daysWaiting), daysWaiting };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.client?.toLowerCase().includes(search.toLowerCase()));

  const totalDetections = qcProjects.reduce((sum, p) => sum + (p.aiDetections?.total || 0), 0);

  const handleStartReview = (projectId) => {
    router.push(`/qc-technician/quality-control?project=${projectId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Review Queue</h1>
            <p className="text-sm text-gray-500">Projects awaiting QC review, sorted by priority</p>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{qcProjects.length}</p>
              <p className="text-xs text-gray-500">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{totalDetections}</p>
              <p className="text-xs text-gray-500">Total Detections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {qcProjects.filter(p => p.daysWaiting > 3).length}
              </p>
              <p className="text-xs text-gray-500">Overdue (3+ days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Queue List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : qcProjects.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Queue Empty</h3>
            <p className="text-sm text-gray-500">No projects awaiting QC review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {qcProjects.map((project, index) => {
            const detections = project.aiDetections || {};
            const isOverdue = project.daysWaiting > 3;

            return (
              <Card
                key={project._id}
                className={`border-gray-200 hover:shadow-md transition-all cursor-pointer group ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
                onClick={() => handleStartReview(project._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-sm font-bold text-gray-500">
                      {index + 1}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                          {project.name}
                        </h3>
                        {isOverdue && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                            OVERDUE
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-2">
                        {project.client} · {project.location}
                      </p>

                      {/* Pipeline Progress */}
                      <div className="mb-2">
                        <PipelineProgressBar currentStatus="qc-review" size="sm" showLabels={false} />
                      </div>

                      {/* Detection Summary */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Zap className="w-2.5 h-2.5" /> {detections.total || 0} detections
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="w-2.5 h-2.5 mr-0.5" /> {project.daysWaiting}d waiting
                        </Badge>
                        {project.priority === 'high' && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleStartReview(project._id); }}
                    >
                      Start Review <ChevronRight className="w-3 h-3" />
                    </Button>
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
