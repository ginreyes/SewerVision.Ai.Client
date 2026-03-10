'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import { qcApi } from '@/data/qcApi';
import { notesApi } from '@/data/notesApi';
import { reportsApi } from '@/data/reportsApi';
import { settingsApi } from '@/data/settingsApi';
import { uploadsApi } from '@/data/uploadsApi';
import { operatorApi } from '@/data/operatorApi';
import { devicesApi } from '@/data/devicesApi';
import notificationApi from '@/data/notificationApi ';
import { customerApi } from '@/data/customerApi';

/**
 * Query Keys - Centralized key management for cache invalidation
 */
export const queryKeys = {
    // Dashboard
    dashboardStats: ['dashboard', 'stats'],

    // QC Technician
    qcDashboardStats: (qcTechnicianId) => ['qc', 'dashboard', qcTechnicianId],
    qcAssignments: (qcTechnicianId, status) => ['qc', 'assignments', qcTechnicianId, status],
    qcAssignment: (assignmentId) => ['qc', 'assignment', assignmentId],
    qcDetections: (projectId, qcStatus) => ['qc', 'detections', projectId, qcStatus],
    qcDetection: (detectionId) => ['qc', 'detection', detectionId],
    qcDetectionComments: (detectionId) => ['qc', 'detection', detectionId, 'comments'],
    qcCertifications: (qcTechnicianId) => ['qc', 'certifications', qcTechnicianId],
    qcReports: (qcTechnicianId) => ['qc', 'reports', qcTechnicianId],
    qcReportByProject: (projectId, qcTechnicianId) => ['qc', 'report', projectId, qcTechnicianId],

    // Operator
    operatorDashboardStats: (operatorId) => ['operator', 'dashboard', operatorId],
    operatorTasks: (operatorId, status) => ['operator', 'tasks', operatorId, status],
    operatorReports: (operatorId) => ['operator', 'reports', operatorId],
    operatorOverview: ['operator', 'overview'],

    // Notes
    notes: (userId, filters) => ['notes', userId, filters],
    note: (noteId) => ['notes', 'detail', noteId],
    notesStats: (userId) => ['notes', 'stats', userId],

    // Reports
    reportTemplates: ['reports', 'templates'],
    reportTemplate: (templateId) => ['reports', 'template', templateId],
    reportAnalytics: (projectId) => ['reports', 'analytics', projectId],

    // Settings  
    userSettings: (userId) => ['settings', userId],
    userPreferences: (userId) => ['settings', 'preferences', userId],

    // Projects (shared)
    projects: ['projects'],
    project: (projectId) => ['projects', projectId],
    projectMedia: (projectId) => ['projects', projectId, 'media'],
    projectVideos: (projectId) => ['projects', projectId, 'videos'],

    // Admin uploads
    adminUploads: (params) => ['admin', 'uploads', params ?? {}],
    adminUploadStats: ['admin', 'uploads', 'stats'],

    // Admin reports
    adminReports: (filters) => ['admin', 'reports', filters ?? {}],
    adminReport: (reportId) => ['admin', 'report', reportId],

    // Admin maintenance tasks
    adminTasks: (filters) => ['admin', 'tasks', filters ?? {}],
    adminTask: (taskId) => ['admin', 'task', taskId],

    // User inbox / notifications
    userInbox: (userId, filters) => ['user', 'inbox', userId, filters ?? {}],
    userUnreadCount: (userId) => ['user', 'inbox', userId, 'unread-count'],

    // Customer views
    customerDashboard: (customerId) => ['customer', 'dashboard', customerId],
    customerProjects: (customerId, filters) => ['customer', 'projects', customerId, filters ?? {}],
    customerProject: (projectId, userId) => ['customer', 'project', projectId, userId],
    customerObservations: (projectId) => ['customer', 'observations', projectId],
    customerSnapshots: (projectId) => ['customer', 'snapshots', projectId],
    customerReports: (userId) => ['customer', 'reports', userId],
    customerReport: (userId, reportId) => ['customer', 'report', userId, reportId],
    customerNotifications: (userId) => ['customer', 'notifications', userId],
    customerNotificationPreferences: (userId) => ['customer', 'notification-preferences', userId],

    // Devices (admin)
    devices: (params) => ['devices', params ?? {}],
    device: (deviceId) => ['devices', deviceId],
};

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

