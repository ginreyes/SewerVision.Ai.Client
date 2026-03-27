'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import { qcApi } from '@/data/qcApi';
import { notesApi } from '@/data/notesApi';
import reportsApi from '@/data/reportsApi';
import { settingsApi } from '@/data/settingsApi';
import { uploadsApi } from '@/data/uploadsApi';
import { operatorApi } from '@/data/operatorApi';
import { devicesApi } from '@/data/devicesApi';
import notificationApi from '@/data/notificationApi ';
import { customerApi } from '@/data/customerApi';
import { userApi } from '@/data/userApi';
import { maintenanceApi } from '@/data/maintenanceApi';
import supportApi from '@/data/supportApi';
import messageApi from '@/data/messageApi';
import cannedResponseApi from '@/data/cannedResponseApi';
import complaintApi from '@/data/complaintApi';
import { knowledgeBaseApi } from '@/data/knowledgeBaseApi';
import { surveyApi } from '@/data/surveyApi';

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
    operatorTodayEvents: (userId) => ['operator', 'todayEvents', userId],
    operatorAssignedProjects: (userId) => ['operator', 'assignedProjects', userId],
    operatorCalendarEvents: (userId) => ['operator', 'calendar', userId],
    operatorCalendarStats: (userId) => ['operator', 'calendar-stats', userId],
    operatorProjects: (userId, filters) => ['operator', 'projects', userId, filters ?? {}],
    operatorProject: (projectId) => ['operator', 'project', projectId],
    operatorDevices: (operatorId) => ['operator', 'devices', operatorId],
    operatorUploads: (limit) => ['operator', 'uploads', limit],
    operatorLogs: (username) => ['operator', 'logs', username],
    operatorNotificationPreferences: (userId) => ['operator', 'notification-preferences', userId],

    // Maintenance
    maintenanceOverview: () => ['maintenance', 'overview'],

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

    // Customer — New Modules
    customerTracker: (customerId) => ['customer', 'tracker', customerId],
    customerDocuments: (customerId, filters) => ['customer', 'documents', customerId, filters ?? {}],
    customerAppointments: (customerId, filters) => ['customer', 'appointments', customerId, filters ?? {}],
    customerAvailableSlots: (date) => ['customer', 'available-slots', date],
    customerAnnotations: (reportId) => ['customer', 'annotations', reportId],
    customerAllAnnotations: (customerId) => ['customer', 'all-annotations', customerId],
    customerWidgetPreferences: (userId) => ['customer', 'widget-preferences', userId],
    customerWidgetData: (userId) => ['customer', 'widget-data', userId],

    // Operator — New Modules
    operatorChecklists: (operatorId, filters) => ['operator', 'checklists', operatorId, filters ?? {}],
    operatorRouteSites: (operatorId, filters) => ['operator', 'route-sites', operatorId, filters ?? {}],
    operatorIncidents: (operatorId, filters) => ['operator', 'incidents', operatorId, filters ?? {}],
    operatorTimeEntries: (operatorId, filters) => ['operator', 'time-entries', operatorId, filters ?? {}],
    operatorTimeSummary: (operatorId, weekOf) => ['operator', 'time-summary', operatorId, weekOf],
    operatorCachedItems: (operatorId) => ['operator', 'cached-items', operatorId],
    operatorPendingSyncs: (operatorId) => ['operator', 'pending-syncs', operatorId],
    operatorOfflineStats: (operatorId) => ['operator', 'offline-stats', operatorId],

    // User — New Modules
    userWeekSchedule: (weekStart) => ['user', 'schedule', weekStart],
    userTeamAvailability: (weekStart) => ['user', 'availability', weekStart],
    userBudgets: (userId, filters) => ['user', 'budgets', userId, filters ?? {}],
    userBudget: (budgetId) => ['user', 'budget', budgetId],
    userConversations: (userId, filters) => ['user', 'conversations', userId, filters ?? {}],
    userMessages: (conversationId) => ['user', 'messages', conversationId],
    userTemplates: (userId) => ['user', 'templates', userId],
    userTeamMetrics: (userId) => ['user', 'team-metrics', userId],
    userMemberMetrics: (memberId) => ['user', 'member-metrics', memberId],
    userTeamSummary: (userId) => ['user', 'team-summary', userId],

    // Devices (admin)
    devices: (params) => ['devices', params ?? {}],
    device: (deviceId) => ['devices', deviceId],

    // User (Team Lead)
    userDashboard: (userId) => ['user', 'dashboard', userId],
    userProjects: (userId, filters) => ['user', 'projects', userId, filters ?? {}],
    userProject: (projectId) => ['user', 'project', projectId],
    userTeamMembers: () => ['user', 'team-members'],
    userTeamMemberDetail: (memberId) => ['user', 'team-member', memberId],
    userTeamMemberDashboard: (memberId) => ['user', 'team-member-dashboard', memberId],
    userDevices: (userId) => ['user', 'devices', userId],
    userEvents: () => ['user', 'events'],
    userReports: (userId, filters) => ['user', 'reports', userId, filters ?? {}],
    userNotificationPreferences: (userId) => ['user', 'notification-preferences', userId],

    // Support (Customer-Rep)
    supportAllTickets: (params) => ['support', 'tickets', params ?? {}],
    supportGlobalStats: ['support', 'global-stats'],
    supportTicket: (ticketId) => ['support', 'ticket', ticketId],
    supportAssigned: (repId) => ['support', 'assigned', repId],
    supportTeam: ['support', 'team'],
    supportCustomerStats: (userId) => ['support', 'customer-stats', userId],

    // Complaints
    complaintsAll: (params) => ['complaints', 'all', params ?? {}],
    complaintsStats: ['complaints', 'stats'],
    complaint: (id) => ['complaints', 'detail', id],
    complaintsAssigned: (repId) => ['complaints', 'assigned', repId],
    customerComplaints: (customerId) => ['complaints', 'customer', customerId],

    // Messages (Inbox)
    messagesInbox: (userId, params) => ['messages', 'inbox', userId, params ?? {}],
    messagesSent: (userId) => ['messages', 'sent', userId],
    messagesThread: (threadId) => ['messages', 'thread', threadId],
    messagesUnreadCount: (userId) => ['messages', 'unread', userId],
    messagesContacts: (userId) => ['messages', 'contacts', userId],

    // PACP Defects
    pacpDefects: (filters) => ['pacp-defects', filters ?? {}],
    pacpCategories: ['pacp-defect-categories'],

    // Training
    trainingModules: (filters) => ['training', 'modules', filters ?? {}],
    trainingModule: (id) => ['training', 'module', id],
    trainingAttempts: (userId, moduleId) => ['training', 'attempts', userId, moduleId ?? 'all'],
    trainingStats: (userId) => ['training', 'stats', userId],
    trainingTeamProgress: ['training', 'team-progress'],
    trainingAssignments: (userId) => ['training', 'assignments', userId],
    trainingAllAssignments: (status) => ['training', 'all-assignments', status ?? 'all'],
    onboarding: (userId) => ['onboarding', userId],
    onboardingAll: (role) => ['onboarding', 'all', role ?? 'all'],

    // Review Templates
    reviewTemplates: (createdBy) => ['review-templates', createdBy ?? 'all'],

    // QC Analytics
    qcReviewStats: (userId) => ['qc', 'review-stats', userId],

    // Knowledge Base
    kbArticles: (filters) => ['knowledge-base', 'articles', filters ?? {}],
    kbArticle: (id) => ['knowledge-base', 'article', id],
    kbCategories: ['knowledge-base', 'categories'],

    // Surveys
    surveyResponses: (filters) => ['surveys', 'responses', filters ?? {}],
    surveyStats: ['surveys', 'stats'],

    // Admin Analytics
    adminAnalytics: ['admin', 'analytics-overview'],

    // Canned Workflows
    cannedWorkflows: (createdBy) => ['canned-workflows', createdBy ?? 'all'],

    // Escalation Rules
    escalationRules: (createdBy) => ['escalation-rules', createdBy ?? 'all'],

    // Survey Invites
    surveyInvite: (token) => ['survey', 'invite', token],
    pendingSurveys: (customerId) => ['survey', 'pending', customerId],
    surveyInvites: (filters) => ['survey', 'invites', filters ?? {}],
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
 * ============ USER (TEAM LEAD) HOOKS ============
 */

