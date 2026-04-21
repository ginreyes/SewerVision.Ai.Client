"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Bookmark, Star, Zap, Shield, Heart, Flag, CheckCircle } from "lucide-react";

const ICON_OPTIONS = [
  { value: "Bookmark", label: "Bookmark", Icon: Bookmark },
  { value: "Star", label: "Star", Icon: Star },
  { value: "Zap", label: "Zap", Icon: Zap },
  { value: "Shield", label: "Shield", Icon: Shield },
  { value: "Heart", label: "Heart", Icon: Heart },
  { value: "Flag", label: "Flag", Icon: Flag },
  { value: "CheckCircle", label: "Check", Icon: CheckCircle },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue", cls: "bg-blue-500" },
  { value: "rose", label: "Rose", cls: "bg-rose-500" },
  { value: "amber", label: "Amber", cls: "bg-amber-500" },
  { value: "emerald", label: "Emerald", cls: "bg-emerald-500" },
  { value: "purple", label: "Purple", cls: "bg-purple-500" },
  { value: "indigo", label: "Indigo", cls: "bg-indigo-500" },
  { value: "teal", label: "Teal", cls: "bg-teal-500" },
  { value: "gray", label: "Gray", cls: "bg-gray-500" },
];

/**
 * SaveViewModal — form for creating or editing a SavedView.
 *
 * props:
 *  - open / onOpenChange — dialog control
 *  - initialValues — pre-fill for edit mode
 *  - onSubmit(values) — called on save; parent handles API call
 *  - entityType — 'project' | 'user' | 'report' | 'ticket'
 *  - mode — 'create' | 'edit'
 */
export default function SaveViewModal({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  entityType = "project",
  mode = "create",
  saving = false,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Bookmark");
  const [color, setColor] = useState("blue");
  const [visibility, setVisibility] = useState("private");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name || "");
    setDescription(initialValues?.description || "");
    setIcon(initialValues?.icon || "Bookmark");
    setColor(initialValues?.color || "blue");
    setVisibility(initialValues?.visibility || "private");
    setIsDefault(!!initialValues?.isDefault);
  }, [open, initialValues]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit?.({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      visibility,
      isDefault,
      entityType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit saved view" : "Save current filters as a view"}</DialogTitle>
          <DialogDescription>
            Give this view a name so you can apply it later from the toolbar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="view-name">Name</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My overdue projects"
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="view-desc">Description (optional)</Label>
            <Input
              id="view-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this view shows"
              maxLength={240}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.Icon;
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" /> {opt.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${opt.cls}`} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — only me</SelectItem>
                <SelectItem value="team">Team — shared with specific users</SelectItem>
                <SelectItem value="public">Public — anyone with account access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Set as my default view for this page
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Save view"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
