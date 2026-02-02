'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import { qcApi } from '@/data/qcApi';
import { notesApi } from '@/data/notesApi';
import { reportsApi } from '@/data/reportsApi';
import { settingsApi } from '@/data/settingsApi';
import { uploadsApi } from '@/data/uploadsApi';
import { operatorApi } from '@/data/operatorApi';

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

    // Uploads/Projects
    projects: ['projects'],
    project: (projectId) => ['projects', projectId],
    projectMedia: (projectId) => ['projects', projectId, 'media'],
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
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['qc', 'detection', variables.detectionId] });
            queryClient.invalidateQueries({ queryKey: ['qc', 'detections'] });
            queryClient.invalidateQueries({ queryKey: ['qc', 'dashboard'] });
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

export default {
    useDashboardStats,
    useQCDashboardStats,
    useQCAssignments,
    useQCAssignment,
    useProjectDetections,
    useDetection,
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
    useQueryUtilities,
    queryKeys,
};
