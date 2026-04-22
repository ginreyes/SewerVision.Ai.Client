"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/helper";

/**
 * Bulk Actions v2 — TanStack mutation hook.
 *
 * entity: 'project' | 'user' | 'report' | 'ticket'  → POST /api/:entityPath/bulk
 *
 * Usage:
 *   const bulk = useBulkMutation('project');
 *   bulk.mutate({ ids: [...], op: 'status', payload: { status: 'on-hold' } });
 *
 * Response shape (backend):
 *   { status: 'success', data: { succeeded: string[], failed: { id, reason }[] } }
 */

const ENTITY_PATH = {
  project: "/api/projects/bulk",
  user: "/api/users/bulk",
  report: "/api/reports/bulk",
  ticket: "/api/support/bulk",
};

const ENTITY_INVALIDATION_KEYS = {
  project: [["projects"], ["adminProjects"], ["userProjects"], ["pipeline"]],
  user: [["users"], ["allUsers"]],
  report: [["reports"], ["userReports"], ["customerReports"]],
  ticket: [["tickets"], ["supportTickets"]],
};

export function useBulkMutation(entity) {
  const qc = useQueryClient();
  const path = ENTITY_PATH[entity];
  const invalidationKeys = ENTITY_INVALIDATION_KEYS[entity] || [];

  return useMutation({
    mutationFn: async ({ ids, op, payload }) => {
      if (!path) throw new Error(`Unsupported bulk entity: ${entity}`);
      const res = await api(path, "POST", { ids, op, payload });
      if (!res.ok) {
        throw new Error(res.data?.message || "Bulk operation failed");
      }
      return res.data?.data || { succeeded: [], failed: [] };
    },
    onSuccess: () => {
      for (const key of invalidationKeys) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}
