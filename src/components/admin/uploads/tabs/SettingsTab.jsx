'use client';

import React from 'react';
import {
  AlertTriangle,
  Loader2,
  Cloud,
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Flame,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Database,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { useStorageConfig } from '@/hooks/useQueryHooks';

const PROVIDER_LABEL = {
  b2: 'Backblaze B2',
  s3: 'Amazon S3',
  dual: 'Dual-Write (both)',
};

const PROVIDER_BADGE = {
  b2: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  s3: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  dual: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
};

/**
 * Reusable section header with icon badge — matches the visual language of
 * StorageTab and admin/users module headers.
 */
function SectionHeader({ icon: Icon, title, description, accent = 'blue' }) {
  const accentMap = {
    blue:   { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
    emerald:{ bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
    amber:  { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400' },
    rose:   { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400' },
    red:    { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400' },
  }[accent] || { bg: 'bg-blue-100', text: 'text-blue-600' };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${accentMap.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${accentMap.text}`} />
      </div>
      <div>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
      </div>
    </div>
  );
}

const SettingsTab = ({ uploadSettings, setUploadSettings, loading, onSave, onNavigateToStorage }) => {
  const { data: storageConfig, isLoading: storageLoading } = useStorageConfig();

  const activeProvider = storageConfig?.active || null;
  const primaryRead = storageConfig?.primaryRead || null;
  const s3 = storageConfig?.providers?.s3;
  const b2 = storageConfig?.providers?.b2;
  const providerLabel = activeProvider ? PROVIDER_LABEL[activeProvider] : 'Loading...';
  const providerBadgeClass = activeProvider ? PROVIDER_BADGE[activeProvider] : 'bg-gray-100 text-gray-600';

  // Resolve the bucket name + configured status for the "primary" read provider
  const primarySummary = (() => {
    if (!storageConfig) return null;
    if (activeProvider === 's3') {
      return { label: 'Amazon S3', bucket: s3?.bucketName, configured: s3?.configured, region: s3?.region };
    }
    if (activeProvider === 'dual') {
      return primaryRead === 's3'
        ? { label: 'Amazon S3', bucket: s3?.bucketName, configured: s3?.configured, region: s3?.region }
        : { label: 'Backblaze B2', bucket: b2?.bucketName, configured: b2?.configured, region: b2?.region };
    }
    return { label: 'Backblaze B2', bucket: b2?.bucketName, configured: b2?.configured, region: b2?.region };
  })();

  return (
    <TabsContent value="settings" className="space-y-6">
      {/* ── Active Storage Indicator ─────────────────────────────────── */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/60 to-indigo-50/50 dark:from-blue-500/5 dark:to-indigo-500/5 dark:border-blue-500/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
                <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Active storage destination
                  </h3>
                  {!storageLoading && (
                    <Badge className={`${providerBadgeClass} border`}>{providerLabel}</Badge>
                  )}
                </div>
                {storageLoading ? (
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
                ) : primarySummary ? (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    New uploads land in{' '}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {primarySummary.label}
                    </span>
                    {primarySummary.bucket && (
                      <> · bucket <code className="px-1 py-0.5 bg-white/80 dark:bg-gray-800/80 rounded text-[11px] font-mono">{primarySummary.bucket}</code></>
                    )}
                    {primarySummary.region && <> · region {primarySummary.region}</>}
                    {activeProvider === 'dual' && (
                      <>
                        {' '}· also mirrored to{' '}
                        <span className="font-medium">
                          {primaryRead === 's3' ? 'Backblaze B2' : 'Amazon S3'}
                        </span>
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Storage configuration unavailable.</p>
                )}
                {primarySummary && (
                  <div className="flex items-center gap-2 mt-2">
                    {primarySummary.configured ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                        <XCircle className="w-3 h-3" />
                        Not connected
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {onNavigateToStorage && (
              <Button variant="outline" size="sm" onClick={onNavigateToStorage} className="gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                Change in Storage tab
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Upload Configuration ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={SettingsIcon}
            title="Upload Configuration"
            description="Limits and automatic processing applied to every new upload."
            accent="blue"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Maximum File Size</Label>
              <Select
                value={uploadSettings.maxFileSize}
                onValueChange={(val) => setUploadSettings((s) => ({ ...s, maxFileSize: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1gb">1 GB</SelectItem>
                  <SelectItem value="2gb">2 GB</SelectItem>
                  <SelectItem value="5gb">5 GB</SelectItem>
                  <SelectItem value="10gb">10 GB</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Concurrent Uploads</Label>
              <Select
                value={uploadSettings.concurrentUploads}
                onValueChange={(val) => setUploadSettings((s) => ({ ...s, concurrentUploads: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Auto AI Processing</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.autoAiProcessing}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, autoAiProcessing: val }))}
                />
                <span className="text-sm">Enable automatic AI processing for video uploads</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Auto Backup</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.autoBackup}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, autoBackup: val }))}
                />
                <span className="text-sm">Create automatic backups of uploaded files</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Security ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={ShieldCheck}
            title="Security & Access Control"
            description="Protection applied to stored files and access tracking."
            accent="emerald"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>File Encryption</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.fileEncryption}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, fileEncryption: val }))}
                />
                <span className="text-sm">Encrypt files at rest</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Virus Scanning</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.virusScanning}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, virusScanning: val }))}
                />
                <span className="text-sm">Scan uploads for malware</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Access Logging</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.accessLogging}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, accessLogging: val }))}
                />
                <span className="text-sm">Log all file access and downloads</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Public Access</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={uploadSettings.publicAccess}
                  onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, publicAccess: val }))}
                />
                <span className="text-sm">Allow public file sharing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Notifications ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Bell}
            title="Notifications"
            description="When the system should send alerts about upload events."
            accent="amber"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Upload Completion</Label>
                <p className="text-sm text-gray-500">Notify when uploads complete</p>
              </div>
              <Checkbox
                checked={uploadSettings.notifyCompletion}
                onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, notifyCompletion: val }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Storage Warnings</Label>
                <p className="text-sm text-gray-500">Alert when storage is running low</p>
              </div>
              <Checkbox
                checked={uploadSettings.notifyStorage}
                onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, notifyStorage: val }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Failed Uploads</Label>
                <p className="text-sm text-gray-500">Immediate notification of upload failures</p>
              </div>
              <Checkbox
                checked={uploadSettings.notifyFailed}
                onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, notifyFailed: val }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>System Maintenance</Label>
                <p className="text-sm text-gray-500">Scheduled maintenance notifications</p>
              </div>
              <Checkbox
                checked={uploadSettings.notifyMaintenance}
                onCheckedChange={(val) => setUploadSettings((s) => ({ ...s, notifyMaintenance: val }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-8">
        <Button onClick={onSave} disabled={loading} size="lg" className="px-8">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────── */}
      <Card className="border-red-200 dark:border-red-500/30">
        <CardHeader>
          <SectionHeader
            icon={Flame}
            title="Danger Zone"
            description="Irreversible actions that affect all system data."
            accent="red"
          />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-500/30 rounded-lg bg-red-50/30 dark:bg-red-500/5">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-300">Clear All Upload Cache</h4>
              <p className="text-sm text-red-700 dark:text-red-400/80">Remove all temporary and cached files</p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Cache
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-500/30 rounded-lg bg-red-50/30 dark:bg-red-500/5">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-300">Reset All Upload Statistics</h4>
              <p className="text-sm text-red-700 dark:text-red-400/80">Clear all upload history and analytics</p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Stats
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-500/30 rounded-lg bg-red-50/30 dark:bg-red-500/5">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-300">Emergency Stop All Uploads</h4>
              <p className="text-sm text-red-700 dark:text-red-400/80">Immediately halt all active upload processes</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Stop
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsTab;
