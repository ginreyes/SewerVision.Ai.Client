"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Copy, BookOpen, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { useDeleteTrainingModule, useDuplicateTrainingModule } from "@/hooks/useQueryHooks";
import { DIFF_COLORS } from "@/components/shared/training/constants";
import ModuleFormModal from "./ModuleFormModal";

/**
 * Admin module management: list all training modules with create/edit/delete.
 * Wraps the existing create/update/delete training hooks (previously wired but
 * never surfaced in an admin UI).
 */
export default function ModulesManager({ modules }) {
  const mods = Array.isArray(modules) ? modules : [];
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const deleteMutation = useDeleteTrainingModule();
  const duplicateMutation = useDuplicateTrainingModule();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (mod) => { setEditing(mod); setModalOpen(true); };

  const handleDuplicate = async (mod) => {
    const id = mod._id || mod.id;
    setDuplicatingId(id);
    try {
      const clone = await duplicateMutation.mutateAsync(id);
      showAlert(`Duplicated "${mod.title}"`, "success");
      // Open the form pre-filled so the admin can edit the copy before saving.
      setEditing(clone);
      setModalOpen(true);
    } catch (e) {
      showAlert(e?.message || "Failed to duplicate module", "error");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = (mod) => {
    showDelete({
      title: `Delete "${mod.title}"?`,
      description: "This training module and its questions will be permanently removed. Existing attempts are kept.",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(mod._id || mod.id);
          showAlert("Module deleted", "success");
        } catch (e) {
          showAlert(e?.message || "Failed to delete module", "error");
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{mods.length} training module{mods.length === 1 ? "" : "s"}</p>
        <Button onClick={openCreate} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 h-9">
          <Plus className="w-4 h-4" /> New Module
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-500" /> Training Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mods.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Difficulty</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Questions</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Pass Score</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {mods.map((mod) => (
                  <tr key={mod._id || mod.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{mod.title}</p>
                      {mod.description && <p className="text-[11px] text-gray-400 line-clamp-1">{mod.description}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{mod.category}</Badge></td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] capitalize ${DIFF_COLORS[mod.difficulty] || ""}`}>{mod.difficulty}</Badge></td>
                    <td className="px-4 py-3 text-center text-xs text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-gray-400" />{mod.questions?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-gray-700">{mod.passingScore || 70}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDuplicate(mod)} title="Duplicate"
                          disabled={duplicatingId === (mod._id || mod.id)}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors">
                          {duplicatingId === (mod._id || mod.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(mod)} title="Edit"
                          className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(mod)} title="Delete"
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No training modules yet</p>
              <p className="text-xs mt-0.5">Create your first module to start assigning training.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ModuleFormModal open={modalOpen} onClose={() => setModalOpen(false)} module={editing} />
    </div>
  );
}
