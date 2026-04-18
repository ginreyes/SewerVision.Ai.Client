"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  Star,
  Zap,
  Shield,
  Heart,
  Flag,
  CheckCircle,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Copy,
  X,
  Users,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import SaveViewModal from "./SaveViewModal";
import {
  useSavedViews,
  useCreateSavedView,
  useUpdateSavedView,
  useDeleteSavedView,
  useDuplicateSavedView,
  useTrackSavedViewUsage,
} from "@/data/savedViewsApi";
import { useAlert } from "@/components/providers/AlertProvider";

const ICON_MAP = {
  Bookmark,
  Star,
  Zap,
  Shield,
  Heart,
  Flag,
  CheckCircle,
};

const COLOR_DOT = {
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  gray: "bg-gray-500",
};

const VISIBILITY_ICON = {
  private: Lock,
  team: Users,
  public: Globe,
};

/**
 * SavedViewsDropdown — toolbar trigger for the Saved Views feature.
 *
 * props:
 *  - entityType: 'project' | 'user' | 'report' | 'ticket'
 *  - activeViewId: id of currently applied view (optional)
 *  - onApply(view): callback when user applies a view
 *  - onClear(): callback when user clears active view
 *  - snapshotFilters(): returns current filter state to save
 */
export default function SavedViewsDropdown({
  entityType = "project",
  activeViewId,
  onApply,
  onClear,
  snapshotFilters,
  accentColor = "blue",
}) {
  const { showAlert } = useAlert?.() || { showAlert: () => {} };
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data, isLoading } = useSavedViews(entityType);
  const createMutation = useCreateSavedView();
  const updateMutation = useUpdateSavedView();
  const deleteMutation = useDeleteSavedView();
  const duplicateMutation = useDuplicateSavedView();
  const trackMutation = useTrackSavedViewUsage();

  const grouped = data?.grouped || { mine: [], shared: [], public: [] };
  const allViews = data?.views || [];

  const activeView = useMemo(
    () => allViews.find((v) => v._id === activeViewId),
    [allViews, activeViewId]
  );

  const handleApply = (view) => {
    onApply?.(view);
    trackMutation.mutate(view._id);
    setDropdownOpen(false);
  };

  const handleClear = () => {
    onClear?.();
    setDropdownOpen(false);
  };

  const handleSaveNew = async (values) => {
    const filters = typeof snapshotFilters === "function" ? snapshotFilters() : {};
    try {
      const created = await createMutation.mutateAsync({ ...values, filters });
      showAlert?.(`View "${created.name}" saved`, "success");
      setCreateOpen(false);
      onApply?.(created);
    } catch (err) {
      showAlert?.(err.message || "Failed to save view", "error");
    }
  };

  const handleSaveEdit = async (values) => {
    if (!editTarget) return;
    try {
      const updated = await updateMutation.mutateAsync({ id: editTarget._id, ...values });
      showAlert?.(`View "${updated.name}" updated`, "success");
      setEditTarget(null);
    } catch (err) {
      showAlert?.(err.message || "Failed to update view", "error");
    }
  };

  const handleDuplicate = async (view) => {
    try {
      const copy = await duplicateMutation.mutateAsync(view._id);
      showAlert?.(`Duplicated as "${copy.name}"`, "success");
    } catch (err) {
      showAlert?.(err.message || "Failed to duplicate", "error");
    }
  };

  const handleDelete = async (view) => {
    if (!confirm(`Delete view "${view.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(view._id);
      showAlert?.("View deleted", "success");
      if (activeViewId === view._id) onClear?.();
    } catch (err) {
      showAlert?.(err.message || "Failed to delete", "error");
    }
  };

  // Render a single view row with inline actions
  const ViewRow = ({ view, canEdit = true }) => {
    const Icon = ICON_MAP[view.icon] || Bookmark;
    const VisIcon = VISIBILITY_ICON[view.visibility] || Lock;
    const isActive = activeViewId === view._id;
    return (
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md group cursor-pointer ${
          isActive ? "bg-gray-100 dark:bg-[#1f1f22]" : "hover:bg-gray-50 dark:hover:bg-[#17171a]"
        }`}
        onClick={() => handleApply(view)}
      >
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
            COLOR_DOT[view.color] || "bg-gray-500"
          } bg-opacity-20`}
        >
          <Icon
            className={`w-3.5 h-3.5 text-${view.color || "gray"}-600 dark:text-${view.color || "gray"}-400`}
          />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {view.name}
            </span>
            {view.isDefault && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          {view.description && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {view.description}
            </p>
          )}
        </div>
        <VisIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                setEditTarget(view);
              }}
              className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(view);
            }}
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Copy className="w-3 h-3" />
          </button>
          {canEdit && (
            <button
              type="button"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(view);
              }}
              className="p-1 rounded text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const triggerLabel = activeView ? activeView.name : "Views";
  const TriggerIcon = activeView ? (ICON_MAP[activeView.icon] || Bookmark) : Bookmark;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <TriggerIcon className="w-3.5 h-3.5" />
            <span className="max-w-[140px] truncate">{triggerLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 p-1">
          {activeView && (
            <>
              <DropdownMenuItem
                onClick={handleClear}
                className="text-xs text-gray-500 gap-1.5"
              >
                <X className="w-3 h-3" /> Clear active view
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setCreateOpen(true);
              setDropdownOpen(false);
            }}
            className="gap-1.5 text-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Save current filters as view...
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <>
              {grouped.mine.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400">
                    My views
                  </DropdownMenuLabel>
                  {grouped.mine.map((view) => (
                    <ViewRow key={view._id} view={view} canEdit />
                  ))}
                </>
              )}

              {grouped.shared.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400">
                    Shared with me
                  </DropdownMenuLabel>
                  {grouped.shared.map((view) => (
                    <ViewRow key={view._id} view={view} canEdit={false} />
                  ))}
                </>
              )}

              {grouped.public.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400">
                    Public
                  </DropdownMenuLabel>
                  {grouped.public.slice(0, 8).map((view) => (
                    <ViewRow key={view._id} view={view} canEdit={false} />
                  ))}
                </>
              )}

              {grouped.mine.length === 0 && grouped.shared.length === 0 && grouped.public.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6 px-2">
                  No saved views yet. Set up filters and click "Save current filters as view" to create one.
                </p>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create modal */}
      <SaveViewModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        entityType={entityType}
        onSubmit={handleSaveNew}
        saving={createMutation.isPending}
      />

      {/* Edit modal */}
      <SaveViewModal
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        mode="edit"
        entityType={entityType}
        initialValues={editTarget}
        onSubmit={handleSaveEdit}
        saving={updateMutation.isPending}
      />
    </>
  );
}
