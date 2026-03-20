"use client";

import React, { useState, useEffect } from "react";
import { Shield, Loader2, CheckCircle, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import permissionLevelApi from "@/data/permissionLevelApi";

const ROLE_LABELS = {
  operator: "Operator",
  "qc-technician": "QC Technician",
  user: "User",
  customer: "Customer",
  "customer-rep": "Customer Rep",
};

/**
 * Props:
 *  - user: current user object
 *  - isEdit: whether admin is in edit mode
 *  - onPermissionChange(levelId): called when admin selects a new level (parent stores it, saves on "Save" click)
 */
export default function PermissionsTab({ user, isEdit = false, onPermissionChange }) {
  const [levels, setLevels] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelId, setSelectedLevelId] = useState(
    user?.permissionLevel?._id || user?.permissionLevel || ""
  );

  // Sync when user data refreshes
  useEffect(() => {
    const lvl = user?.permissionLevel?._id || user?.permissionLevel || "";
    setSelectedLevelId(lvl);
  }, [user?.permissionLevel]);

  useEffect(() => {
    if (!user?.role || user.role === "admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [levelsRes, modulesRes] = await Promise.all([
          permissionLevelApi.getAll(user.role),
          permissionLevelApi.getModulesForRole(user.role),
        ]);
        if (levelsRes?.ok) {
          const rawLevels = levelsRes.data?.data ?? levelsRes.data;
          setLevels(Array.isArray(rawLevels) ? rawLevels : []);
        }
        if (modulesRes?.ok) {
          const rawModules = modulesRes.data?.data ?? modulesRes.data;
          setModules(Array.isArray(rawModules) ? rawModules : []);
        }
      } catch (e) {
        console.error("Failed to fetch permission data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  const selectedLevel = levels.find((l) => l._id === selectedLevelId);

  const handleChange = (val) => {
    setSelectedLevelId(val);
    // Notify parent — parent saves this when "Save" is clicked
    if (onPermissionChange) {
      onPermissionChange(val === "none" ? null : val);
    }
  };

  if (user?.role === "admin") {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-6 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Full Access</p>
            <p className="text-xs text-emerald-600">Admin accounts always have unrestricted access to all modules.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const currentLevelId = user?.permissionLevel?._id || user?.permissionLevel || "";
  const hasChanged = selectedLevelId !== currentLevelId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <CardTitle className="text-base">Module Permissions</CardTitle>
            <CardDescription>
              Control which modules this {ROLE_LABELS[user?.role] || user?.role} can access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Current Status */}
        {!currentLevelId && !hasChanged && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              No permission level assigned — this user has full access to all modules.
            </p>
          </div>
        )}

        {/* Level Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Permission Level</label>
          <Select
            value={selectedLevelId || "none"}
            onValueChange={handleChange}
            disabled={!isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a permission level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-500">No restriction (full access)</span>
              </SelectItem>
              {levels.map((level) => (
                <SelectItem key={level._id} value={level._id}>
                  <div className="flex items-center gap-2">
                    <span>{level.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ({level.modules?.length || 0} modules)
                    </span>
                    {level.isDefault && (
                      <Badge className="bg-amber-100 text-amber-600 text-[9px] px-1 py-0">Default</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isEdit && hasChanged && (
            <p className="text-xs text-amber-600">Changed — will be saved when you click Save</p>
          )}
        </div>

        {/* Module Preview */}
        {selectedLevelId && selectedLevelId !== "none" && selectedLevel && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Modules included:</p>
            <div className="flex flex-wrap gap-1.5">
              {modules.map((mod) => {
                const hasAccess = selectedLevel.modules?.includes(mod.key);
                return (
                  <Badge
                    key={mod.key}
                    variant="outline"
                    className={`text-xs ${
                      hasAccess
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-400 border-gray-200 line-through"
                    }`}
                  >
                    {hasAccess ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <X className="w-3 h-3 mr-1" />
                    )}
                    {mod.label}
                  </Badge>
                );
              })}
            </div>
            {selectedLevel.description && (
              <p className="text-xs text-gray-400 mt-1">{selectedLevel.description}</p>
            )}
          </div>
        )}

        {levels.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No permission levels exist for this role yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Go to User Management → Permission Levels tab to create one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
