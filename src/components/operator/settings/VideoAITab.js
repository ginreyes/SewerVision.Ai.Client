"use client";

import { Camera } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SectionHeader, ToggleSetting } from './SettingsUI';
import { STREAM_QUALITIES } from './constants';

const VideoAITab = ({ settings, updateSetting }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <SectionHeader icon={Camera} title="Video & AI Configuration" description="Adjust recording quality and AI processing settings" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Stream Quality</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STREAM_QUALITIES.map((q) => (
            <div key={q.value} onClick={() => updateSetting('streamQuality', q.value)}
              className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                settings.streamQuality === q.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200'
              }`}>
              <div className="font-bold">{q.label}</div>
              <div className="text-xs text-gray-500 mt-1">{q.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <ToggleSetting label="Real-time AI Processing" description="Detect defects and anomalies while recording (Requires high battery usage)"
        checked={settings.aiProcessing} onCheckedChange={(c) => updateSetting('aiProcessing', c)} />
      <ToggleSetting label="PACP Compliance Check" description="Validate inspection data against PACP standards in real-time"
        checked={settings.pacpCompliance} onCheckedChange={(c) => updateSetting('pacpCompliance', c)} />
    </CardContent>
  </Card>
);

export default VideoAITab;
