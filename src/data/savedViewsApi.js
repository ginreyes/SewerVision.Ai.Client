"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/helper";

// ─── Query Keys ──────────────────────────────────────────────────────────

export const savedViewKeys = {
  all: ["savedViews"],
  list: (entityType) => ["savedViews", "list", entityType],
  detail: (id) => ["savedViews", "detail", id],
};

// ─── Queries ─────────────────────────────────────────────────────────────

/**
 * List all saved views the user has access to (owned, shared, public) for a
 * given entityType. Returns { views, grouped: { mine, shared, public } }.
 */
export function useSavedViews(entityType = "project", options = {}) {
  return useQuery({
    queryKey: savedViewKeys.list(entityType),
    queryFn: async () => {
      const res = await api(`/api/saved-views?entityType=${entityType}`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to load saved views");
      return res.data?.data || { views: [], grouped: { mine: [], shared: [], public: [] } };
    },
    staleTime: 120_000,
    ...options,
  });
}

/**
 * Fetch a single saved view by id. Useful when deep-linking.
 */
export function useSavedView(id) {
  return useQuery({
    queryKey: savedViewKeys.detail(id),
    queryFn: async () => {
      const res = await api(`/api/saved-views/${id}`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to load saved view");
      return res.data?.data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────

export function useCreateSavedView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api("/api/saved-views", "POST", payload);
      if (!res.ok) throw new Error(res.data?.message || "Failed to create saved view");
      return res.data?.data;
    },
    onSuccess: (data) => {
      if (data?.entityType) {
        qc.invalidateQueries({ queryKey: savedViewKeys.list(data.entityType) });
      } else {
        qc.invalidateQueries({ queryKey: savedViewKeys.all });
      }
    },
  });
}

export function useUpdateSavedView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await api(`/api/saved-views/${id}`, "PATCH", payload);
      if (!res.ok) throw new Error(res.data?.message || "Failed to update saved view");
      return res.data?.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: savedViewKeys.all });
      if (data?._id) {
        qc.invalidateQueries({ queryKey: savedViewKeys.detail(data._id) });
      }
    },
  });
}

export function useDeleteSavedView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api(`/api/saved-views/${id}`, "DELETE");
      if (!res.ok) throw new Error(res.data?.message || "Failed to delete saved view");
      return res.data?.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savedViewKeys.all });
    },
  });
}

export function useDuplicateSavedView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api(`/api/saved-views/${id}/duplicate`, "POST");
      if (!res.ok) throw new Error(res.data?.message || "Failed to duplicate saved view");
      return res.data?.data;
    },
    onSuccess: (data) => {
      if (data?.entityType) {
        qc.invalidateQueries({ queryKey: savedViewKeys.list(data.entityType) });
      }
    },
  });
}

/**
 * Track that a view was applied. Fires best-effort — failures are swallowed
 * since this is a telemetry-only endpoint.
 */
export function useTrackSavedViewUsage() {
  return useMutation({
    mutationFn: async (id) => {
      try {
        await api(`/api/saved-views/${id}/apply`, "POST");
      } catch {
        // ignore
      }
    },
  });
}
