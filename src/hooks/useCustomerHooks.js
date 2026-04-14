'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/data/customerApi';
import complaintApi from '@/data/complaintApi';
import { surveyApi } from '@/data/surveyApi';
import { queryKeys } from './queryKeys';

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

// ── Customer New Module Hooks ──

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
export function useWidgetData(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.customerWidgetData(userId),
        queryFn: () => customerApi.getWidgetData(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
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

// ── Survey Invite Hooks (customer-facing) ──

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
