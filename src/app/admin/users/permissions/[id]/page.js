"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Edit,
  Trash2,
  Loader2,
  Users,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { permissionLevelApi } from "@/data/permissionLevelApi";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getRoleTheme, getRoleLabel } from "@/lib/roleThemes";

export default function PermissionLevelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const [level, setLevel] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await permissionLevelApi.getById(params.id);
        const data = res?.data?.data ?? res?.data ?? res;
        setLevel(data);

        // Fetch modules for this role
        if (data?.role) {
          const modRes = await permissionLevelApi.getModulesForRole(data.role);
          const mods = modRes?.data?.data ?? modRes?.data ?? [];
          setModules(Array.isArray(mods) ? mods : []);
        }
      } catch (e) {
        console.error("Failed to fetch:", e);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetch();
  }, [params.id]);

  const groupedModules = useMemo(() => {
    if (!level || !modules.length) return [];
    const included = new Set(level.modules || []);
    const groups = {};
    modules.forEach((m) => {
      if (!groups[m.group]) groups[m.group] = { label: m.group, items: [] };
      groups[m.group].items.push({ ...m, isIncluded: included.has(m.key) });
    });
    return Object.values(groups).sort((a, b) => (a.items[0]?.groupOrder || 0) - (b.items[0]?.groupOrder || 0));
  }, [level, modules]);

  const handleDelete = () => {
    if (level?.usersAssigned > 0) {
      showAlert(`Cannot delete: ${level.usersAssigned} user(s) assigned. Reassign them first.`, "error");
      return;
    }
    showDelete({
      title: `Delete "${level.name}"?`,
      description: "This permission level will be permanently removed.",
      onConfirm: async () => {
        try {
          await permissionLevelApi.delete(level._id);
          showAlert("Deleted", "success");
          router.push("/admin/users?tab=permissions");
        } catch (e) {
          showAlert("Failed to delete", "error");
        }
      },
    });
  };

  const goBack = () => router.push("/admin/users?tab=permissions");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <p className="text-gray-500">Permission level not found</p>
        <Button variant="outline" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const includedCount = (level.modules || []).length;

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
                  <h1 className="text-2xl font-bold text-gray-900">{level.name}</h1>
                  <p className="text-sm text-gray-600">Permission level details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/admin/users/permissions/${level._id}/edit`)}>
                <Edit className="w-4 h-4 mr-1.5" /> Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Role</p>
              <Badge className={`mt-2 ${getRoleTheme(level.role).badge}`}>{getRoleLabel(level.role)}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Modules</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{includedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Users Assigned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                <Users className="w-5 h-5 text-gray-400" /> {level.usersAssigned || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase">Default</p>
              <div className="mt-2">
                {level.isDefault ? (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Star className="w-3 h-3 mr-1" /> Yes</Badge>
                ) : (
                  <span className="text-sm text-gray-500">No</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {level.description && (
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Description</p>
              <p className="text-sm text-gray-700">{level.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Module Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Module Access</CardTitle>
            <CardDescription>{includedCount} of {modules.length} modules enabled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupedModules.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{group.label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.items.map((mod) => (
                      <div
                        key={mod.key}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                          mod.isIncluded
                            ? "bg-rose-50/50 border-rose-200"
                            : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      >
                        <DynamicIcon
                          name={mod.icon}
                          size={18}
                          className={mod.isIncluded ? "text-rose-600" : "text-gray-400"}
                        />
                        <span className={`text-sm ${mod.isIncluded ? "font-medium text-gray-900" : "text-gray-500 line-through"}`}>
                          {mod.label}
                        </span>
                        {mod.locked && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-auto gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Required
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meta */}
        <Card>
          <CardContent className="p-5 flex items-center gap-6 text-xs text-muted-foreground">
            {level.createdBy && (
              <span>Created by: <strong className="text-gray-700">{level.createdBy.first_name} {level.createdBy.last_name}</strong></span>
            )}
            {level.createdAt && (
              <span>Created: <strong className="text-gray-700">{new Date(level.createdAt).toLocaleDateString()}</strong></span>
            )}
            {level.updatedAt && (
              <span>Updated: <strong className="text-gray-700">{new Date(level.updatedAt).toLocaleDateString()}</strong></span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
