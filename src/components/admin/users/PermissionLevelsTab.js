"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Users,
  CheckCircle,
  Star,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import permissionLevelApi from "@/data/permissionLevelApi";
import SewerTable from "@/components/ui/SewerTable";

const ROLE_COLORS = {
  operator: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  "qc-technician": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  user: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  customer: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

const ROLE_LABELS = {
  operator: "Operator",
  "qc-technician": "QC Technician",
  user: "User",
  customer: "Customer",
};

export default function PermissionLevelsTab() {
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    role: "",
    modules: [],
    isDefault: false,
  });
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await permissionLevelApi.getAll();
      if (response?.ok) {
        const raw = response.data?.data ?? response.data;
        setLevels(Array.isArray(raw) ? raw : []);
      } else {
        setLevels([]);
      }
    } catch (e) {
      console.error("Failed to fetch permission levels:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const fetchModulesForRole = async (role) => {
    if (!role) return;
    setLoadingModules(true);
    try {
      const response = await permissionLevelApi.getModulesForRole(role);
      if (response?.ok) {
        // response.data is the backend JSON: { ok, data: [...] }
        const raw = response.data?.data ?? response.data;
        const mods = Array.isArray(raw) ? raw : [];
        setAvailableModules(mods);
        // Auto-select locked modules
        const locked = mods.filter((m) => m.locked).map((m) => m.key);
        setFormData((prev) => ({
          ...prev,
          modules: [...new Set([...locked, ...prev.modules.filter((k) => mods.some((m) => m.key === k))])],
        }));
      }
    } catch (e) {
      console.error("Failed to fetch modules:", e);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role, modules: [] }));
    fetchModulesForRole(role);
  };

  const toggleModule = (moduleKey) => {
    const isLocked = availableModules.find((m) => m.key === moduleKey)?.locked;
    if (isLocked) return;

    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleKey)
        ? prev.modules.filter((k) => k !== moduleKey)
        : [...prev.modules, moduleKey],
    }));
  };

  const selectAllModules = () => {
    setFormData((prev) => ({
      ...prev,
      modules: availableModules.map((m) => m.key),
    }));
  };

  const deselectOptionalModules = () => {
    setFormData((prev) => ({
      ...prev,
      modules: availableModules.filter((m) => m.locked).map((m) => m.key),
    }));
  };

  const openCreateModal = () => {
    setEditingLevel(null);
    setFormData({ name: "", description: "", role: "", modules: [], isDefault: false });
    setAvailableModules([]);
    setShowModal(true);
  };

  const openEditModal = (level) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description || "",
      role: level.role,
      modules: level.modules || [],
      isDefault: level.isDefault || false,
    });
    fetchModulesForRole(level.role);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showAlert("Please enter a level name", "error");
      return;
    }
    if (!formData.role) {
      showAlert("Please select a role", "error");
      return;
    }
    if (formData.modules.length === 0) {
      showAlert("Please select at least one module", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingLevel) {
        const response = await permissionLevelApi.update(editingLevel._id, formData);
        if (response?.ok) {
          showAlert("Permission level updated", "success");
        } else {
          showAlert(response?.data?.message || "Failed to update", "error");
          return;
        }
      } else {
        const response = await permissionLevelApi.create(formData);
        if (response?.ok) {
          showAlert("Permission level created", "success");
        } else {
          showAlert(response?.data?.message || "Failed to create", "error");
          return;
        }
      }
      setShowModal(false);
      fetchLevels();
    } catch (e) {
      showAlert("An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (level) => {
    if (level.usersAssigned > 0) {
      showAlert(`Cannot delete: ${level.usersAssigned} user(s) are assigned. Reassign them first.`, "error");
      return;
    }
    showDelete({
      title: `Delete "${level.name}"?`,
      description: "This permission level will be permanently removed.",
      onConfirm: async () => {
        try {
          const response = await permissionLevelApi.delete(level._id);
          if (response?.ok) {
            showAlert("Permission level deleted", "success");
            fetchLevels();
          } else {
            showAlert(response?.data?.message || "Failed to delete", "error");
          }
        } catch (e) {
          showAlert("Failed to delete", "error");
        }
      },
    });
  };

  // Table config
  const columns = [
    { key: "name", name: "Level Name" },
    { key: "role", name: "Role" },
    { key: "modules", name: "Modules" },
    { key: "usersAssigned", name: "Users" },
    { key: "isDefault", name: "Default" },
    { key: "actions", name: "" },
  ];

  const tableData = (Array.isArray(levels) ? levels : []).map((level) => ({
    _id: level._id,
    name: level.name,
    description: level.description,
    role: level.role,
    modules: level.modules || [],
    usersAssigned: level.usersAssigned || 0,
    isDefault: level.isDefault,
    _raw: level,
  }));

  const renderCell = (item, col) => {
    if (col.key === "name") {
      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
          {item.description && (
            <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{item.description}</p>
          )}
        </div>
      );
    }
    if (col.key === "role") {
      const colors = ROLE_COLORS[item.role] || {};
      return (
        <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-xs`}>
          {ROLE_LABELS[item.role] || item.role}
        </Badge>
      );
    }
    if (col.key === "modules") {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">{item.modules.length}</span>
          <span className="text-xs text-gray-400">modules</span>
        </div>
      );
    }
    if (col.key === "usersAssigned") {
      return (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-700">{item.usersAssigned}</span>
        </div>
      );
    }
    if (col.key === "isDefault") {
      return item.isDefault ? (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
          <Star className="w-3 h-3 mr-0.5" /> Default
        </Badge>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      );
    }
    if (col.key === "actions") {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(item._raw); }}
            className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item._raw); }}
            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <SewerTable
        data={tableData}
        columns={columns}
        loading={loading}
        renderCell={renderCell}
        showCheckbox={false}
        showActions={false}
        showCsvActions={false}
        emptyMessage="No permission levels created yet"
        emptySubtext="Create your first permission level to control module access"
        columnDefaults={{
          name: 200,
          role: 130,
          modules: 120,
          usersAssigned: 100,
          isDefault: 100,
          actions: 80,
        }}
        rowsPerPageOptions={[10, 20]}
        ButtonPlacement={
          <Button onClick={openCreateModal} className="bg-rose-600 hover:bg-rose-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Level
          </Button>
        }
      />

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !saving && setShowModal(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Shield className="w-5 h-5 text-rose-600" />
              </div>
              {editingLevel ? "Edit Permission Level" : "Create Permission Level"}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? "Update the modules this level grants access to"
                : "Define a new permission level and select which modules it includes"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Name & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Level Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Field Operator"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={saving || !!editingLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="qc-technician">QC Technician</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of this level's purpose"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                disabled={saving}
              />
            </div>

            {/* Module Selection Grid */}
            {formData.role && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Modules</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={selectAllModules} disabled={saving}>
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={deselectOptionalModules} disabled={saving}>
                      Clear Optional
                    </Button>
                  </div>
                </div>

                {loadingModules ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableModules.map((mod) => {
                      const isSelected = formData.modules.includes(mod.key);
                      const isLocked = mod.locked;

                      return (
                        <div
                          key={mod.key}
                          onClick={() => !saving && toggleModule(mod.key)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                            isLocked
                              ? "bg-gray-50 border-gray-200 opacity-70 cursor-not-allowed"
                              : isSelected
                              ? "bg-rose-50 border-rose-200 shadow-sm"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-rose-500 border-rose-500"
                                : "border-gray-300"
                            }`}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${isSelected ? "font-medium text-gray-900" : "text-gray-600"}`}>
                              {mod.label}
                            </span>
                          </div>
                          {isLocked && (
                            <Badge className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0">
                              Always On
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    {formData.modules.length} of {availableModules.length} modules selected
                  </span>
                </div>
              </div>
            )}

            {/* Default Toggle */}
            <div className="flex items-center justify-between px-3 py-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Set as Default</p>
                <p className="text-xs text-gray-500">Auto-assign to new users of this role</p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDefault: checked }))}
                disabled={saving}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.role || formData.modules.length === 0}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editingLevel ? (
                  "Update Level"
                ) : (
                  "Create Level"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