export function useUserDashboard(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userDashboard(userId),
        queryFn: () => userApi.getDashboardData(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserProjects(userId, { page = 1, limit = 20, search = '', status = '' } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userProjects(userId, { page, limit, search, status }),
        queryFn: () => userApi.getAllProjects(userId, { page, limit, search, status }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUserProject(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userProject(projectId),
        queryFn: () => userApi.getProject(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUserTeamMembers(options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamMembers(),
        queryFn: () => userApi.getTeamMembers(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUserTeamMemberDetail(memberId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamMemberDetail(memberId),
        queryFn: () => userApi.getTeamMemberDetails(memberId),
        enabled: !!memberId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUserTeamMemberDashboard(memberId, role, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamMemberDashboard(memberId),
        queryFn: () => userApi.getTeamMemberDashboard(memberId, role),
        enabled: !!memberId && !!role,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserDevices(userId, role, options = {}) {
    return useQuery({
        queryKey: queryKeys.userDevices(userId),
        queryFn: () => userApi.getDevices(userId, role),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserEvents(options = {}) {
    return useQuery({
        queryKey: queryKeys.userEvents(),
        queryFn: () => userApi.getEvents(),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserNotificationPreferences(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userNotificationPreferences(userId),
        queryFn: () => userApi.getNotificationPreferences(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

export function useUserReports(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userReports(userId, filters),
        queryFn: () => userApi.getReports({ managerId: userId, ...filters }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

// ── User Mutations ──

export function useRequestDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.requestDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useApproveDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.approveDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useRejectDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.rejectDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useDeleteUserProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useCreateObservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId, data }) => userApi.createObservation(projectId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useCreateUserSnapshot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId, data }) => userApi.createSnapshot(projectId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useUpdateDeviceAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, assignments }) => userApi.updateDeviceAssignment(deviceId, assignments),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'devices'] });
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventData) => userApi.createEvent(eventData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userEvents() });
        },
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, data }) => userApi.updateEvent(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userEvents() });
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => userApi.deleteEvent(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userEvents() });
        },
    });
}

export function useUpdateUserProfile() {
    return useMutation({
        mutationFn: ({ username, data }) => userApi.updateProfile(username, data),
    });
}

export function useChangeUserPassword() {
    return useMutation({
        mutationFn: (passwordData) => userApi.changePassword(passwordData),
    });
}

export function useSaveUserSettings() {
    return useMutation({
        mutationFn: (settings) => userApi.saveSettings(settings),
    });
}

export function useUpdateUserNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, preferences }) => userApi.updateNotificationPreferences(userId, preferences),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userNotificationPreferences(userId) });
        },
    });
}

