'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSendTestNotification } from '@/hooks/useQueryHooks';

const NotificationPreferences = ({ preferences, onToggle, userId }) => {
  const sendTest = useSendTestNotification();
  const [lastResult, setLastResult] = useState(null);

  const handleSendTest = async () => {
    if (!userId) return;
    try {
      const res = await sendTest.mutateAsync(userId);
      setLastResult({ ok: true, delivered: res?.delivered, hint: res?.hint });
    } catch (err) {
      setLastResult({ ok: false, error: err?.message || 'Test failed' });
    }
  };
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" />
            Verify your settings
          </CardTitle>
          <CardDescription className="text-xs">
            Send a test notification to confirm your current preferences let it through.
            If you've toggled push off or set a snooze, the test will report that it was suppressed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendTest}
            disabled={sendTest.isPending || !userId}
            className="gap-1.5"
          >
            {sendTest.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send test notification
          </Button>

          {lastResult && (
            <div
              className={`flex items-start gap-2 p-2.5 rounded-md text-xs border ${
                lastResult.ok && lastResult.delivered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : lastResult.ok
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {lastResult.ok && lastResult.delivered ? (
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <div>
                {lastResult.ok ? (
                  lastResult.delivered ? (
                    <p>Test notification delivered. Check your inbox above.</p>
                  ) : (
                    <p>{lastResult.hint || 'Notification was suppressed by your current preferences.'}</p>
                  )
                ) : (
                  <p>{lastResult.error}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPreferences;
