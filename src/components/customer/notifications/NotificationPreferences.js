'use client';

import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationPreferences = ({ preferences, onToggle }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="flex flex-col">
              <span>Email Notifications</span>
              <span className="text-xs text-muted-foreground">Receive emails for alerts</span>
            </Label>
            <Switch
              id="email"
              checked={preferences.email}
              onCheckedChange={() => onToggle('email')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push" className="flex flex-col">
              <span>Push Notifications</span>
              <span className="text-xs text-muted-foreground">Browser notifications</span>
            </Label>
            <Switch
              id="push"
              checked={preferences.push}
              onCheckedChange={() => onToggle('push')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="report-ready" className="text-sm">
              New Reports Ready
            </Label>
            <Switch
              id="report-ready"
              checked={preferences.reportReady}
              onCheckedChange={() => onToggle('reportReady')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="ai-complete" className="text-sm">
              AI Processing Complete
            </Label>
            <Switch
              id="ai-complete"
              checked={preferences.aiComplete}
              onCheckedChange={() => onToggle('aiComplete')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="status-update" className="text-sm">
              Project Status Updates
            </Label>
            <Switch
              id="status-update"
              checked={preferences.statusUpdate}
              onCheckedChange={() => onToggle('statusUpdate')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="qc-review" className="text-sm">
              QC Review Updates
            </Label>
            <Switch
              id="qc-review"
              checked={preferences.qcReview}
              onCheckedChange={() => onToggle('qcReview')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="defect-found" className="text-sm">
              Defect Alerts
            </Label>
            <Switch
              id="defect-found"
              checked={preferences.defectFound}
              onCheckedChange={() => onToggle('defectFound')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
