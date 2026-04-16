"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";

export const searchKeys = {
  all: ["commandPalette"],
  search: (q, limit) => ["commandPalette", "search", q, limit],
};

/**
 * Hook: useCommandPaletteSearch(query, limit?)
 *
 * Calls the backend role-aware command-palette search endpoint.
 * - 2-character minimum
 * - 60s staleTime (backend also caches 60s)
 * - enabled flag auto-disables when query is empty/short
 */
export function useCommandPaletteSearch(query, limit = 8) {
  const q = (query || "").trim();

  return useQuery({
    queryKey: searchKeys.search(q, limit),
    queryFn: async () => {
      const params = new URLSearchParams({ q, limit: String(limit) });
      const res = await api(`/api/command-palette?${params.toString()}`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Search failed");
      return res.data?.data || { projects: [], users: [], reports: [] };
    },
    enabled: q.length >= 2,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev, // keep previous results while typing
    refetchOnWindowFocus: false,
  });
}
