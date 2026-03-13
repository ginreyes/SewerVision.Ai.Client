import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ToggleSetting = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-0.5">
      <Label className="text-base font-medium text-gray-900">{label}</Label>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default ToggleSetting;