/**
 * ============ SUPPORT / CUSTOMER-REP HOOKS ============
 */

export function useSupportAllTickets(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportAllTickets(params),
        queryFn: () => supportApi.getAllTickets(params),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportGlobalStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.supportGlobalStats,
        queryFn: () => supportApi.getGlobalStats(),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportTicket(ticketId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportTicket(ticketId),
        queryFn: () => supportApi.getTicketById(ticketId),
        enabled: !!ticketId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useSupportAssignedTickets(repId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportAssigned(repId),
        queryFn: () => supportApi.getAssignedTickets(repId),
        enabled: !!repId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportTeam(options = {}) {
    return useQuery({
        queryKey: queryKeys.supportTeam,
        queryFn: () => supportApi.getTeam(),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useManagedTeam(repId, options = {}) {
    return useQuery({
        queryKey: ['managedTeam', repId],
        queryFn: () => supportApi.getManagedTeam(repId),
        staleTime: 1000 * 60 * 2,
        enabled: !!repId,
        ...options,
    });
}

export function useSupportCustomerStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportCustomerStats(userId),
        queryFn: () => supportApi.getCustomerStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useCreateSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useUpdateSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.updateTicket(ticketId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useAddTicketResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.addResponse(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
        },
    });
}

export function useDeleteSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ticketId) => supportApi.deleteTicket(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useAddInternalNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.addInternalNote(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
        },
    });
}

export function useSupportTags(options = {}) {
    return useQuery({
        queryKey: ['support', 'tags'],
        queryFn: () => supportApi.getTags(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSupportCustomerHistory(customerId, options = {}) {
    return useQuery({
        queryKey: ['support', 'customer-history', customerId],
        queryFn: () => supportApi.getCustomerHistory(customerId),
        enabled: !!customerId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useRequestTicketDeletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.requestDeletion(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
            queryClient.invalidateQueries({ queryKey: ['support', 'deletion-requests'] });
        },
    });
}

export function useReviewTicketDeletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.reviewDeletion(ticketId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
            queryClient.invalidateQueries({ queryKey: ['support', 'deletion-requests'] });
        },
    });
}

export function usePendingDeletionRequests(options = {}) {
    return useQuery({
        queryKey: ['support', 'deletion-requests'],
        queryFn: () => supportApi.getPendingDeletionRequests(),
        staleTime: 1000 * 30,
        ...options,
    });
}

/**
 * ============ CANNED RESPONSE HOOKS ============
 */

export function useCannedResponses(userId, options = {}) {
    return useQuery({
        queryKey: ['canned-responses', userId],
        queryFn: () => cannedResponseApi.getAll(userId),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useCreateCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => cannedResponseApi.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

export function useUpdateCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => cannedResponseApi.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

export function useDeleteCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => cannedResponseApi.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

/**
 * ============ COMPLAINT HOOKS ============
 */

export function useComplaintsAll(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsAll(params),
        queryFn: () => complaintApi.getAllComplaints(params),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useComplaintStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsStats,
        queryFn: () => complaintApi.getStats(),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useComplaint(complaintId, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaint(complaintId),
        queryFn: () => complaintApi.getById(complaintId),
        enabled: !!complaintId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useComplaintsAssigned(repId, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsAssigned(repId),
        queryFn: () => complaintApi.getAssigned(repId),
        enabled: !!repId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useCreateComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => complaintApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useUpdateComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.update(complaintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useDeleteComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (complaintId) => complaintApi.delete(complaintId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useAddComplaintNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.addNote(complaintId, data),
        onSuccess: (_data, { complaintId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaintId) });
        },
    });
}

export function useCreateTicketFromComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.createTicket(complaintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

// ── Customer-side complaint hooks ──

export function useCustomerComplaints(customerId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerComplaints(customerId),
        queryFn: () => complaintApi.getCustomerComplaints(customerId),
        enabled: !!customerId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useCreateCustomerComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => complaintApi.createCustomerComplaint(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

/**
 * ============ MESSAGES / INBOX HOOKS ============
 */

export function useMessagesInbox(userId, params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesInbox(userId, params),
        queryFn: () => messageApi.getInbox(userId, params),
        enabled: !!userId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useMessagesSent(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesSent(userId),
        queryFn: () => messageApi.getSent(userId),
        enabled: !!userId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useMessagesThread(threadId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesThread(threadId),
        queryFn: () => messageApi.getThread(threadId),
        enabled: !!threadId,
        staleTime: 1000 * 10,
        ...options,
    });
}

export function useMessagesUnreadCount(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesUnreadCount(userId),
        queryFn: () => messageApi.getUnreadCount(userId),
        enabled: !!userId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useMessagesContacts(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesContacts(userId),
        queryFn: () => messageApi.getContacts(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => messageApi.send(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useToggleMessageStar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.toggleStar(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useMarkMessageRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.markAsRead(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useArchiveMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.archive(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.delete(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useMarkAllMessagesRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => messageApi.markAllAsRead(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
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
 * Hook for fetching AI detections for a project (for snapshot images)
 */
export function useCustomerDetections(projectId, options = {}) {
    return useQuery({
        queryKey: [...queryKeys.customerSnapshots(projectId), 'detections'],
        queryFn: () => customerApi.getProjectDetections(projectId),
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

// ─── CUSTOMER NEW MODULE HOOKS ──────────────────────────

/**
 * Hook: Live Tracker projects
 */
export function useCustomerTracker(customerId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerTracker(customerId),
        queryFn: () => customerApi.getTrackerProjects(customerId),
        enabled: !!customerId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

/**
 * Hook: Customer Documents
 */
export function useCustomerDocuments(customerId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerDocuments(customerId, filters),
        queryFn: () => customerApi.getDocuments(customerId, filters),
        enabled: !!customerId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Mutation: Track document download
 */
export function useTrackDocumentDownload() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (documentId) => customerApi.trackDocumentDownload(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', 'documents'] });
        },
    });
}

/**
 * Hook: Customer Appointments
 */
export function useCustomerAppointments(customerId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerAppointments(customerId, filters),
        queryFn: () => customerApi.getAppointments(customerId, filters),
        enabled: !!customerId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

/**
 * Hook: Available time slots
 */
export function useAvailableSlots(date, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerAvailableSlots(date),
        queryFn: () => customerApi.getAvailableSlots(date),
        enabled: !!date,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

/**
 * Mutation: Create appointment
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => customerApi.createAppointment(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customer', 'appointments'] });
            if (variables.date) {
                queryClient.invalidateQueries({ queryKey: ['customer', 'available-slots'] });
            }
        },
    });
}

/**
 * Mutation: Update appointment
 */
export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => customerApi.updateAppointment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', 'appointments'] });
        },
    });
}

/**
 * Mutation: Delete appointment
 */
export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => customerApi.deleteAppointment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', 'appointments'] });
        },
    });
}

/**
 * Hook: Report Annotations
 */
export function useReportAnnotations(reportId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerAnnotations(reportId),
        queryFn: () => customerApi.getReportAnnotations(reportId),
        enabled: !!reportId,
        staleTime: 1000 * 60 * 3,
        ...options,
    });
}

/**
 * Mutation: Create annotation
 */
export function useCreateAnnotation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => customerApi.createAnnotation(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerAnnotations(variables.reportId) });
        },
    });
}

/**
 * Hook: Widget Preferences
 */
export function useWidgetPreferences(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerWidgetPreferences(userId),
        queryFn: () => customerApi.getWidgetPreferences(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

/**
 * Mutation: Update widget preferences
 */
export function useUpdateWidgetPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, widgets }) => customerApi.updateWidgetPreferences(userId, widgets),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.customerWidgetPreferences(userId) });
        },
    });
}

