"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Star,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import permissionLevelApi from "@/data/permissionLevelApi";
import SewerTable from "@/components/ui/SewerTable";
import { getRoleTheme, getRoleLabel } from "@/lib/roleThemes";
import ResyncModulesModal from "./ResyncModulesModal";

export default function PermissionLevelsTab() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resyncOpen, setResyncOpen] = useState(false);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await permissionLevelApi.getAll();
      const raw = response?.data?.data ?? response?.data ?? response;
      const list = Array.isArray(raw) ? raw : [];
      setLevels(list);
    } catch (e) {
      console.error("Failed to fetch permission levels:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

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
      const theme = getRoleTheme(item.role);
      return (
        <Badge className={`${theme.badge} text-xs`}>
          {getRoleLabel(item.role)}
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
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/permissions/${item._id}`); }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/permissions/${item._id}/edit`); }}
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
      {/* Toolbar — Resync action lives here so admins can refresh module availability
          when new modules get registered in code. */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            Added new modules in code? Resync to make them available to roles.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setResyncOpen(true)}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Resync Modules
        </Button>
      </div>

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
      />

      <ResyncModulesModal
        open={resyncOpen}
        onClose={() => setResyncOpen(false)}
        onApplied={fetchLevels}
      />
    </div>
  );
}
