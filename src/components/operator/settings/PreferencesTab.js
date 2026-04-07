"use client";

import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from './SettingsUI';
import { LANGUAGES, UNITS } from './constants';

const PreferencesTab = ({ settings, updateSetting }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <SectionHeader icon={Globe} title="System Preferences" description="Customize language and display settings" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
            <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Measurement Units</Label>
          <Select value={settings.units} onValueChange={(v) => updateSetting('units', v)}>
            <SelectTrigger><SelectValue placeholder="Select Units" /></SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 opacity-60">
          <div className="flex items-center justify-between">
            <Label>Appearance</Label>
            <Badge variant="outline" className="text-xs font-normal text-amber-600 bg-amber-50 border-amber-200">Coming Soon</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 cursor-not-allowed">
            {['light', 'dark', 'system'].map((theme) => (
              <Button key={theme} variant="outline" disabled className="capitalize">{theme}</Button>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PreferencesTab;
