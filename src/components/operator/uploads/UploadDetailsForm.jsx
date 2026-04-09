"use client";

import React from "react";
import { Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * UploadDetailsForm — Step 3 card collecting device + location.
 *
 * @param {{
 *   value: { device: string, location: string },
 *   onChange: (next: { device: string, location: string }) => void,
 *   devices?: Array<{ id: string, name: string, status?: string, location?: string }>,
 *   devicesLoading?: boolean,
 *   disabled?: boolean,
 * }} props
 */
export default function UploadDetailsForm({
  value,
  onChange,
  devices = [],
  devicesLoading = false,
  disabled,
}) {
  const hasDevices = devices.length > 0;
  const deviceDisabled = disabled || devicesLoading || !hasDevices;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
            3
          </div>
          Upload Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">
            Device <span className="text-red-500">*</span>
          </Label>
          <Select
            value={value.device || ""}
            onValueChange={(next) => onChange({ ...value, device: next })}
            disabled={deviceDisabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  devicesLoading
                    ? "Loading devices..."
                    : hasDevices
                    ? "Select an assigned device"
                    : "No devices assigned"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.name}>
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                    <span>{device.name}</span>
                    {device.status && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                          device.status === "recording"
                            ? "bg-red-100 text-red-700"
                            : device.status === "online" || device.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {device.status}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!devicesLoading && !hasDevices && (
            <p className="text-[11px] text-gray-400">
              Contact your administrator to be assigned a device.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., Main Street, Section A-7"
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