/**
 * Hook: Widget live data
 */
// ─── PACP DEFECT LIBRARY HOOKS ──────────────────────────

export function usePacpDefects(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.pacpDefects(filters),
        queryFn: () => qcApi.getAllDefects(filters),
        staleTime: 1000 * 60 * 30,
        ...options,
    });
}

export function usePacpCategories(options = {}) {
    return useQuery({
        queryKey: queryKeys.pacpCategories,
        queryFn: () => qcApi.getDefectCategories(),
        staleTime: 1000 * 60 * 60,
        ...options,
    });
}

export function useCreatePacpDefect(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => qcApi.createDefect(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pacp-defects'] });
            queryClient.invalidateQueries({ queryKey: ['pacp-defect-categories'] });
        },
        ...options,
    });
}

export function useUpdatePacpDefect(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => qcApi.updateDefect(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pacp-defects'] });
        },
        ...options,
    });
}

export function useDeletePacpDefect(options = {}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => qcApi.deleteDefect(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pacp-defects'] });
            queryClient.invalidateQueries({ queryKey: ['pacp-defect-categories'] });
        },
        ...options,
    });
}

// ─── TRAINING HOOKS ─────────────────────────────────────

export function useTrainingModules(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingModules(filters),
        queryFn: () => qcApi.getTrainingModules(filters),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

export function useTrainingModule(id, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingModule(id),
        queryFn: () => qcApi.getTrainingModule(id),
        enabled: !!id,
        ...options,
    });
}