/**
 * ============ QC TECHNICIAN HOOKS ============
 */

/**
 * Hook for fetching QC dashboard statistics
 */
export function useQCDashboardStats(qcTechnicianId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcDashboardStats(qcTechnicianId),
        queryFn: () => qcApi.getDashboardStats(qcTechnicianId),
        enabled: !!qcTechnicianId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

/**
 * Hook for fetching QC assignments
 */
export function useQCAssignments(qcTechnicianId, status = 'all', options = {}) {
    return useQuery({
        queryKey: queryKeys.qcAssignments(qcTechnicianId, status),
        queryFn: () => qcApi.getAssignments(qcTechnicianId, status),
        enabled: !!qcTechnicianId,
        ...options,
    });
}

/**
 * Hook for fetching a single QC assignment
 */
export function useQCAssignment(assignmentId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcAssignment(assignmentId),
        queryFn: () => qcApi.getAssignmentById(assignmentId),
        enabled: !!assignmentId,
        ...options,
    });
}

/**
 * Hook for fetching a single project (by ID)
 */
export function useProject(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.project(projectId),
        queryFn: () => qcApi.getProject(projectId),
        enabled: !!projectId,
        ...options,
    });
}

/**
 * Hook for fetching project videos
 */
export function useProjectVideos(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.projectVideos(projectId),
        queryFn: () => qcApi.getProjectVideos(projectId),
        enabled: !!projectId,
        ...options,
    });
}

/**
 * Hook for fetching project detections
 */
export function useProjectDetections(projectId, qcStatus = 'all', options = {}) {
    return useQuery({
        queryKey: queryKeys.qcDetections(projectId, qcStatus),
        queryFn: () => qcApi.getProjectDetections(projectId, qcStatus),
        enabled: !!projectId,
        ...options,
    });
}

/**
 * Hook for fetching a single detection
 */
export function useDetection(detectionId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcDetection(detectionId),
        queryFn: () => qcApi.getDetectionById(detectionId),
        enabled: !!detectionId,
        ...options,
    });
}

/**
 * Hook for fetching detection comments
 */
export function useDetectionComments(detectionId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcDetectionComments(detectionId),
        queryFn: () => qcApi.getDetectionComments(detectionId),
        enabled: !!detectionId,
        ...options,
    });
}

/**
 * Hook for reviewing a detection (approve/reject/modify)
 */
export function useReviewDetection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ detectionId, reviewData }) =>
            qcApi.reviewDetection(detectionId, reviewData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['qc', 'detection', variables.detectionId] });
            queryClient.invalidateQueries({ queryKey: ['qc', 'detections'] });
            queryClient.invalidateQueries({ queryKey: ['qc', 'dashboard'] });
        },
    });
}

/**
 * Hook for creating a manual detection
 */
export function useCreateManualDetection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ projectId, payload }) => qcApi.createManualDetection(projectId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.qcDetections(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: ['qc', 'detections'] });
        },
    });
}

/**
 * Hook for completing a QC assignment
 */
export function useCompleteQCAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId) => qcApi.completeAssignment(projectId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['qc', 'assignments'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.project(variables) });
        },
    });
}

/**
 * Hook for starting a QC session
 */
export function useStartQCSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionData) => qcApi.startQCSession(sessionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qc'] });
        },
    });
}

/**
 * Hook for ending a QC session
 */
export function useEndQCSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId) => qcApi.endQCSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qc'] });
        },
    });
}

/**
 * Hook for adding a comment to a detection
 */
export function useAddDetectionComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentData) => qcApi.addDetectionComment(commentData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.qcDetectionComments(variables.detectionId)
            });
        },
    });
}

/**
 * Hook for fetching QC certifications
 */
export function useQCCertifications(qcTechnicianId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcCertifications(qcTechnicianId),
        queryFn: () => qcApi.getCertifications(qcTechnicianId),
        enabled: !!qcTechnicianId,
        ...options,
    });
}

