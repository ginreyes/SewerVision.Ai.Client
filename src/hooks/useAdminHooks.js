'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import reportsApi from '@/data/reportsApi';
import { uploadsApi } from '@/data/uploadsApi';
import { devicesApi } from '@/data/devicesApi';
import { maintenanceApi } from '@/data/maintenanceApi';
import { api } from '@/lib/helper';
import { queryKeys } from './queryKeys';

/**
 * ============ DASHBOARD HOOKS ============
 */

/**
 * Hook for fetching admin dashboard statistics
 */
export function useDashboardStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.dashboardStats,
        queryFn: () => dashboardApi.getDashboardStats(),
        staleTime: 1000 * 60 * 2, // 2 minutes for dashboard
        ...options,
    });
}

/**
 * ============ ADMIN UPLOADS HOOKS ============
 */

export function useAdminUploads(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.adminUploads(params),
        queryFn: () => uploadsApi.getAllUploads(params),
        staleTime: 1000 * 30, // uploads list changes fairly often
        ...options,
    });
}

export function useAdminUploadStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.adminUploadStats,
        queryFn: () => uploadsApi.getSystemStats(),
        staleTime: 1000 * 30,
        ...options,
    });
}

/**
 * ============ ADMIN REPORTS HOOKS ============
 */

export function useAdminReports(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.adminReports(filters),
        queryFn: () => reportsApi.getReports(filters),
        ...options,
    });
}

export function useAdminReport(reportId, options = {}) {
    return useQuery({
        queryKey: queryKeys.adminReport(reportId),
        queryFn: () => reportsApi.getReportById(reportId),
        enabled: !!reportId,
        ...options,
    });
}

/**
 * ============ ADMIN — USERS, PERMISSIONS, CALENDAR, PROJECTS ============
 */

/**
 * Fetch all users. Backend returns { users: [...], pagination: {...}, stats?: {...} }.
 * This hook returns the FULL response object so callers can access .users, .pagination, .stats.
 */
export function useAllUsers(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.allUsers(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.page) params.set('page', filters.page);
            if (filters.limit) params.set('limit', filters.limit || '999');
            if (filters.search) params.set('search', filters.search);
            if (filters.role) params.set('role', filters.role);
            if (filters.status) params.set('status', filters.status);
            const qs = params.toString();
            const { data } = await api(`/api/users/get-all-user${qs ? '?' + qs : '?limit=999'}`);
            // Backend returns { users: [...], pagination, stats }
            return data || { users: [] };
        },
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useCustomers(options = {}) {
    return useQuery({
        queryKey: queryKeys.customers,
        queryFn: async () => {
            const { data } = await api('/api/users/get-customers');
            return data?.data || data || [];
        },
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function usePermissionLevels(role, options = {}) {
    return useQuery({
        queryKey: queryKeys.permissionLevels(role),
        queryFn: async () => {
            const params = role ? `?role=${role}` : '';
            const { data } = await api(`/api/permission-levels${params}`);
            const raw = data?.data || data;
            return Array.isArray(raw) ? raw : [];
        },
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function usePermissionModules(role, options = {}) {
    return useQuery({
        queryKey: queryKeys.permissionModules(role),
        queryFn: async () => {
            const res = await api(`/api/permission-levels/modules/${role}`);
            if (!res.ok) {
                const msg = res.data?.message || res.data?.error || `HTTP ${res.status}`;
                throw new Error(msg);
            }
            const raw = res.data?.data ?? res.data;
            // Guarantee array — the component iterates this directly
            return Array.isArray(raw) ? raw : [];
        },
        enabled: !!role,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        ...options,
    });
}

export function useCreatePermissionLevel() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            const res = await api('/api/permission-levels', 'POST', data);
            if (!res.ok) throw new Error(res.data?.message || 'Failed to create permission level');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'permission-levels'] });
        },
    });
}

export function useUpdatePermissionLevel() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api(`/api/permission-levels/${id}`, 'PUT', data);
            if (!res.ok) throw new Error(res.data?.message || 'Failed to update permission level');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'permission-levels'] });
        },
    });
}

