"use client";

import React from "react";
import { Edit3, Save } from "lucide-react";
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

const ACCENT = {
  indigo: { icon: "text-indigo-600" },
  blue: { icon: "text-blue-600" },
};

/**
 * EditMetadataDialog — shared dialog for editing existing project metadata fields.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   metadata: Record<string, string>,
 *   setMetadata: (m: Record<string, string>) => void,
 *   onSubmit: () => void,
 *   accent?: "indigo" | "blue",
 * }} props
 */
export default function EditMetadataDialog({
  open,
  onOpenChange,
  metadata,
  setMetadata,
  onSubmit,
  accent = "indigo",
}) {
  const theme = ACCENT[accent] || ACCENT.indigo;
  const entries = Object.entries(metadata || {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Edit3 className={`h-4 w-4 ${theme.icon}`} /> Edit Recording Information
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update the project metadata fields.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-2 -mx-1 px-1">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Edit3 className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No metadata fields</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0">
                    <Label
                      htmlFor={`metadata-${key}`}
                      className="text-xs font-medium text-gray-500 capitalize truncate block"
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                  </div>
                  <Input
                    id={`metadata-${key}`}
                    value={value || ""}
                    onChange={(e) => setMetadata({ ...metadata, [key]: e.target.value })}
                    className="h-9 text-sm flex-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 border-t pt-4">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="text-xs" onClick={onSubmit}>
            <Save className="h-3 w-3 mr-1" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
