"use client";

import React from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * AddCustomMetadataDialog — shared dialog for adding a custom metadata field to a project.
 * Used by both user and operator project detail pages.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   keyValue: string,
 *   setKeyValue: (v: string) => void,
 *   value: string,
 *   setValue: (v: string) => void,
 *   onSubmit: () => void,
 *   accent?: "indigo" | "blue",
 * }} props
 */
const ACCENT = {
  indigo: { icon: "text-indigo-600", preview: "bg-indigo-50 border-indigo-100" },
  blue: { icon: "text-blue-600", preview: "bg-blue-50 border-blue-100" },
};

export default function AddCustomMetadataDialog({
  open,
  onOpenChange,
  keyValue,
  setKeyValue,
  value,
  setValue,
  onSubmit,
  accent = "indigo",
}) {
  const theme = ACCENT[accent] || ACCENT.indigo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className={`h-4 w-4 ${theme.icon}`} /> Add Custom Field
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add a custom metadata field to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="metadataKey" className="text-xs font-medium">
              Field Name
            </Label>
            <Input
              id="metadataKey"
              placeholder="e.g., Inspection Type, Weather..."
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metadataValue" className="text-xs font-medium">
              Value
            </Label>
            <Input
              id="metadataValue"
              placeholder="e.g., Routine Inspection"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          {keyValue && value && (
            <div className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${theme.preview}`}>
              <span className="text-gray-500 font-medium">{keyValue}:</span>
              <span className="text-gray-800 font-semibold">{value}</span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="text-xs" onClick={onSubmit} disabled={!keyValue || !value}>
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
