"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  Lock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Settings,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { permissionLevelApi } from "@/data/permissionLevelApi";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getAllRoleThemes } from "@/lib/roleThemes";

const ROLES = Object.values(getAllRoleThemes())
  .filter((t) => t.key !== "admin")
  .map((t) => ({ value: t.key, label: t.label, color: t.dot }));

const STEPS = [
  { id: 1, title: "General Info", description: "Name, role, and description", icon: Shield, color: "bg-rose-500" },
  { id: 2, title: "Module Access", description: "Select which modules to include", icon: Settings, color: "bg-blue-500" },
  { id: 3, title: "Review & Confirm", description: "Preview before saving", icon: Eye, color: "bg-emerald-500" },
];

export default function PermissionLevelForm({ mode = "create", initialData = null }) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [isDefault, setIsDefault] = useState(false);

  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [existingLevels, setExistingLevels] = useState([]);

  // Fetch existing levels for name uniqueness check
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await permissionLevelApi.getAll();
        const raw = res?.data?.data ?? res?.data ?? res;
        setExistingLevels(Array.isArray(raw) ? raw : []);
      } catch (e) { /* ignore */ }
    };
    fetchExisting();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setRole(initialData.role || "");
      setSelectedModules(initialData.modules || []);
      setIsDefault(initialData.isDefault || false);
    }
  }, [initialData]);

  useEffect(() => {
    if (!role) { setModules([]); return; }
    const fetchModules = async () => {
      setLoadingModules(true);
      try {
        const res = await permissionLevelApi.getModulesForRole(role);
        if (res?.ok) {
          const raw = res.data?.data ?? res.data;
          const mods = Array.isArray(raw) ? raw : [];
          setModules(mods);
          const groups = {};
          mods.forEach((m) => { groups[m.group] = true; });
          setExpandedGroups(groups);
        }
      } catch (e) {
        console.error("Failed to load modules:", e);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, [role]);

  const groupedModules = useMemo(() => {
    const groups = {};
    modules.forEach((m) => {
      if (!groups[m.group]) groups[m.group] = { label: m.group, groupOrder: m.groupOrder, items: [] };
      groups[m.group].items.push(m);
    });
    return Object.values(groups).sort((a, b) => a.groupOrder - b.groupOrder);
  }, [modules]);

  const lockedKeys = useMemo(() => modules.filter((m) => m.locked).map((m) => m.key), [modules]);
  const optionalKeys = useMemo(() => modules.filter((m) => !m.locked).map((m) => m.key), [modules]);
  const finalModules = useMemo(() => [...new Set([...lockedKeys, ...selectedModules])], [lockedKeys, selectedModules]);
  const previewModules = useMemo(() => modules.filter((m) => finalModules.includes(m.key)), [modules, finalModules]);
  const roleLabel = ROLES.find((r) => r.value === role)?.label || role;

  const toggleModule = useCallback((key) => {
    setSelectedModules((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedModules([...new Set([...lockedKeys, ...optionalKeys])]);
  }, [lockedKeys, optionalKeys]);

  const clearOptional = useCallback(() => {
    setSelectedModules([...lockedKeys]);
  }, [lockedKeys]);

  const toggleGroup = useCallback((groupLabel) => {
    setExpandedGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  }, []);

  const nextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) { showAlert("Name is required", "error"); return; }
      if (!role) { showAlert("Please select a role", "error"); return; }
      // Check duplicate name for same role (skip in edit mode for same name)
      const duplicate = existingLevels.find(
        (l) => l.name.toLowerCase() === name.trim().toLowerCase() && l.role === role && l._id !== initialData?._id
      );
      if (duplicate) {
        showAlert(`A permission level named "${name.trim()}" already exists for this role`, "error");
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), role, modules: finalModules, isDefault };
      const res = mode === "edit" && initialData?._id
        ? await permissionLevelApi.update(initialData._id, payload)
        : await permissionLevelApi.create(payload);

      if (res?.ok) {
        showAlert(mode === "edit" ? "Permission level updated" : "Permission level created", "success");
        router.push("/admin/users?tab=permissions");
      } else {
        showAlert(res?.message || "Operation failed", "error");
      }
    } catch (e) {
      showAlert(e?.message || "An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => router.push("/admin/users?tab=permissions");

  /* ─── Step Content Renderers ─── */

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center pb-4">
        <div className="inline-flex p-3 bg-rose-100 rounded-xl mb-4">
          <Shield className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">General Information</h3>
        <p className="text-gray-600">Set the basic details for this permission level</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Level Name <span className="text-red-500 ml-1">*</span></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Field Operator" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Role <span className="text-red-500 ml-1">*</span></Label>
          <Select value={role} onValueChange={setRole} disabled={mode === "edit"}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r.color}`} />
                    {r.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this permission level is for..." rows={3} className="resize-none" />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium text-gray-700">Set as default</Label>
          <p className="text-sm text-gray-500">Auto-assign to new users of this role</p>
        </div>
        <Switch checked={isDefault} onCheckedChange={setIsDefault} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center pb-4">
        <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-4">
          <Settings className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Module Access</h3>
        <p className="text-gray-600">Choose which modules users with this level can access</p>
      </div>

      {role && modules.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Badge variant="secondary" className="font-mono text-sm px-3 py-1">{finalModules.length}/{modules.length}</Badge>
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
          <Button variant="ghost" size="sm" onClick={clearOptional}>Clear</Button>
        </div>
      )}

      {loadingModules ? (
        <div className="space-y-4 mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mx-auto">
          {groupedModules.map((group) => {
            const isExpanded = expandedGroups[group.label] !== false;
            const groupSelected = group.items.filter((m) => m.locked || selectedModules.includes(m.key)).length;

            return (
              <div key={group.label} className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {group.label}
                  </span>
                  <Badge variant="outline" className="text-[10px] tabular-nums">{groupSelected}/{group.items.length}</Badge>
                </button>

                {isExpanded && (
                  <>
                    <Separator />
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.items.map((mod) => {
                        const isLocked = mod.locked;
                        const isSelected = isLocked || selectedModules.includes(mod.key);

                        return (
                          <label
                            key={mod.key}
                            className={`flex items-start gap-4 rounded-xl border p-4 transition-colors
                              ${isLocked ? "bg-muted/40 cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-accent/50"}
                              ${!isLocked && isSelected ? "border-rose-300 bg-rose-50/50" : ""}
                            `}
                          >
                            <Checkbox checked={isSelected} disabled={isLocked} onCheckedChange={() => !isLocked && toggleModule(mod.key)} className="mt-1 h-5 w-5" />
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <DynamicIcon name={mod.icon} size={20} className={isSelected ? "text-rose-600" : "text-muted-foreground"} />
                                <span className="text-base font-semibold leading-none">{mod.label}</span>
                                {isLocked && (
                                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Required
                                  </Badge>
                                )}
                              </div>
                              {mod.description && <p className="text-sm text-muted-foreground leading-snug">{mod.description}</p>}
                              {mod.paths?.[role] && <code className="text-xs text-muted-foreground/50 font-mono">{mod.paths[role]}</code>}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center pb-4">
        <div className="inline-flex p-3 bg-emerald-100 rounded-xl mb-4">
          <Eye className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Confirm</h3>
        <p className="text-gray-600">Verify everything looks correct before {mode === "edit" ? "saving" : "creating"}</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-lg border p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <p className="text-sm font-semibold">{name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Role</p>
            <Badge variant="secondary">{roleLabel}</Badge>
          </div>
          {description && (
            <div className="col-span-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Default</p>
            <p className="text-sm">{isDefault ? "Yes — auto-assigned" : "No"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Modules</p>
            <p className="text-sm font-semibold">{previewModules.length} of {modules.length}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Included Modules</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {previewModules.map((mod) => (
              <div key={mod.key} className="flex items-center gap-2.5 px-3 py-2 rounded-md border">
                <DynamicIcon name={mod.icon} size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{mod.label}</span>
                {mod.locked && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-auto gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header — matches project creation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={goBack} className="flex items-center gap-2 h-10">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === "edit" ? "Edit Permission Level" : "Create Permission Level"}
                  </h1>
                  <p className="text-sm text-gray-600">Define module access for a specific role</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar — matches project creation exactly */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 space-x-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold transition-all duration-300 ${
                  currentStep === step.id
                    ? step.color + " text-white shadow-md transform scale-110"
                    : currentStep > step.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-2 mx-3 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
            </h2>
            <p className="text-md text-gray-600 mt-2">{STEPS[currentStep - 1]?.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content — matches project creation */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Navigation — matches project creation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2 h-10 px-4">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={goBack}>Cancel</Button>
              {currentStep < STEPS.length ? (
                <Button onClick={nextStep} className="flex items-center gap-2 h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white">
                  Next Step <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {mode === "edit" ? "Save Changes" : "Create Level"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
