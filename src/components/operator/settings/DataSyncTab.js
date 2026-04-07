"use client";

import { HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHeader, ToggleSetting } from './SettingsUI';

const DataSyncTab = ({ settings, updateSetting }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <SectionHeader icon={HardDrive} title="Data Management" description="Configure how inspection data is stored and synced" />
    </CardHeader>
    <CardContent className="divide-y divide-gray-100">
      <ToggleSetting label="Automatic Upload" description="Upload inspection footage immediately after completion when online"
        checked={settings.autoUpload} onCheckedChange={(c) => updateSetting('autoUpload', c)} />
      <ToggleSetting label="GPS Tagging" description="Embed high-accuracy GPS coordinates in all media"
        checked={settings.gpsTagging} onCheckedChange={(c) => updateSetting('gpsTagging', c)} />
      <ToggleSetting label="Offline Mode" description="Download maps and assignments for offline use (Uses more storage)"
        checked={settings.offlineMode} onCheckedChange={(c) => updateSetting('offlineMode', c)} />
      <ToggleSetting label="Sync Only on Wi-Fi" description="Prevent cellular data usage for large file uploads"
        checked={settings.autoSyncWiFi} onCheckedChange={(c) => updateSetting('autoSyncWiFi', c)} />
    </CardContent>
  </Card>
);

export default DataSyncTab;
