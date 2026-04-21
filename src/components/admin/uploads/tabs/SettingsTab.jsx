'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
import { TabsContent } from '@/components/ui/tabs';

const SettingsTab = ({ uploadSettings, setUploadSettings, loading, onSave }) => {
  return (
    <TabsContent value="settings" className="space-y-6">
      {/* Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
          <CardDescription>Configure upload limits and processing settings</CardDescription>
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

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Access Control</CardTitle>
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

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
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

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect all system data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">Clear All Upload Cache</h4>
              <p className="text-sm text-red-700">Remove all temporary and cached files</p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Cache
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">Reset All Upload Statistics</h4>
              <p className="text-sm text-red-700">Clear all upload history and analytics</p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Stats
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">Emergency Stop All Uploads</h4>
              <p className="text-sm text-red-700">Immediately halt all active upload processes</p>
            </div>
            <Button variant="destructive" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsTab;