export function useDeletePermissionLevel() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await api(`/api/permission-levels/${id}`, 'DELETE');
            if (!res.ok) throw new Error(res.data?.message || 'Failed to delete permission level');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'permission-levels'] });
        },
    });
}

export function useAdminCalendarEvents(options = {}) {
    return useQuery({
        queryKey: queryKeys.calendarEvents,
        queryFn: async () => {
            const { data } = await api('/api/calendar/get-event');
            return Array.isArray(data) ? data : data?.data || [];
        },
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useCreateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventData) => {
            const res = await api('/api/calendar/create-event', 'POST', eventData);
            if (!res.ok) throw new Error(res.data?.message || 'Failed to create event');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
        },
    });
}

export function useUpdateCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api(`/api/calendar/update-event/${id}`, 'PATCH', data);
            if (!res.ok) throw new Error(res.data?.message || 'Failed to update event');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
        },
    });
}

export function useDeleteCalendarEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await api(`/api/calendar/delete-event/${id}`, 'DELETE');
            if (!res.ok) throw new Error(res.data?.message || 'Failed to delete event');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents });
        },
    });
}

export function useAdminProjects(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.adminProjects(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.page) params.set('page', filters.page);
            if (filters.limit) params.set('limit', filters.limit);
            if (filters.search) params.set('search', filters.search);
            if (filters.status) params.set('status', filters.status);
            const qs = params.toString();
            const { data } = await api(`/api/projects/get-all-projects${qs ? '?' + qs : ''}`);
            return data || {};
        },
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (projectData) => {
            const res = await api('/api/projects/create-project', 'POST', projectData);
            if (!res.ok) throw new Error(res.data?.message || 'Failed to create project');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

/**
 * ============ DEVICES HOOKS (Admin) ============
 */

export function useDevices(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.devices(params),
        queryFn: () => devicesApi.getDevices(params),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useDevice(deviceId, options = {}) {
    return useQuery({
        queryKey: queryKeys.device(deviceId),
        queryFn: () => devicesApi.getDeviceById(deviceId),
        enabled: !!deviceId,
        ...options,
    });
}

export function useCreateDevice(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => devicesApi.createDevice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
        ...options,
    });
}

export function useUpdateDevice(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => devicesApi.updateDevice(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.device(variables.id) });
        },
        ...options,
    });
}

export function useDeleteDevice(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => devicesApi.deleteDevice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
        ...options,
    });
}

export function useAssignDeviceToTeamLeader(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, teamLeaderId }) =>
            devicesApi.assignToTeamLeader(deviceId, teamLeaderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
        ...options,
    });
}

/**
 * ============ MUTATION HOOKS (Admin uploads & reports) ============
 */

export function useBulkUploadAction(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ action, uploadIds }) => uploadsApi.bulkAction(action, uploadIds),
        onSuccess: () => {
            // Refresh admin uploads lists and stats
            queryClient.invalidateQueries({ queryKey: ['admin', 'uploads'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.adminUploadStats });
        },
        ...options,
    });
}

export function useUpdateReport(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, data }) => reportsApi.updateReport(reportId, data),
        onSuccess: (_data, variables) => {
            // Refresh specific report and any admin reports lists
            queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(variables.reportId) });
            queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
        },
        ...options,
    });
}

// ── Maintenance Hooks ──

export function useMaintenanceOverview(options = {}) {
    return useQuery({
        queryKey: queryKeys.maintenanceOverview(),
        queryFn: async () => {
            const response = await maintenanceApi.getOverview();
            if (response.error) throw new Error(response.error);
            return response.data?.data ?? response.data;
        },
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useRefreshMaintenanceSystems() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => maintenanceApi.refreshSystems(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceOverview() });
        },
    });
}

export function useDismissMaintenanceAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alertId) => maintenanceApi.deleteAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceOverview() });
        },
    });
}

// ── Admin Analytics ──

export function useAdminAnalytics(options = {}) {
    return useQuery({
        queryKey: queryKeys.adminAnalytics,
        queryFn: () => dashboardApi.getAnalyticsOverview(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}
