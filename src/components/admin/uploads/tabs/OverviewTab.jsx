'use client';

import React from 'react';
import {
  Upload,
  Brain,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Server,
  Activity,
  RefreshCw,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { getFileTypeIcon, getStatusColor } from '@/lib/utils';
import GenericStatCard from '@/components/shared/GenericStatCard';
import { FileVideo, FileText as FileTextIcon, Package } from 'lucide-react';

const OverviewTab = ({ uploads, systemStats, monitoringData, loading, onRefresh }) => {
  const processingVideos = uploads.filter(
    (upload) =>
      upload.type === 'video' &&
      (upload.aiStatus === 'pending' ||
        upload.processingStatus === 'in_progress' ||
        upload.status === 'processing') &&
      upload.status !== 'failed' &&
      upload.processingStatus !== 'failed'
  );
  const processedVideos = uploads.filter(
    (upload) => upload.type === 'video' && upload.aiStatus === 'processed'
  );
  const failedVideos = uploads.filter(
    (upload) =>
      upload.type === 'video' &&
      (upload.status === 'failed' ||
        upload.processingStatus === 'failed' ||
        upload.processingError)
  );

  const showAiStatusCard =
    processingVideos.length > 0 ||
    processedVideos.length > 0 ||
    failedVideos.length > 0;

  return (
    <TabsContent value="overview" className="space-y-8">
      {/* AI Processing Status - Prominent Section */}
      {showAiStatusCard && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-xl">AI Processing Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Processing Videos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-purple-600" />
                    Currently Processing ({processingVideos.length})
                  </h3>
                </div>
                {processingVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">No videos currently processing</p>
                ) : (
                  <div className="space-y-3">
                    {processingVideos.slice(0, 5).map((upload) => (
                      <div key={upload._id} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {upload.originalName || upload.filename}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                {upload.processingStatus === 'in_progress'
                                  ? 'Processing'
                                  : upload.aiStatus === 'pending'
                                  ? 'Pending'
                                  : 'Queued'}
                              </Badge>
                              {upload.processingStartedAt && (
                                <span className="text-xs text-gray-500">
                                  Started: {new Date(upload.processingStartedAt).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Brain className="w-5 h-5 text-purple-600 animate-pulse ml-2" />
                        </div>
                      </div>
                    ))}
                    {processingVideos.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{processingVideos.length - 5} more processing...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Processed Videos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Recently Processed ({processedVideos.length})
                  </h3>
                </div>
                {processedVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">No videos processed yet</p>
                ) : (
                  <div className="space-y-3">
                    {processedVideos.slice(0, 5).map((upload) => (
                      <div key={upload._id} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {upload.originalName || upload.filename}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Processed
                              </Badge>
                              {upload.defectsFound !== undefined && (
                                <span className="text-xs text-gray-600">
                                  {upload.defectsFound} defects found
                                </span>
                              )}
                              {upload.confidence !== undefined && (
                                <span className="text-xs text-gray-600">
                                  {upload.confidence.toFixed(1)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                        </div>
                      </div>
                    ))}
                    {processedVideos.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{processedVideos.length - 5} more processed
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Failed Videos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                    Failed ({failedVideos.length})
                  </h3>
                </div>
                {failedVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">No failed videos</p>
                ) : (
                  <div className="space-y-3">
                    {failedVideos.slice(0, 5).map((upload) => (
                      <div key={upload._id} className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {upload.originalName || upload.filename}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                Failed
                              </Badge>
                              {upload.processingError && (
                                <span className="text-xs text-red-600 truncate" title={upload.processingError}>
                                  {upload.processingError.substring(0, 50)}...
                                </span>
                              )}
                            </div>
                          </div>
                          <AlertTriangle className="w-5 h-5 text-red-600 ml-2" />
                        </div>
                      </div>
                    ))}
                    {failedVideos.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{failedVideos.length - 5} more failed
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats — admin module KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GenericStatCard
          icon={HardDrive}
          label="Total Storage"
          value={systemStats.totalStorage}
          subtitle={`${systemStats.usedStorage} used`}
          color="blue"
        />
        <GenericStatCard
          icon={FolderOpen}
          label="Total Files"
          value={systemStats.totalFiles}
          subtitle={`+${systemStats.monthlyUploads} this month`}
          color="green"
        />
        <GenericStatCard
          icon={Upload}
          label="Active Uploads"
          value={systemStats.activeUploads}
          subtitle={`${systemStats.failedUploads} failed`}
          color="amber"
        />
        <GenericStatCard
          icon={Brain}
          label="AI Processing"
          value={monitoringData.processingQueue.length}
          subtitle="Videos in queue"
          color="purple"
        />
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">Storage Usage</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                How the active provider bucket is being used right now.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-5">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>
                Used: <span className="font-medium text-gray-800 dark:text-gray-200">{systemStats.usedStorage}</span> of{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">{systemStats.totalStorage}</span>
              </span>
              <span className="font-semibold">{systemStats.storageUsage}%</span>
            </div>
            <Progress value={systemStats.storageUsage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Video Files', value: systemStats.videoFiles, icon: FileVideo, bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
              { label: 'Documents', value: systemStats.documentFiles, icon: FileTextIcon, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Archives', value: systemStats.archiveFiles, icon: Package, bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
              { label: 'Other', value: systemStats.otherFiles, icon: FolderOpen, bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
            ].map((row) => {
              const RowIcon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className={`w-9 h-9 rounded-lg ${row.bg} flex items-center justify-center flex-shrink-0`}>
                    <RowIcon className={`w-4 h-4 ${row.text}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{row.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Upload Activity</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Latest five files added to the system.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {uploads.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">No recent uploads</p>
            ) : uploads.slice(0, 5).map((upload) => (
              <div
                key={upload._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">{getFileTypeIcon(upload.type)}</div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{upload.originalName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(upload.uploadedAt).toLocaleDateString()} • {upload.size}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(upload.status)}>
                  {upload.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default OverviewTab;
