'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorApi } from '@/data/operatorApi';
import { queryKeys } from './queryKeys';

/**
 * ============ OPERATOR HOOKS ============
 */

/**
 * Hook for fetching operator dashboard statistics
 */
export function useOperatorDashboardStats(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorDashboardStats(operatorId),
        queryFn: () => operatorApi.getDashboardStats(operatorId),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

/**
 * Hook for fetching operator tasks
 */
export function useOperatorTasks(operatorId, status = 'all', options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorTasks(operatorId, status),
        queryFn: () => operatorApi.getTasks(operatorId, status),
        enabled: !!operatorId,
        ...options,
    });
}

/**
 * Hook for fetching operator reports
 */
export function useOperatorReports(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorReports(operatorId),
        queryFn: () => operatorApi.getReports(operatorId),
        enabled: !!operatorId,
        ...options,
    });
}

/**
 * Hook for fetching operations overview
 */
export function useOperatorOverview(options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorOverview,
        queryFn: () => operatorApi.getOverview(),
        ...options,
    });
}

/**
 * Hook for starting device recording
 */
export function useStartRecording() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deviceId) => operatorApi.startRecording(deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator'] });
        },
    });
}

/**
 * Hook for stopping device recording
 */
export function useStopRecording() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (deviceId) => operatorApi.stopRecording(deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator'] });
        },
    });
}

// ── Operator Dashboard extras ──

export function useOperatorTodayEvents(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorTodayEvents(userId),
        queryFn: () => operatorApi.getTodayEvents(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useOperatorAssignedProjects(userId, limit = 10, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorAssignedProjects(userId),
        queryFn: () => operatorApi.getAssignedProjects(userId, limit),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

// ── Operator Calendar ──

export function useOperatorCalendarEvents(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorCalendarEvents(userId),
        queryFn: () => operatorApi.getCalendarEvents(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useOperatorCalendarStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorCalendarStats(userId),
        queryFn: () => operatorApi.getCalendarStatistics(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useCreateOperatorEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => operatorApi.createCalendarEvent(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar'] });
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar-stats'] });
            queryClient.invalidateQueries({ queryKey: ['operator', 'todayEvents'] });
        },
    });
}

export function useUpdateOperatorEventStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, status }) => operatorApi.updateCalendarEventStatus(eventId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar'] });
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar-stats'] });
        },
    });
}

export function useDeleteOperatorEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => operatorApi.deleteCalendarEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar'] });
            queryClient.invalidateQueries({ queryKey: ['operator', 'calendar-stats'] });
            queryClient.invalidateQueries({ queryKey: ['operator', 'todayEvents'] });
        },
    });
}

// ── Operator Projects ──

export function useOperatorProjects(userId, { page = 1, limit = 20, search = '', status = '' } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorProjects(userId, { page, limit, search, status }),
        queryFn: () => operatorApi.getProjects(userId, { page, limit, search, status }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useOperatorProject(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorProject(projectId),
        queryFn: () => operatorApi.getProject(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

// ── Operator Equipment / Devices ──

export function useOperatorDevices(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorDevices(operatorId),
        queryFn: () => operatorApi.getDevices(operatorId),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useReportDeviceStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, data }) => operatorApi.reportDeviceStatus(deviceId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator', 'devices'] });
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
    });
}

// ── Operator Operations ──

export function useOperatorUploads(limit = 10, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorUploads(limit),
        queryFn: () => operatorApi.getUploads(limit),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useStartOperationsRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (deviceId) => operatorApi.startOperationsRecording(deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator'] });
        },
    });
}

export function useStopOperationsRecording() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (deviceId) => operatorApi.stopOperationsRecording(deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator'] });
        },
    });
}

// ── Operator Reports ──

export function useCreateOperatorReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reportData) => operatorApi.createReport(reportData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operator', 'reports'] });
        },
    });
}

