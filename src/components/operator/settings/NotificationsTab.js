"use client";

import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SectionHeader, ToggleSetting } from './SettingsUI';

const NotificationsTab = ({ settings, updateSetting }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <SectionHeader icon={Bell} title="Notification Preferences" description="Manage how and when you want to be notified" />
    </CardHeader>
    <CardContent className="divide-y divide-gray-100">
      <ToggleSetting label="Sound Alerts" description="Play sound for high-priority alerts"
        checked={settings.soundEnabled} onCheckedChange={(c) => updateSetting('soundEnabled', c)} />
      <ToggleSetting label="Email Notifications" description="Receive daily summaries and critical alerts via email"
        checked={settings.emailAlerts} onCheckedChange={(c) => updateSetting('emailAlerts', c)} />
      <ToggleSetting label="Upload Completed" description="Notify when large file uploads are successfully processed"
        checked={settings.notifyUploadComplete} onCheckedChange={(c) => updateSetting('notifyUploadComplete', c)} />
      <ToggleSetting label="New Assignments" description="Notify when a new inspection task is assigned to you"
        checked={settings.notifyNewAssignment} onCheckedChange={(c) => updateSetting('notifyNewAssignment', c)} />
    </CardContent>
  </Card>
);

export default NotificationsTab;