/**
 * Hook for creating a certification
 */
export function useCreateCertification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ qcTechnicianId, certificationData }) =>
            qcApi.createCertification(qcTechnicianId, certificationData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.qcCertifications(variables.qcTechnicianId)
            });
        },
    });
}

/**
 * Hook for fetching QC reports list
 */
export function useQCReports(qcTechnicianId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcReports(qcTechnicianId),
        queryFn: () => qcApi.getReportsList(qcTechnicianId),
        enabled: !!qcTechnicianId,
        ...options,
    });
}

/**
 * Hook for fetching a QC report by project
 */
export function useQCReportByProject(projectId, qcTechnicianId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcReportByProject(projectId, qcTechnicianId),
        queryFn: () => qcApi.getReportByProject(projectId, qcTechnicianId),
        enabled: !!projectId && !!qcTechnicianId,
        ...options,
    });
}

/**
 * ============ NOTES HOOKS ============
 */

/**
 * Hook for fetching notes
 */
export function useNotes(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.notes(userId, filters),
        queryFn: () => qcApi.getNotes(userId, filters),
        enabled: !!userId,
        ...options,
    });
}

/**
 * Hook for fetching a single note
 */
export function useNote(noteId, userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.note(noteId),
        queryFn: () => qcApi.getNoteById(noteId, userId),
        enabled: !!noteId,
        ...options,
    });
}

/**
 * Hook for fetching notes statistics
 */
export function useNotesStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.notesStats(userId),
        queryFn: () => qcApi.getNotesStats(userId),
        enabled: !!userId,
        ...options,
    });
}

/**
 * Hook for creating a note
 */
export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteData) => qcApi.createNote(noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
}

/**
 * Hook for updating a note
 */
export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, noteData }) => qcApi.updateNote(noteId, noteData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.note(variables.noteId) });
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
}

/**
 * Hook for deleting a note
 */
export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, userId }) => qcApi.deleteNote(noteId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
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
 * ============ USER INBOX HOOKS ============
 */

export function useUserInbox(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userInbox(userId, filters),
        queryFn: () => notificationApi.getNotifications(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 10,
        ...options,
    });
}

export function useUserUnreadCount(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userUnreadCount(userId),
        queryFn: () => notificationApi.getUnreadCount(userId),
        enabled: !!userId,
        staleTime: 1000 * 10,
        ...options,
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

/**
 * ============ CACHE UTILITIES ============
 */

/**
 * Hook for prefetching and cache management
 */
export function useQueryUtilities() {
    const queryClient = useQueryClient();

    return {
        /**
         * Prefetch dashboard stats
         */
        prefetchDashboardStats: () => {
            queryClient.prefetchQuery({
                queryKey: queryKeys.dashboardStats,
                queryFn: () => dashboardApi.getDashboardStats(),
            });
        },

        /**
         * Prefetch QC dashboard stats
         */
        prefetchQCDashboardStats: (qcTechnicianId) => {
            if (qcTechnicianId) {
                queryClient.prefetchQuery({
                    queryKey: queryKeys.qcDashboardStats(qcTechnicianId),
                    queryFn: () => qcApi.getDashboardStats(qcTechnicianId),
                });
            }
        },

        /**
         * Invalidate all queries matching a key pattern
         */
        invalidateQueries: (keyPattern) => {
            queryClient.invalidateQueries({ queryKey: keyPattern });
        },

        /**
         * Clear all cached data
         */
        clearAllCache: () => {
            queryClient.clear();
        },

        /**
         * Get cached data without refetching
         */
        getCachedData: (queryKey) => {
            return queryClient.getQueryData(queryKey);
        },

        /**
         * Set data directly in cache
         */
        setCachedData: (queryKey, data) => {
            queryClient.setQueryData(queryKey, data);
        },

        /**
         * Refetch specific query
         */
        refetchQuery: (queryKey) => {
            queryClient.refetchQueries({ queryKey });
        },
    };
}

/**
 * ============ CUSTOMER HOOKS ============
 */

/**
 * Hook for fetching all customer projects
 */
export function useCustomerProjects(userId, { page = 1, limit = 100, status = '' } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerProjects(userId, { page, limit, status }),
        queryFn: () => customerApi.getAllProjects(userId, { page, limit, status }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching a single customer project
 */
export function useCustomerProject(projectId, userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerProject(projectId, userId),
        queryFn: () => customerApi.getProject(projectId, userId),
        enabled: !!projectId && !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching project observations/defects
 */
export function useCustomerObservations(projectId, { limit = 100 } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerObservations(projectId),
        queryFn: () => customerApi.getProjectObservations(projectId, { limit }),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching project snapshots
 */
export function useCustomerSnapshots(projectId, { limit = 100 } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerSnapshots(projectId),
        queryFn: () => customerApi.getProjectSnapshots(projectId, { limit }),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching all customer reports
 */
export function useCustomerReports(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerReports(userId),
        queryFn: () => customerApi.getAllReports(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching a single report
 */
export function useCustomerReport(userId, reportId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerReport(userId, reportId),
        queryFn: () => customerApi.getReport(userId, reportId),
        enabled: !!userId && !!reportId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook for fetching customer notifications
 */
export function useCustomerNotifications(userId, { limit = 50 } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerNotifications(userId),
        queryFn: () => customerApi.getNotifications(userId, { limit }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

/**
 * Hook for fetching notification preferences
 */
export function useCustomerNotificationPreferences(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerNotificationPreferences(userId),
        queryFn: () => customerApi.getNotificationPreferences(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

/**
 * Mutation: Mark a single notification as read
 */
export function useMarkCustomerNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ notificationId, userId }) =>
            customerApi.markNotificationRead(notificationId, userId),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerNotifications(userId) });
        },
    });
}

/**
 * Mutation: Mark all notifications as read
 */
export function useMarkAllCustomerNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId }) => customerApi.markAllNotificationsRead(userId),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerNotifications(userId) });
        },
    });
}