export function useOperatorAllProjects(options = {}) {
    return useQuery({
        queryKey: ['operator', 'allProjects'],
        queryFn: () => operatorApi.getAllProjectsForReports(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

// ── Operator Logs ──

export function useOperatorLogs(username, limit = 100, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorLogs(username),
        queryFn: () => operatorApi.getInspectionLogs(username, limit),
        enabled: !!username,
        staleTime: 1000 * 30,
        ...options,
    });
}

// ── Operator Settings ──

export function useUpdateOperatorProfile() {
    return useMutation({
        mutationFn: ({ username, data }) => operatorApi.updateProfile(username, data),
    });
}

export function useChangeOperatorPassword() {
    return useMutation({
        mutationFn: (data) => operatorApi.changePassword(data),
    });
}

export function useSaveOperatorSettings() {
    return useMutation({
        mutationFn: (settings) => operatorApi.saveSettings(settings),
    });
}

// ── Operator Notifications ──

export function useOperatorNotificationPreferences(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorNotificationPreferences(userId),
        queryFn: () => operatorApi.getNotificationPreferences(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

export function useUpdateOperatorNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, preferences }) => operatorApi.updateNotificationPreferences(userId, preferences),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.operatorNotificationPreferences(userId) });
        },
    });
}

// ── Operator New Module Hooks ──

export function useOperatorChecklists(operatorId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorChecklists(operatorId, filters),
        queryFn: () => operatorApi.getChecklists(operatorId, filters),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useCreateChecklist() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => operatorApi.createChecklist(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'checklists'] }) });
}
export function useToggleChecklistItem() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ checklistId, itemIndex }) => operatorApi.toggleChecklistItem(checklistId, itemIndex), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'checklists'] }) });
}
export function useDeleteChecklist() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => operatorApi.deleteChecklist(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'checklists'] }) });
}

export function useOperatorRouteSites(operatorId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorRouteSites(operatorId, filters),
        queryFn: () => operatorApi.getRouteSites(operatorId, filters),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useCompleteRouteSite() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => operatorApi.completeRouteSite(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'route-sites'] }) });
}

export function useOperatorIncidents(operatorId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorIncidents(operatorId, filters),
        queryFn: () => operatorApi.getIncidents(operatorId, filters),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useCreateIncident() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => operatorApi.createIncident(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'incidents'] }) });
}
export function useUpdateIncident() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, ...data }) => operatorApi.updateIncident(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['operator', 'incidents'] }) });
}

export function useOperatorTimeEntries(operatorId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorTimeEntries(operatorId, filters),
        queryFn: () => operatorApi.getTimeEntries(operatorId, filters),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useOperatorTimeSummary(operatorId, weekOf, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorTimeSummary(operatorId, weekOf),
        queryFn: () => operatorApi.getTimeSummary(operatorId, weekOf),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
export function useCreateTimeEntry() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => operatorApi.createTimeEntry(data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['operator', 'time-entries'] }); qc.invalidateQueries({ queryKey: ['operator', 'time-summary'] }); } });
}
export function useDeleteTimeEntry() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => operatorApi.deleteTimeEntry(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['operator', 'time-entries'] }); qc.invalidateQueries({ queryKey: ['operator', 'time-summary'] }); } });
}

export function useOperatorCachedItems(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorCachedItems(operatorId),
        queryFn: () => operatorApi.getCachedItems(operatorId),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
export function useOperatorPendingSyncs(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorPendingSyncs(operatorId),
        queryFn: () => operatorApi.getPendingSyncs(operatorId),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
export function useOperatorOfflineStats(operatorId, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorOfflineStats(operatorId),
        queryFn: () => operatorApi.getOfflineStats(operatorId),
        enabled: !!operatorId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
export function useToggleCache() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (cacheId) => operatorApi.toggleCache(cacheId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['operator', 'cached-items'] }); qc.invalidateQueries({ queryKey: ['operator', 'offline-stats'] }); } });
}
export function useSyncAll() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (operatorId) => operatorApi.syncAll(operatorId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['operator', 'pending-syncs'] }); qc.invalidateQueries({ queryKey: ['operator', 'offline-stats'] }); } });
}

/**
 * Shift handoff list — the operator's own outgoing handoffs PLUS any
 * incoming handoffs a teammate left for them. The hook does not pass an
 * operatorId to the API because the backend scopes results to the caller's
 * own user id (an operator can only ever see their own handoffs anyway).
 *
 * The operatorId arg here is only used as part of the query key so React
 * Query invalidates per-user when the logged-in user changes.
 */
export function useOperatorRecentShiftHandoffs(operatorId, limit = 10, options = {}) {
    return useQuery({
        queryKey: queryKeys.operatorRecentShiftHandoffs(operatorId, limit),
        queryFn: () => operatorApi.getRecentShiftHandoffs(limit),
        enabled: !!operatorId,
        staleTime: 1000 * 60,
        ...options,
    });
}
