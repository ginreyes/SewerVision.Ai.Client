'use client';

import React from 'react';
import {
  Upload,
  Brain,
  AlertTriangle,
  CheckCircle,
  FileVideo,
  Archive,
  HardDrive,
  Activity,
  RefreshCw,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  Loader2,
  Database,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TabsContent } from '@/components/ui/tabs';
import { getFileTypeIcon } from '@/lib/utils';

const MonitoringTab = ({
  systemStats,
  monitoringData,
  monitoringLoading,
  statsLoading,
  storageConfig,
  onRefresh,
}) => {
  return (
    <TabsContent value="monitoring" className="space-y-6">
      {/* Refresh Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Real-time Monitoring</h2>
          <p className="text-sm text-gray-500">Auto-refreshes every 5 seconds when active</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={monitoringLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${monitoringLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Activity className="w-5 h-5 text-green-600" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Upload Service</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Processing</span>
                  <Badge
                    className={
                      monitoringData.processingQueue.length > 0
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                    }
                  >
                    {monitoringData.processingQueue.length > 0
                      ? `${monitoringData.processingQueue.length} Active`
                      : 'Idle'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage Health</span>
                  <Badge
                    className={
                      systemStats.diskHealthStatus === 'critical'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : systemStats.diskHealthStatus === 'warning'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-green-100 text-green-800 border-green-200'
                    }
                  >
                    {systemStats.diskHealthStatus === 'critical'
                      ? 'Critical'
                      : systemStats.diskHealthStatus === 'warning'
                      ? 'Warning'
                      : 'Healthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backblaze B2</span>
                  <Badge
                    className={
                      storageConfig?.configured
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {storageConfig?.configured ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage & Upload Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Upload Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disk Usage</span>
                    <span className="font-medium">
                      {systemStats.usedStorage || '—'} / {systemStats.totalStorage || '—'}
                    </span>
                  </div>
                  <Progress value={systemStats.storageUsage || 0} className="h-2" />
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {systemStats.storageUsage || 0}% used · {systemStats.availableStorage || '—'} free
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Upload Storage</span>
                    <span className="font-medium">{systemStats.totalUploadSize || '0 Bytes'}</span>
                  </div>
                  <Progress value={systemStats.uploadStorageUsage || 0} className="h-2" />
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {systemStats.uploadStorageUsage || 0}% of disk · {systemStats.totalFiles || 0} files
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg File Size</span>
                    <span className="font-medium">{systemStats.avgUploadSize || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              (() => {
                const alerts = [];

                if (systemStats.diskHealthStatus === 'critical') {
                  alerts.push({
                    type: 'error',
                    icon: AlertTriangle,
                    message: `Storage critically full at ${systemStats.storageUsage}%`,
                  });
                } else if (systemStats.diskHealthStatus === 'warning') {
                  alerts.push({
                    type: 'warning',
                    icon: AlertTriangle,
                    message: `Storage usage at ${systemStats.storageUsage}%`,
                  });
                }

                if (systemStats.failedUploads > 0) {
                  alerts.push({
                    type: 'error',
                    icon: AlertCircle,
                    message: `${systemStats.failedUploads} failed upload${
                      systemStats.failedUploads !== 1 ? 's' : ''
                    } require attention`,
                  });
                }

                if (systemStats.activeUploads > 0) {
                  alerts.push({
                    type: 'info',
                    icon: Upload,
                    message: `${systemStats.activeUploads} upload${
                      systemStats.activeUploads !== 1 ? 's' : ''
                    } in progress`,
                  });
                }

                if (monitoringData.processingQueue.length > 0) {
                  alerts.push({
                    type: 'info',
                    icon: Brain,
                    message: `${monitoringData.processingQueue.length} file${
                      monitoringData.processingQueue.length !== 1 ? 's' : ''
                    } in AI processing queue`,
                  });
                }

                if (alerts.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                      <p className="text-sm">All systems normal</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {alerts.map((alert, idx) => (
                      <Alert
                        key={idx}
                        className={
                          alert.type === 'error'
                            ? 'border-red-200 bg-red-50'
                            : alert.type === 'warning'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-blue-200 bg-blue-50'
                        }
                      >
                        <alert.icon
                          className={`h-4 w-4 ${
                            alert.type === 'error'
                              ? 'text-red-600'
                              : alert.type === 'warning'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Type Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">File Distribution</CardTitle>
          <CardDescription>Breakdown of uploaded files by type</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                {
                  label: 'Videos',
                  count: systemStats.videoFiles,
                  icon: FileVideo,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50 border-purple-100',
                },
                {
                  label: 'Documents',
                  count: systemStats.documentFiles,
                  icon: FolderOpen,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50 border-blue-100',
                },
                {
                  label: 'Archives',
                  count: systemStats.archiveFiles,
                  icon: Archive,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50 border-amber-100',
                },
                {
                  label: 'Other',
                  count: systemStats.otherFiles,
                  icon: HardDrive,
                  color: 'text-gray-600',
                  bg: 'bg-gray-50 border-gray-100',
                },
                {
                  label: 'Total',
                  count: systemStats.totalFiles,
                  icon: Database,
                  color: 'text-green-600',
                  bg: 'bg-green-50 border-green-100',
                },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-lg border ${item.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count || 0}</p>
                  {systemStats.totalFiles > 0 && item.label !== 'Total' && (
                    <p className="text-[11px] text-gray-400">
                      {((item.count / systemStats.totalFiles) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Monthly Uploads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.monthlyUploads || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{systemStats.completedUploads || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{systemStats.failedUploads || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Uploads & Processing */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Uploads & Processing</CardTitle>
              <CardDescription>Real-time monitoring of file operations</CardDescription>
            </div>
            {(monitoringData.activeUploads.length > 0 || monitoringData.processingQueue.length > 0) && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {monitoringData.activeUploads.length + monitoringData.processingQueue.length} active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {monitoringLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : monitoringData.activeUploads.length === 0 && monitoringData.processingQueue.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No active uploads or processing</p>
              <p className="text-sm text-gray-400 mt-1">
                Files will appear here when uploading or being processed by AI
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {monitoringData.activeUploads.map((upload) => (
                <div
                  key={upload._id}
                  className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">{getFileTypeIcon(upload.type)}</div>
                    <div>
                      <h4 className="font-medium text-sm">{upload.originalName}</h4>
                      <p className="text-xs text-gray-500">
                        {typeof upload.uploadedBy === 'object'
                          ? upload.uploadedBy?.email
                          : upload.uploadedBy}{' '}
                        · {upload.size} · {upload.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">Uploading</Badge>
                  </div>
                </div>
              ))}

              {monitoringData.processingQueue.map((upload) => (
                <div
                  key={upload._id}
                  className="flex items-center justify-between p-4 border border-purple-100 bg-purple-50/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{upload.originalName}</h4>
                      <p className="text-xs text-gray-500">
                        AI processing · {upload.processingStatus || 'pending'} · {upload.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">Processing</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Errors & Issues</CardTitle>
              <CardDescription>Failed uploads and processing errors</CardDescription>
            </div>
            {monitoringData.errors.length > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {monitoringData.errors.length} error{monitoringData.errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {monitoringLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-red-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : monitoringData.errors.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium">No recent errors</p>
              <p className="text-sm text-gray-400 mt-1">All uploads have been processed successfully</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monitoringData.errors.map((upload) => (
                <div
                  key={upload._id}
                  className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-red-900 truncate">{upload.originalName}</h4>
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] ml-2 flex-shrink-0">
                        Failed
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700 mt-0.5">
                      {upload.processingError || 'Upload failed — unknown error'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-red-500">
                      <span>
                        {typeof upload.uploadedBy === 'object'
                          ? upload.uploadedBy?.email
                          : upload.uploadedBy}
                      </span>
                      <span>·</span>
                      <span>{upload.size}</span>
                      <span>·</span>
                      <span>{new Date(upload.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default MonitoringTab;
