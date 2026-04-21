'use client';

import React from 'react';
import {
  AlertTriangle,
  Archive,
  HardDrive,
  Server,
  RefreshCw,
  FolderOpen,
  Loader2,
  Cloud,
  Globe,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import uploadsApi from '@/data/uploadsApi';

const StorageTab = ({
  storageConfig,
  storageConfigLoading,
  storageUsage,
  storageUsageLoading,
  setStorageUsage,
  setStorageUsageLoading,
  systemStats,
  loading,
}) => {
  return (
    <TabsContent value="storage" className="space-y-6">
      {/* Cloud Storage Provider */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Cloud Storage Provider</CardTitle>
                <CardDescription>Active storage backend configuration</CardDescription>
              </div>
            </div>
            {storageConfig && (
              <Badge
                className={
                  storageConfig.configured
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }
              >
                {storageConfig.configured ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" /> Not Configured
                  </>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {storageConfigLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : storageConfig ? (
            <div className="space-y-5">
              {/* Provider Header */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <img
                  src="https://www.backblaze.com/favicon.ico"
                  alt="Backblaze"
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900">{storageConfig.providerName}</p>
                  <p className="text-xs text-gray-500">S3-Compatible Cloud Object Storage</p>
                </div>
                {storageConfig.s3Compatible && (
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-indigo-50 text-indigo-600 border-indigo-200"
                  >
                    S3 Compatible
                  </Badge>
                )}
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Database className="w-3 h-3" /> Bucket Name
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                    {storageConfig.bucketName || '—'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Globe className="w-3 h-3" /> Region
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                    {storageConfig.region || '—'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Server className="w-3 h-3" /> S3 Endpoint
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 truncate">
                    {storageConfig.endpoint || '—'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Key className="w-3 h-3" /> Application Key ID
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                    {storageConfig.keyId || '—'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <HardDrive className="w-3 h-3" /> Bucket ID
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                    {storageConfig.bucketId || '—'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <ShieldCheck className="w-3 h-3" /> Application Key
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                    ••••••••••••••••
                  </div>
                </div>
              </div>

              {/* Storage Usage Section */}
              <div className="mt-5 pt-5 border-t border-blue-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  Bucket Storage Usage
                </h4>
                {storageUsageLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : storageUsage ? (
                  <div className="space-y-4">
                    {/* Total Usage Summary */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{storageUsage.totalFormatted}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          across {storageUsage.fileCount.toLocaleString()} files
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            setStorageUsageLoading(true);
                            const usage = await uploadsApi.getStorageUsage();
                            setStorageUsage(usage);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setStorageUsageLoading(false);
                          }
                        }}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh
                      </Button>
                    </div>

                    {/* Breakdown by Folder/Prefix */}
                    {storageUsage.byPrefix && Object.keys(storageUsage.byPrefix).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(storageUsage.byPrefix)
                          .sort(([, a], [, b]) => b.bytes - a.bytes)
                          .map(([prefix, info]) => {
                            const percentage =
                              storageUsage.totalBytes > 0
                                ? ((info.bytes / storageUsage.totalBytes) * 100).toFixed(1)
                                : 0;
                            return (
                              <div
                                key={prefix}
                                className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <FolderOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                  <span className="text-xs font-semibold text-gray-700 capitalize truncate">
                                    {prefix}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{info.formatted}</p>
                                <p className="text-[11px] text-gray-400">
                                  {info.count} files · {percentage}%
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Unable to load storage usage</p>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Credentials are configured via environment variables. Contact your system administrator to update storage settings.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Cloud className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Unable to load storage configuration</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Video Files</span>
                  <span className="text-sm text-gray-600">{systemStats.videoFiles} files</span>
                </div>
                <Progress
                  value={
                    systemStats.videoFiles > 0
                      ? (systemStats.videoFiles / systemStats.totalFiles) * 100
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Documents</span>
                  <span className="text-sm text-gray-600">{systemStats.documentFiles} files</span>
                </div>
                <Progress
                  value={
                    systemStats.documentFiles > 0
                      ? (systemStats.documentFiles / systemStats.totalFiles) * 100
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Archives</span>
                  <span className="text-sm text-gray-600">{systemStats.archiveFiles} files</span>
                </div>
                <Progress
                  value={
                    systemStats.archiveFiles > 0
                      ? (systemStats.archiveFiles / systemStats.totalFiles) * 100
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Other</span>
                  <span className="text-sm text-gray-600">{systemStats.otherFiles} files</span>
                </div>
                <Progress
                  value={
                    systemStats.otherFiles > 0
                      ? (systemStats.otherFiles / systemStats.totalFiles) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStats.storageUsage > 70 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Storage is {systemStats.storageUsage}% full. Consider archiving old files or expanding storage.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="w-4 h-4 mr-2" />
                Archive files older than 1 year
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Clean up temporary files
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HardDrive className="w-4 h-4 mr-2" />
                Optimize storage compression
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Server className="w-4 h-4 mr-2" />
                Expand storage capacity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Policies</CardTitle>
          <CardDescription>Manage automatic file retention and cleanup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Video Files</Label>
              <Select defaultValue="2years">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Documents</Label>
              <Select defaultValue="5years">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>System Backups</Label>
              <Select defaultValue="6months">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default StorageTab;