export function useSubmitTrainingAttempt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => qcApi.submitTrainingAttempt(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['training', 'attempts'] });
            queryClient.invalidateQueries({ queryKey: ['training', 'stats'] });
        },
    });
}

export function useTrainingAttempts(userId, moduleId, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingAttempts(userId, moduleId),
        queryFn: () => qcApi.getTrainingAttempts(userId, moduleId),
        enabled: !!userId,
        ...options,
    });
}

export function useTrainingStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingStats(userId),
        queryFn: () => qcApi.getTrainingStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

// ─── TRAINING MANAGEMENT HOOKS ─────────────────────────

export function useCreateTrainingModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => qcApi.createTrainingModule(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training', 'modules'] }); },
    });
}

export function useUpdateTrainingModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => qcApi.updateTrainingModule(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training', 'modules'] }); },
    });
}

export function useDeleteTrainingModule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => qcApi.deleteTrainingModule(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['training', 'modules'] }); },
    });
}

export function useTeamTrainingProgress(options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingTeamProgress,
        queryFn: () => qcApi.getTeamTrainingProgress(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useTrainingAssignments(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingAssignments(userId),
        queryFn: () => qcApi.getTrainingAssignments(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useAllTrainingAssignments(status, options = {}) {
    return useQuery({
        queryKey: queryKeys.trainingAllAssignments(status),
        queryFn: () => qcApi.getAllTrainingAssignments(status),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useAssignTrainingModules() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => qcApi.assignTrainingModules(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training', 'assignments'] });
            queryClient.invalidateQueries({ queryKey: ['training', 'all-assignments'] });
            queryClient.invalidateQueries({ queryKey: ['training', 'team-progress'] });
        },
    });
}

// ─── ONBOARDING HOOKS ──────────────────────────────────

export function useOnboarding(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.onboarding(userId),
        queryFn: () => qcApi.getOnboarding(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

export function useAllOnboarding(role, options = {}) {
    return useQuery({
        queryKey: queryKeys.onboardingAll(role),
        queryFn: () => qcApi.getAllOnboarding(role),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useCompleteOnboardingStep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, stepKey }) => qcApi.completeOnboardingStep(userId, stepKey),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.onboarding(userId) });
            queryClient.invalidateQueries({ queryKey: ['onboarding', 'all'] });
        },
    });
}

// ─── REVIEW TEMPLATE HOOKS ──────────────────────────────

export function useReviewTemplates(createdBy, options = {}) {
    return useQuery({
        queryKey: queryKeys.reviewTemplates(createdBy),
        queryFn: () => qcApi.getReviewTemplates(createdBy),
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

export function useCreateReviewTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => qcApi.createReviewTemplate(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['review-templates'] }); },
    });
}