/**
 * Mutation: Delete a notification
 */
export function useDeleteCustomerNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ notificationId, userId }) =>
            customerApi.deleteNotification(notificationId, userId),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerNotifications(userId) });
        },
    });
}

/**
 * Mutation: Update notification preferences
 */
export function useUpdateCustomerNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, preferences }) =>
            customerApi.updateNotificationPreferences(userId, preferences),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerNotificationPreferences(userId) });
        },
    });
}

/**
 * Mutation: Submit support ticket
 */
export function useSubmitCustomerSupportTicket() {
    return useMutation({
        mutationFn: ({ userId, subject, category, message }) =>
            customerApi.submitSupportTicket(userId, { subject, category, message }),
    });
}

/**
 * Mutation: Download project report
 */
export function useDownloadCustomerReport() {
    return useMutation({
        mutationFn: ({ projectId, userId }) =>
            customerApi.downloadReport(projectId, userId),
    });
}

export default {
    useDashboardStats,
    useQCDashboardStats,
    useQCAssignments,
    useQCAssignment,
    useProject,
    useProjectVideos,
    useProjectDetections,
    useDetection,
    useCreateManualDetection,
    useCompleteQCAssignment,
    useDetectionComments,
    useReviewDetection,
    useStartQCSession,
    useEndQCSession,
    useAddDetectionComment,
    useQCCertifications,
    useCreateCertification,
    useQCReports,
    useQCReportByProject,
    useNotes,
    useNote,
    useNotesStats,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
    useDevices,
    useDevice,
    useCreateDevice,
    useUpdateDevice,
    useDeleteDevice,
    useAssignDeviceToTeamLeader,
    useQueryUtilities,
    // Customer hooks
    useCustomerProjects,
    useCustomerProject,
    useCustomerObservations,
    useCustomerSnapshots,
    useCustomerReports,
    useCustomerReport,
    useCustomerNotifications,
    useCustomerNotificationPreferences,
    useMarkCustomerNotificationRead,
    useMarkAllCustomerNotificationsRead,
    useDeleteCustomerNotification,
    useUpdateCustomerNotificationPreferences,
    useSubmitCustomerSupportTicket,
    useDownloadCustomerReport,
    queryKeys,
};
