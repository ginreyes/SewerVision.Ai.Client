'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Archive,
  HardDrive,
  Server,
  RefreshCw,
  FolderOpen,
  Loader2,
  Cloud,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
  Database,
  ArrowRightLeft,
  Eye,
  EyeOff,
  PlayCircle,
  StopCircle,
  Clock,
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
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useStorageConfig,
  useStorageUsage,
  useUpdateStorageConfig,
  useTestStorageConfig,
  useStartMigration,
  useCancelMigration,
  useMigrationStatus,
} from '@/hooks/useQueryHooks';
import MigrationProgressModal from '@/components/admin/uploads/MigrationProgressModal';
import { useSyncContext } from '@/components/providers/SyncContext';

const PROVIDER_LABELS = {
  b2: 'Backblaze B2',
  s3: 'Amazon S3',
  dual: 'Dual-Write (Both)',
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Admin storage tab: provider selection, S3 credential form, per-provider usage,
 * and backup/migration controls. Wired to TanStack hooks.
 *
 * Parent still passes legacy props (systemStats, loading, etc.) used by the
 * analytics + retention sections lower on the page — preserved for compatibility.
 */
const StorageTab = ({ systemStats = {}, loading = false }) => {
  const { data: config, isLoading: configLoading, refetch: refetchConfig } = useStorageConfig();
  const { data: usage, isLoading: usageLoading, refetch: refetchUsage } = useStorageUsage();

  const updateConfig = useUpdateStorageConfig();
  const testConfig = useTestStorageConfig();
  const startMigration = useStartMigration();
  const cancelMigration = useCancelMigration();
  const { setActiveJobId: setGlobalJobId } = useSyncContext();

  // Form state — init from remote config on first load
  const [providerMode, setProviderMode] = useState(null);
  const [primaryRead, setPrimaryRead] = useState(null);
  const [s3Form, setS3Form] = useState({
    bucket: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '',
  });
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Hydrate form from server config once it loads
  React.useEffect(() => {
    if (!config) return;
    if (providerMode === null) {
      setProviderMode(config.active || 'b2');
      setPrimaryRead(config.primaryRead || 'b2');
      const s3 = config.providers?.s3 || {};
      setS3Form({
        bucket: s3.bucketName || '',
        region: s3.region || 'us-east-1',
        accessKeyId: '', // never prefill masked value — user re-enters to rotate
        secretAccessKey: '',
        endpoint: s3.endpoint || '',
      });
    }
  }, [config, providerMode]);

  // Migration modal
  const [activeJobId, setActiveJobId] = useState(null);
  const [migrationDirection, setMigrationDirection] = useState('b2-to-s3');

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const result = await testConfig.mutateAsync({
        bucket: s3Form.bucket,
        region: s3Form.region,
        accessKeyId: s3Form.accessKeyId,
        secretAccessKey: s3Form.secretAccessKey,
        endpoint: s3Form.endpoint || undefined,
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, error: err?.message || 'Connection failed' });
    }
  };

  const handleSave = async () => {
    setSaveMessage(null);
    setConfirmOpen(false);
    try {
      await updateConfig.mutateAsync({
        provider: providerMode,
        primaryRead,
        s3: {
          bucket: s3Form.bucket,
          region: s3Form.region,
          // Only send key IDs if user typed a new one; empty string = keep existing
          accessKeyId: s3Form.accessKeyId,
          secretAccessKey: s3Form.secretAccessKey,
          endpoint: s3Form.endpoint,
        },
      });
      setSaveMessage({ type: 'success', text: 'Storage configuration saved.' });
      refetchConfig();
      refetchUsage();
    } catch (err) {
      setSaveMessage({ type: 'error', text: err?.message || 'Failed to save.' });
    }
  };

  // Provider switches are the dangerous case (single → single with no migration
  // can strand files). Route those through a confirm; everything else (creds-only
  // edits or no-op saves) goes straight through.
  const providerSwitchPending = config && providerMode !== config.active;
  const handleSaveClick = () => {
    if (providerSwitchPending) {
      setConfirmOpen(true);
    } else {
      handleSave();
    }
  };

  const lastTest = config?.lastTest || null;

  const handleStartMigration = async () => {
    try {
      const res = await startMigration.mutateAsync(migrationDirection);
      setActiveJobId(res.jobId);
      // Register globally so the floating bubble shows up on every page
      setGlobalJobId(res.jobId);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err?.message || 'Failed to start backup.' });
    }
  };

  const b2Usage = usage?.b2;
  const s3Usage = usage?.s3;

  const dirty = useMemo(() => {
    if (!config) return false;
    if (providerMode !== config.active) return true;
    if (primaryRead !== config.primaryRead) return true;
    const s3 = config.providers?.s3 || {};
    if (s3Form.bucket !== (s3.bucketName || '')) return true;
    if (s3Form.region !== (s3.region || 'us-east-1')) return true;
    if (s3Form.endpoint !== (s3.endpoint || '')) return true;
    if (s3Form.accessKeyId) return true;
    if (s3Form.secretAccessKey) return true;
    return false;
  }, [config, providerMode, primaryRead, s3Form]);

  return (
    <TabsContent value="storage" className="space-y-6">
      {/* ───────────────── Active Provider Card ───────────────── */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Cloud Storage Provider</CardTitle>
                <CardDescription>
                  Choose which storage backend powers new uploads. Existing files keep serving from
                  wherever they were originally written.
                </CardDescription>
              </div>
            </div>
            {config && (
              <div className="flex items-center gap-2">
                {lastTest ? (
                  <Badge
                    className={
                      lastTest.ok
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border-rose-200'
                    }
                    title={
                      lastTest.ok
                        ? `Last test passed against ${lastTest.bucket || '(bucket)'} in ${lastTest.region || '(region)'} at ${new Date(lastTest.testedAt).toLocaleString()}`
                        : `Last test failed: ${lastTest.error || 'unknown error'}`
                    }
                  >
                    {lastTest.ok ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {lastTest.ok ? 'Credentials OK' : 'Credentials FAIL'}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200" title="No credential test has been run yet">
                    Never tested
                  </Badge>
                )}
                <Badge
                  className={
                    providerMode === 'dual'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : providerMode === 's3'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }
                >
                  {PROVIDER_LABELS[providerMode] || 'Loading...'}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {configLoading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading storage configuration...</span>
            </div>
          ) : (
            <>
              {/* Provider mode + primary read */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Active Provider</Label>
                  <Select
                    value={providerMode || 'b2'}
                    onValueChange={setProviderMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2">Backblaze B2</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="dual">Dual-write (both)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-400">
                    <strong>Dual-write</strong> uploads every new file to both providers for safety.
                  </p>
                </div>

                {providerMode === 'dual' && (
                  <div className="space-y-2">
                    <Label>Primary Read Source</Label>
                    <Select value={primaryRead || 'b2'} onValueChange={setPrimaryRead}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="b2">Backblaze B2</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-gray-400">
                      Which provider dual-written files report as their canonical source.
                    </p>
                  </div>
                )}
              </div>

              {/* S3 credentials form */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-md">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">Amazon S3 Credentials</h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      config?.providers?.s3?.configured
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-gray-300 text-gray-500'
                    }
                  >
                    {config?.providers?.s3?.configured ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Configured</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Not configured</>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Bucket Name</Label>
                    <Input
                      placeholder="sewervision"
                      value={s3Form.bucket}
                      onChange={(e) => setS3Form((f) => ({ ...f, bucket: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Region</Label>
                    <Input
                      placeholder="us-east-1"
                      value={s3Form.region}
                      onChange={(e) => setS3Form((f) => ({ ...f, region: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Access Key ID
                      {config?.providers?.s3?.accessKeyId && (
                        <span className="text-gray-400 ml-2">
                          (current: {config.providers.s3.accessKeyId})
                        </span>
                      )}
                    </Label>
                    <Input
                      placeholder="AKIA..."
                      value={s3Form.accessKeyId}
                      onChange={(e) => setS3Form((f) => ({ ...f, accessKeyId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Secret Access Key</Label>
                    <div className="relative">
                      <Input
                        type={showSecret ? 'text' : 'password'}
                        placeholder={
                          config?.providers?.s3?.secretConfigured
                            ? '•••••••• (leave blank to keep)'
                            : 'paste your secret'
                        }
                        value={s3Form.secretAccessKey}
                        onChange={(e) => setS3Form((f) => ({ ...f, secretAccessKey: e.target.value }))}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Endpoint <span className="text-gray-400">(optional)</span></Label>
                    <Input
                      placeholder="Leave empty for standard AWS"
                      value={s3Form.endpoint}
                      onChange={(e) => setS3Form((f) => ({ ...f, endpoint: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Test result */}
                {testResult && (
                  <Alert
                    className={
                      testResult.ok
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }
                  >
                    {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <AlertDescription>
                      {testResult.ok
                        ? 'Connection successful — credentials validated against the bucket.'
                        : `Test failed: ${testResult.error || 'unknown error'}`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testConfig.isPending || !s3Form.bucket || !s3Form.accessKeyId || !s3Form.secretAccessKey}
                  >
                    {testConfig.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveClick}
                    disabled={!dirty || updateConfig.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateConfig.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  {saveMessage && (
                    <span
                      className={`text-xs ${saveMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {saveMessage.text}
                    </span>
                  )}
                </div>
              </div>

              {/* B2 read-only box */}
              <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-800">Backblaze B2 (read-only)</h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      config?.providers?.b2?.configured
                        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                        : 'border-gray-300 text-gray-500'
                    }
                  >
                    {config?.providers?.b2?.configured ? 'Connected' : 'Not configured'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Bucket</p>
                    <p className="font-medium text-gray-700 truncate">{config?.providers?.b2?.bucketName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Region</p>
                    <p className="font-medium text-gray-700">{config?.providers?.b2?.region || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Key ID</p>
                    <p className="font-mono text-[11px] text-gray-700">{config?.providers?.b2?.keyId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Endpoint</p>
                    <p className="font-mono text-[11px] text-gray-700 truncate">{config?.providers?.b2?.endpoint || '—'}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  B2 credentials are managed via environment variables — update them in the server&apos;s{' '}
                  <code className="px-1 py-0.5 bg-gray-100 rounded">.env</code> file.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ───────────────── Per-provider Usage ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProviderUsageCard
          title="Backblaze B2"
          usage={b2Usage}
          loading={usageLoading}
          color="blue"
          onRefresh={refetchUsage}
        />
        <ProviderUsageCard
          title="Amazon S3"
          usage={s3Usage}
          loading={usageLoading}
          color="amber"
          onRefresh={refetchUsage}
        />
      </div>

      {/* ───────────────── Backup / Migration ───────────────── */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/40 to-indigo-50/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Backup &amp; Migration</CardTitle>
              <CardDescription>
                Copy all files from one provider to the other. Safe to re-run — already-copied
                files are skipped automatically.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs">Direction</Label>
              <Select value={migrationDirection} onValueChange={setMigrationDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2-to-s3">Backblaze B2 → Amazon S3</SelectItem>
                  <SelectItem value="s3-to-b2">Amazon S3 → Backblaze B2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleStartMigration}
              disabled={startMigration.isPending || !config?.providers?.b2?.configured || !config?.providers?.s3?.configured}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {startMigration.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4 mr-2" />
              )}
              Start Backup
            </Button>
          </div>

          {(!config?.providers?.b2?.configured || !config?.providers?.s3?.configured) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Both providers must be configured before you can run a backup.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ───────────────── Legacy analytics sections (unchanged) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {[
                  { label: 'Video Files', count: systemStats.videoFiles || 0 },
                  { label: 'Documents', count: systemStats.documentFiles || 0 },
                  { label: 'Archives', count: systemStats.archiveFiles || 0 },
                  { label: 'Other', count: systemStats.otherFiles || 0 },
                ].map((row) => {
                  const total = systemStats.totalFiles || 1;
                  return (
                    <div key={row.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{row.label}</span>
                        <span className="text-sm text-gray-600">{row.count} files</span>
                      </div>
                      <Progress value={(row.count / total) * 100} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Migration progress modal */}
      {activeJobId && (
        <MigrationProgressModal
          jobId={activeJobId}
          onClose={() => {
            setActiveJobId(null);
            refetchUsage();
          }}
          onCancel={() => cancelMigration.mutate(activeJobId)}
        />
      )}

      {/* June 10: confirm dialog for provider switches — avoids an accidental
          flip that could strand files on the previous provider. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Switch storage provider?
            </DialogTitle>
            <DialogDescription>
              You're about to change the active provider from{' '}
              <span className="font-semibold">{config?.active}</span> to{' '}
              <span className="font-semibold">{providerMode}</span>.
              Existing files keep serving from wherever they were originally written —
              but new uploads will go to the new provider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            {lastTest ? (
              <div
                className={`flex items-start gap-2 p-3 rounded-md border ${
                  lastTest.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {lastTest.ok ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    Last credential test: {lastTest.ok ? 'PASSED' : 'FAILED'}
                  </p>
                  <p className="text-xs mt-0.5 opacity-90">
                    Tested {new Date(lastTest.testedAt).toLocaleString()}
                    {lastTest.bucket ? ` against bucket ${lastTest.bucket}` : ''}
                  </p>
                  {!lastTest.ok && lastTest.error && (
                    <p className="text-xs mt-1 font-mono break-all">{lastTest.error}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-md border bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  No credential test has been recorded. Consider clicking{' '}
                  <span className="font-medium">Test Connection</span> before saving so you can verify
                  the credentials work on the new provider.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              If you've already migrated files to the new provider, you can ignore this. Otherwise
              consider starting a migration before flipping the active provider.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className={
                lastTest?.ok === false
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            >
              Switch to {providerMode}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

/**
 * Usage card for one provider — handles loading, empty, and populated states.
 */
function ProviderUsageCard({ title, usage, loading, color = 'blue', onRefresh }) {
  const accent = {
    blue: { border: 'border-blue-200', bg: 'bg-blue-50/40', icon: 'text-blue-500', dot: 'bg-blue-500' },
    amber: { border: 'border-amber-200', bg: 'bg-amber-50/40', icon: 'text-amber-500', dot: 'bg-amber-500' },
  }[color] || {};

  return (
    <Card className={`${accent.border} ${accent.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
            <CardTitle className="text-base">{title} Usage</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : !usage ? (
          <p className="text-sm text-gray-400 italic">
            Not configured — add credentials above to see usage.
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-gray-900">{usage.totalFormatted}</span>
              <span className="text-xs text-gray-500">
                {usage.fileCount.toLocaleString()} files
              </span>
            </div>
            {usage.byPrefix && Object.keys(usage.byPrefix).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(usage.byPrefix)
                  .sort(([, a], [, b]) => b.bytes - a.bytes)
                  .slice(0, 6)
                  .map(([prefix, info]) => {
                    const pct = usage.totalBytes > 0
                      ? ((info.bytes / usage.totalBytes) * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={prefix} className="p-2 bg-white rounded border border-gray-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          <FolderOpen className={`w-3 h-3 ${accent.icon}`} />
                          <span className="font-medium text-gray-700 truncate">{prefix}</span>
                        </div>
                        <p className="font-semibold text-gray-900 mt-0.5">{info.formatted}</p>
                        <p className="text-[10px] text-gray-400">{info.count} files · {pct}%</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StorageTab;