export function useUpdateReviewTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => qcApi.updateReviewTemplate(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['review-templates'] }); },
    });
}

export function useDeleteReviewTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => qcApi.deleteReviewTemplate(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['review-templates'] }); },
    });
}

export function useToggleTemplateFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => qcApi.toggleTemplateFavorite(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['review-templates'] }); },
    });
}

// ─── QC REVIEW ANALYTICS HOOKS ──────────────────────────

export function useQCReviewStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcReviewStats(userId),
        queryFn: () => qcApi.getQCReviewStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

// ─── KNOWLEDGE BASE HOOKS ───────────────────────────────

export function useKBArticles(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.kbArticles(filters),
        queryFn: () => knowledgeBaseApi.getAllArticles(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useKBCategories(options = {}) {
    return useQuery({
        queryKey: queryKeys.kbCategories,
        queryFn: () => knowledgeBaseApi.getCategories(),
        staleTime: 1000 * 60 * 30,
        ...options,
    });
}

export function useCreateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => knowledgeBaseApi.createArticle(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

export function useUpdateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => knowledgeBaseApi.updateArticle(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

export function useDeleteKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => knowledgeBaseApi.deleteArticle(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

// ─── SURVEY HOOKS ───────────────────────────────────────

export function useSurveyResponses(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyResponses(filters),
        queryFn: () => surveyApi.getAllResponses(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSurveyStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyStats,
        queryFn: () => surveyApi.getStats(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSubmitSurvey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => surveyApi.submitResponse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        },
    });
}

// ─── ADMIN ANALYTICS HOOKS ──────────────────────────────

// ─── CANNED WORKFLOW HOOKS ───────────────────────────────

export function useCannedWorkflows(createdBy, options = {}) {
    return useQuery({
        queryKey: queryKeys.cannedWorkflows(createdBy),
        queryFn: () => supportApi.getAllWorkflows(createdBy),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useCreateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createWorkflow(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useUpdateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => supportApi.updateWorkflow(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useDeleteCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.deleteWorkflow(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useToggleCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.toggleWorkflowActive(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useDuplicateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.duplicateWorkflow(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

// ─── SURVEY INVITE HOOKS ─────────────────────────────────

export function useSurveyInvite(token, options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyInvite(token),
        queryFn: () => surveyApi.getInviteByToken(token),
        enabled: !!token,
        retry: false,
        ...options,
    });
}

export function usePendingSurveys(customerId, options = {}) {
    return useQuery({
        queryKey: queryKeys.pendingSurveys(customerId),
        queryFn: () => surveyApi.getPendingSurveys(customerId),
        enabled: !!customerId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useSurveyInvites(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyInvites(filters),
        queryFn: () => surveyApi.getAllInvites(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSendSurveys() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => surveyApi.sendSurveys(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey'] });
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        },
    });
}

export function useRespondToSurvey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ token, rating, comment }) => surveyApi.respondToSurvey(token, { rating, comment }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey'] });
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        },
    });
}

// ─── ESCALATION RULE HOOKS ───────────────────────────────

export function useEscalationRules(createdBy, options = {}) {
    return useQuery({
        queryKey: queryKeys.escalationRules(createdBy),
        queryFn: () => supportApi.getAllEscalationRules(createdBy),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useCreateEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createEscalationRule(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useUpdateEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => supportApi.updateEscalationRule(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useDeleteEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.deleteEscalationRule(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useToggleEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.toggleEscalationRule(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useAdminAnalytics(options = {}) {
    return useQuery({
        queryKey: queryKeys.adminAnalytics,
        queryFn: () => dashboardApi.getAnalyticsOverview(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useWidgetData(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerWidgetData(userId),
        queryFn: () => customerApi.getWidgetData(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

// ─── OPERATOR NEW MODULE HOOKS ──────────────────────────

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

// ─── USER NEW MODULE HOOKS ──────────────────────────────

export function useUserWeekSchedule(weekStart, options = {}) {
    return useQuery({
        queryKey: queryKeys.userWeekSchedule(weekStart),
        queryFn: () => userApi.getWeekSchedule(weekStart),
        enabled: !!weekStart,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useCreateAssignment() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => userApi.createAssignment(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'schedule'] }) });
}
export function useDeleteAssignment() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => userApi.deleteAssignment(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'schedule'] }) });
}

export function useUserBudgets(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userBudgets(userId, filters),
        queryFn: () => userApi.getProjectBudgets(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useUserBudget(budgetId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userBudget(budgetId),
        queryFn: () => userApi.getProjectBudget(budgetId),
        enabled: !!budgetId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}
export function useCreateBudget() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => userApi.createProjectBudget(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'budgets'] }) });
}
export function useAddExpense() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ budgetId, ...data }) => userApi.addExpense(budgetId, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', 'budgets'] }); qc.invalidateQueries({ queryKey: ['user', 'budget'] }); } });
}

export function useUserConversations(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userConversations(userId, filters),
        queryFn: () => userApi.getConversations(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
export function useUserMessages(conversationId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userMessages(conversationId),
        queryFn: () => userApi.getMessages(conversationId),
        enabled: !!conversationId,
        staleTime: 1000 * 30,
        ...options,
    });
}
export function useSendClientMessage() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ conversationId, ...data }) => userApi.sendMessage(conversationId, data), onSuccess: (_d, { conversationId }) => { qc.invalidateQueries({ queryKey: queryKeys.userMessages(conversationId) }); qc.invalidateQueries({ queryKey: ['user', 'conversations'] }); } });
}
export function useMarkConversationRead() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (conversationId) => userApi.markAsRead(conversationId), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'conversations'] }) });
}

