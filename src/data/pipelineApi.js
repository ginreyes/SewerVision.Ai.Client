"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/helper";

// ── Query Keys ──
export const pipelineKeys = {
  all: ["pipeline"],
  board: (filters) => ["pipeline", "board", filters],
  analytics: (managerId) => ["pipeline", "analytics", managerId],
  summary: (projectId) => ["pipeline", "summary", projectId],
  activityFeed: (projectId, page) => ["pipeline", "activity", projectId, page],
  findingSummary: (projectId) => ["pipeline", "findings", projectId],
  forecast: (projectId) => ["pipeline", "forecast", projectId],
  reviewQueue: (userId) => ["pipeline", "review-queue", userId],
  reviewProgress: (projectId) => ["pipeline", "review-progress", projectId],
  teamWorkload: (managerId) => ["pipeline", "team-workload", managerId],
  slaStatus: (managerId) => ["pipeline", "sla-status", managerId],
  slaCompliance: () => ["pipeline", "sla-compliance"],
  weeklyDigest: (managerId) => ["pipeline", "weekly-digest", managerId],
  myActive: (userId) => ["pipeline", "my-active", userId],
  needsAttention: () => ["pipeline", "needs-attention"],
};

// ── Query Hooks ──

/**
 * Fetch the pipeline board (paginated, filterable by manager / customer)
 */
export function usePipeline({ managerId, customerId, page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: pipelineKeys.board({ managerId, customerId, page, limit }),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/pipeline?page=${page}&limit=${limit}${managerId ? `&managerId=${managerId}` : ""}${customerId ? `&customerId=${customerId}` : ""}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch pipeline");
      return res.data;
    },
    staleTime: 60_000,
    enabled: true,
  });
}

/**
 * Pipeline analytics (optionally scoped to a manager)
 */
export function usePipelineAnalytics(managerId) {
  return useQuery({
    queryKey: pipelineKeys.analytics(managerId),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/pipeline/analytics${managerId ? `?managerId=${managerId}` : ""}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch pipeline analytics");
      return res.data;
    },
    staleTime: 120_000,
  });
}

/**
 * Summary for a single project
 */
export function useProjectSummary(projectId) {
  return useQuery({
    queryKey: pipelineKeys.summary(projectId),
    queryFn: async () => {
      const res = await api(`/api/project-pipeline/${projectId}/summary`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch project summary");
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Activity feed for a project (paginated)
 */
export function useActivityFeed(projectId, { page = 1, limit = 20 } = {}) {
  return useQuery({
    queryKey: pipelineKeys.activityFeed(projectId, page),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/${projectId}/activity-feed?page=${page}&limit=${limit}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch activity feed");
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

/**
 * Finding summary for a project
 */
export function useFindingSummary(projectId) {
  return useQuery({
    queryKey: pipelineKeys.findingSummary(projectId),
    queryFn: async () => {
      const res = await api(`/api/project-pipeline/${projectId}/finding-summary`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch finding summary");
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

/**
 * Forecast for a project
 */
export function useProjectForecast(projectId) {
  return useQuery({
    queryKey: pipelineKeys.forecast(projectId),
    queryFn: async () => {
      const res = await api(`/api/project-pipeline/${projectId}/forecast`, "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch project forecast");
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 300_000,
  });
}

/**
 * Team workload for a manager
 */
export function useTeamWorkload(managerId) {
  return useQuery({
    queryKey: pipelineKeys.teamWorkload(managerId),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/team-workload?managerId=${managerId}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch team workload");
      return res.data;
    },
    enabled: !!managerId,
    staleTime: 60_000,
  });
}

/**
 * SLA status (optionally scoped to a manager)
 */
export function useSLAStatus(managerId) {
  return useQuery({
    queryKey: pipelineKeys.slaStatus(managerId),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/sla-status${managerId ? `?managerId=${managerId}` : ""}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch SLA status");
      return res.data;
    },
    staleTime: 60_000,
  });
}

/**
 * SLA compliance (global)
 */
export function useSLACompliance() {
  return useQuery({
    queryKey: pipelineKeys.slaCompliance(),
    queryFn: async () => {
      const res = await api("/api/project-pipeline/sla-compliance", "GET");
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch SLA compliance");
      return res.data;
    },
    staleTime: 300_000,
  });
}

/**
 * Weekly digest for a manager
 */
export function useWeeklyDigest(managerId) {
  return useQuery({
    queryKey: pipelineKeys.weeklyDigest(managerId),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/weekly-digest${managerId ? `?managerId=${managerId}` : ""}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch weekly digest");
      return res.data;
    },
    enabled: !!managerId,
    staleTime: 300_000,
  });
}

/**
 * Active projects for the current user
 */
export function useMyActiveProjects(userId, statuses = "field-capture,uploading") {
  return useQuery({
    queryKey: pipelineKeys.myActive(userId),
    queryFn: async () => {
      const res = await api(
        `/api/project-pipeline/my-active?userId=${userId}&statuses=${statuses}`,
        "GET",
      );
      if (!res.ok) throw new Error(res.data?.message || "Failed to fetch active projects");
      return res.data;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ── Mutation Hooks ──

/**
 * Batch-update status for multiple projects
 */
export function useBatchUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectIds, status, userId }) => {
      const res = await api("/api/project-pipeline/batch/status", "PUT", {
        projectIds,
        status,
        userId,
      });
      if (!res.ok) throw new Error(res.data?.message || "Failed to batch update status");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}

/**
 * Batch-assign a field (e.g. operator, QC tech) to multiple projects
 */
export function useBatchAssign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectIds, field, userId, userName, userEmail }) => {
      const res = await api("/api/project-pipeline/batch/assign", "PUT", {
        projectIds,
        field,
        userId,
        userName,
        userEmail,
      });
      if (!res.ok) throw new Error(res.data?.message || "Failed to batch assign");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}

/**
 * Create an activity entry on a project
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, type, message, userId, metadata }) => {
      const res = await api(`/api/project-pipeline/${projectId}/activity`, "POST", {
        type,
        message,
        userId,
        metadata,
      });
      if (!res.ok) throw new Error(res.data?.message || "Failed to create activity");
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.activityFeed(variables.projectId, undefined),
      });
    },
  });
}

/**
 * Submit feedback for a detection / finding
 */
export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, detectionId, customerId, rating, comment }) => {
      const res = await api(`/api/project-pipeline/${projectId}/feedback`, "POST", {
        detectionId,
        customerId,
        rating,
        comment,
      });
      if (!res.ok) throw new Error(res.data?.message || "Failed to create feedback");
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pipelineKeys.findingSummary(variables.projectId),
      });
    },
  });
}

/**
 * Escalate a project
 */
export function useEscalateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, reason, notes, escalatedBy }) => {
      const res = await api(`/api/project-pipeline/${projectId}/escalate`, "POST", {
        reason,
        notes,
        escalatedBy,
      });
      if (!res.ok) throw new Error(res.data?.message || "Failed to escalate project");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}
