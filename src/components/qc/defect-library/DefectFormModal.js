"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { GRADE_LABELS } from "./DataTypes";

const EMPTY_FORM = {
  code: "",
  name: "",
  pacp: "",
  grade: "1",
  category: "",
  description: "",
  example: "",
  action: "",
};

/**
 * DefectFormModal - Dialog for creating / editing a defect
 *
 * @param {{ open: boolean, onOpenChange: (v: boolean) => void, defect: object|null, categories: string[], onSubmit: (data: object) => void, isSubmitting: boolean }} props
 */
export default function DefectFormModal({
  open,
  onOpenChange,
  defect,
  categories = [],
  onSubmit,
  isSubmitting = false,
}) {
  const isEdit = !!defect;
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (defect) {
      const gradeNum =
        typeof defect.grade === "number"
          ? defect.grade
          : parseInt(String(defect.grade).replace(/\D/g, ""), 10) || 1;
      setForm({
        code: defect.code || "",
        name: defect.name || defect.description || "",
        pacp: defect.pacp || defect.code || "",
        grade: String(gradeNum),
        category: defect.category || "",
        description: defect.description || "",
        example: defect.example || "",
        action: defect.action || defect.recommendedAction || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [defect, open]);

  const set = (key) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      pacp: form.pacp.trim() || form.code.trim(),
      grade: parseInt(form.grade, 10),
      category: form.category.trim(),
      description: form.description.trim(),
      example: form.example.trim(),
      action: form.action.trim(),
      recommendedAction: form.action.trim(),
    };
    onSubmit?.(payload);
  };

  const valid = form.code.trim() && form.description.trim() && form.category.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEdit ? "Edit Defect" : "Add Custom Defect"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Row: code + name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Code *</Label>
              <Input
                value={form.code}
                onChange={set("code")}
                placeholder="e.g. CL"
                className="h-8 text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Name</Label>
              <Input
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Crack Longitudinal"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Row: PACP + Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">PACP Code</Label>
              <Input
                value={form.pacp}
                onChange={set("pacp")}
                placeholder="e.g. CL"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Grade (1-5) *</Label>
              <Select value={form.grade} onValueChange={set("grade")}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g} - {GRADE_LABELS[g - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Category *</Label>
            <Select value={form.category} onValueChange={set("category")}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(Boolean).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Other (type below)</SelectItem>
              </SelectContent>
            </Select>
            {form.category === "__custom" && (
              <Input
                value=""
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="Enter custom category"
                className="h-8 text-sm mt-1"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Description *</Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the defect..."
              className="text-sm min-h-[60px] resize-none"
              required
            />
          </div>

          {/* Example */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Example</Label>
            <Textarea
              value={form.example}
              onChange={set("example")}
              placeholder="Provide an example observation..."
              className="text-sm min-h-[50px] resize-none"
            />
          </div>

          {/* Recommended action */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Recommended Action</Label>
            <Textarea
              value={form.action}
              onChange={set("action")}
              placeholder="Recommended repair/maintenance action..."
              className="text-sm min-h-[50px] resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={!valid || isSubmitting}
              className="text-xs bg-red-700 hover:bg-red-800 text-white"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Defect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