export function useUserTemplates(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTemplates(userId),
        queryFn: () => userApi.getTemplates(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useCreateTemplate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => userApi.createTemplate(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}
export function useUpdateTemplate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, ...data }) => userApi.updateTemplate(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}
export function useToggleTemplateStar() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => userApi.toggleTemplateStar(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}
export function useDuplicateTemplate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => userApi.duplicateTemplate(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}
export function useDeleteTemplate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => userApi.deleteTemplate(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}
export function useUseTemplate() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id) => userApi.useTemplate(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'templates'] }) });
}

export function useUserTeamMetrics(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamMetrics(userId),
        queryFn: () => userApi.getTeamMetrics(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options,
    });
}
export function useUserMemberMetrics(memberId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userMemberMetrics(memberId),
        queryFn: () => userApi.getMemberMetrics(memberId),
        enabled: !!memberId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}
export function useUserTeamSummary(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamSummary(userId),
        queryFn: () => userApi.getTeamSummary(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}
export function useCreatePerformanceMetrics() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data) => userApi.createMetrics(data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', 'team-metrics'] }); qc.invalidateQueries({ queryKey: ['user', 'team-summary'] }); } });
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
    // Operator hooks (extended)
    useOperatorTodayEvents,
    useOperatorAssignedProjects,
    useOperatorCalendarEvents,
    useOperatorCalendarStats,
    useCreateOperatorEvent,
    useUpdateOperatorEventStatus,
    useDeleteOperatorEvent,
    useOperatorProjects,
    useOperatorProject,
    useOperatorDevices,
    useReportDeviceStatus,
    useOperatorUploads,
    useStartOperationsRecording,
    useStopOperationsRecording,
    useCreateOperatorReport,
    useOperatorAllProjects,
    useOperatorLogs,
    useUpdateOperatorProfile,
    useChangeOperatorPassword,
    useSaveOperatorSettings,
    useOperatorNotificationPreferences,
    useUpdateOperatorNotificationPreferences,
    // Maintenance hooks
    useMaintenanceOverview,
    useRefreshMaintenanceSystems,
    useDismissMaintenanceAlert,
    // Customer hooks
    useCustomerProjects,
    useCustomerProject,
    useCustomerObservations,
    useCustomerSnapshots,
    useCustomerDetections,
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
    // Customer new module hooks
    useCustomerTracker,
    useCustomerDocuments,
    useTrackDocumentDownload,
    useCustomerAppointments,
    useAvailableSlots,
    useCreateAppointment,
    useUpdateAppointment,
    useDeleteAppointment,
    useReportAnnotations,
    useCreateAnnotation,
    useWidgetPreferences,
    useUpdateWidgetPreferences,
    useWidgetData,
    // New module hooks
    usePacpDefects,
    usePacpCategories,
    useCreatePacpDefect,
    useUpdatePacpDefect,
    useDeletePacpDefect,
    useTrainingModules,
    useTrainingModule,
    useSubmitTrainingAttempt,
    useTrainingAttempts,
    useTrainingStats,
    useCreateTrainingModule,
    useUpdateTrainingModule,
    useDeleteTrainingModule,
    useTeamTrainingProgress,
    useTrainingAssignments,
    useAllTrainingAssignments,
    useAssignTrainingModules,
    useOnboarding,
    useAllOnboarding,
    useCompleteOnboardingStep,
    useReviewTemplates,
    useCreateReviewTemplate,
    useUpdateReviewTemplate,
    useDeleteReviewTemplate,
    useToggleTemplateFavorite,
    useQCReviewStats,
    useKBArticles,
    useKBCategories,
    useCreateKBArticle,
    useUpdateKBArticle,
    useDeleteKBArticle,
    useSurveyResponses,
    useSurveyStats,
    useSubmitSurvey,
    useAdminAnalytics,
    // User (Team Lead) hooks
    useUserDashboard,
    useUserProjects,
    useUserProject,
    useUserTeamMembers,
    useUserTeamMemberDetail,
    useUserTeamMemberDashboard,
    useUserDevices,
    useUserEvents,
    useUserReports,
    useUserNotificationPreferences,
    useRequestDeleteProject,
    useApproveDeleteProject,
    useRejectDeleteProject,
    useDeleteUserProject,
    useCreateObservation,
    useCreateUserSnapshot,
    useUpdateDeviceAssignment,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    useUpdateUserProfile,
    useChangeUserPassword,
    useSaveUserSettings,
    useUpdateUserNotificationPreferences,
    queryKeys,
    // Support (Customer-Rep) hooks
    useSupportAllTickets,
    useSupportGlobalStats,
    useSupportTicket,
    useSupportAssignedTickets,
    useSupportTeam,
    useManagedTeam,
    useSupportCustomerStats,
    useCreateSupportTicket,
    useUpdateSupportTicket,
    useAddTicketResponse,
    useDeleteSupportTicket,
    useAddInternalNote,
    useSupportTags,
    useSupportCustomerHistory,
    useRequestTicketDeletion,
    useReviewTicketDeletion,
    usePendingDeletionRequests,
    // Canned Response hooks
    useCannedResponses,
    useCreateCannedResponse,
    useUpdateCannedResponse,
    useDeleteCannedResponse,
    // Messages / Inbox hooks
    useMessagesInbox,
    useMessagesSent,
    useMessagesThread,
    useMessagesUnreadCount,
    useMessagesContacts,
    useSendMessage,
    useToggleMessageStar,
    useMarkMessageRead,
    useArchiveMessage,
    useDeleteMessage,
    useMarkAllMessagesRead,
    // Operator new module hooks
    useOperatorChecklists,
    useCreateChecklist,
    useToggleChecklistItem,
    useDeleteChecklist,
    useOperatorRouteSites,
    useCompleteRouteSite,
    useOperatorIncidents,
    useCreateIncident,
    useUpdateIncident,
    useOperatorTimeEntries,
    useOperatorTimeSummary,
    useCreateTimeEntry,
    useDeleteTimeEntry,
    useOperatorCachedItems,
    useOperatorPendingSyncs,
    useOperatorOfflineStats,
    useToggleCache,
    useSyncAll,
    // User new module hooks
    useUserWeekSchedule,
    useCreateAssignment,
    useDeleteAssignment,
    useUserBudgets,
    useUserBudget,
    useCreateBudget,
    useAddExpense,
    useUserConversations,
    useUserMessages,
    useSendClientMessage,
    useMarkConversationRead,
    useUserTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useToggleTemplateStar,
    useDuplicateTemplate,
    useDeleteTemplate,
    useUseTemplate,
    useUserTeamMetrics,
    useUserMemberMetrics,
    useUserTeamSummary,
    useCreatePerformanceMetrics,
};
