"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  BookOpen, Search, Filter, Plus, Loader2, Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  usePacpDefects,
  usePacpCategories,
  useCreatePacpDefect,
  useUpdatePacpDefect,
  useDeletePacpDefect,
} from "@/hooks/useQueryHooks";
import {
  DefectCard,
  DefectDetail,
  DefectFormModal,
  getCategoryIcon,
} from "@/components/qc/defect-library";

// ── helpers ────────────────────────────────────────────────

function useFavoritesStore() {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("defect-favorites");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("defect-favorites", JSON.stringify([...next]));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  return { favorites, toggle };
}

function useNotesStore() {
  const [notes, setNotes] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("defect-notes");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const save = useCallback((id, text) => {
    setNotes((prev) => {
      const next = { ...prev, [id]: text };
      try {
        localStorage.setItem("defect-notes", JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  return { notes, save };
}

// ── page ───────────────────────────────────────────────────

export default function DefectLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);

  // Data queries
  const { data: defectsData, isLoading } = usePacpDefects({
    category: category !== "All" ? category : undefined,
    search: search || undefined,
  });
  const { data: categoriesData = [] } = usePacpCategories();

  // Mutations
  const createMutation = useCreatePacpDefect();
  const updateMutation = useUpdatePacpDefect();
  const deleteMutation = useDeletePacpDefect();

  // Local stores
  const { favorites, toggle: toggleFavorite } = useFavoritesStore();
  const { notes, save: saveNote } = useNotesStore();

  // Derived data
  const defects = useMemo(
    () => defectsData?.data || defectsData || [],
    [defectsData]
  );

  const categories = useMemo(
    () => ["All", ...(Array.isArray(categoriesData) ? categoriesData : [])],
    [categoriesData]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    const allDefects = defectsData?.data || defectsData || [];
    for (const d of allDefects) {
      counts[d.category] = (counts[d.category] || 0) + 1;
    }
    return counts;
  }, [defectsData]);

  const selectedDefect = useMemo(
    () => (selected ? defects.find((d) => (d.id || d._id) === selected) : null),
    [selected, defects]
  );

  const relatedDefects = useMemo(() => {
    if (!selectedDefect) return [];
    return defects
      .filter(
        (d) =>
          (d.id || d._id) !== (selectedDefect.id || selectedDefect._id) &&
          d.category === selectedDefect.category
      )
      .slice(0, 5);
  }, [selectedDefect, defects]);

  // Handlers
  const handleSelect = useCallback(
    (id) => setSelected((prev) => (prev === id ? null : id)),
    []
  );

  const handleOpenCreate = useCallback(() => {
    setEditingDefect(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((defect) => {
    setEditingDefect(defect);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data) => {
      if (editingDefect) {
        const id = editingDefect.id || editingDefect._id;
        updateMutation.mutate(
          { id, data },
          { onSuccess: () => setFormOpen(false) }
        );
      } else {
        createMutation.mutate(data, {
          onSuccess: () => setFormOpen(false),
        });
      }
    },
    [editingDefect, updateMutation, createMutation]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!confirm("Delete this defect? This action cannot be undone.")) return;
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (selected === id) setSelected(null);
        },
      });
    },
    [deleteMutation, selected]
  );

  const handleSelectRelated = useCallback((id) => {
    setSelected(id);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-amber-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Defect Library</h1>
            <p className="text-sm text-gray-500">
              Reference catalog of all defect types with PACP codes, severity, and recommended actions
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-red-700 hover:bg-red-800 text-white text-xs gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Defect
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, code, PACP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((c) => {
            const Icon = c !== "All" ? getCategoryIcon(c) : Filter;
            const count = c !== "All" ? categoryCounts[c] : null;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  category === c
                    ? "bg-red-700 text-white border-red-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                }`}
              >
                <Icon className="w-3 h-3" />
                {c}
                {count != null && (
                  <Badge
                    variant="secondary"
                    className={`ml-0.5 h-4 min-w-4 px-1 text-[9px] rounded-full ${
                      category === c
                        ? "bg-white/20 text-white border-0"
                        : "bg-gray-100 text-gray-500 border-0"
                    }`}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4">
        {/* List */}
        <div className="flex-1 space-y-2">
          {defects.map((d) => {
            const id = d.id || d._id;
            return (
              <DefectCard
                key={id}
                defect={d}
                isSelected={selected === id}
                onSelect={() => handleSelect(id)}
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.has(id)}
              />
            );
          })}
          {defects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <BookOpen className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No defects found</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedDefect && (
          <div className="w-80 shrink-0">
            <DefectDetail
              defect={selectedDefect}
              relatedDefects={relatedDefects}
              onEdit={handleOpenEdit}
              onSelectRelated={handleSelectRelated}
              personalNote={notes[selected] || ""}
              onSaveNote={saveNote}
            />
            {/* Delete button */}
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                onClick={() => handleDelete(selected)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete Defect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <DefectFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        defect={editingDefect}
        categories={categories.filter((c) => c !== "All")}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
