'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qcApi } from '@/data/qcApi';
import { api } from '@/lib/helper';
import { queryKeys } from './queryKeys';

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
 * Hook for fetching QC assignments.
 *
 * staleTime: 2 minutes. Assignments change rarely (admin reassignments,
 * completion events). Two minutes keeps navigation back-and-forth snappy
 * without serving stale counts — mutations (approve/reject, complete)
 * explicitly invalidate this key, so edits still propagate instantly.
 */
export function useQCAssignments(qcTechnicianId, status = 'all', options = {}) {
    return useQuery({
        queryKey: queryKeys.qcAssignments(qcTechnicianId, status),
        queryFn: () => qcApi.getAssignments(qcTechnicianId, status),
        enabled: !!qcTechnicianId,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
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
 * Hook for fetching project videos.
 *
 * staleTime: 5 minutes. Videos are uploaded infrequently and immutable once
 * stored — long staleTime is safe and eliminates the refetch-on-every-
 * project-switch that used to happen with the default staleTime of 0.
 */
export function useProjectVideos(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.projectVideos(projectId),
        queryFn: () => qcApi.getProjectVideos(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        ...options,
    });
}

/**
 * Hook for fetching project detections.
 *
 * staleTime: 1 minute. Detections change via mutations (approve/reject,
 * manual entry) which explicitly invalidate this key, so we don't need a
 * short window — the 1-minute buffer just prevents redundant fetches when
 * the tech flips back and forth between views. Mutations bypass staleTime
 * via queryClient.invalidateQueries, so live edits still propagate.
 */
export function useProjectDetections(projectId, qcStatus = 'all', options = {}) {
    return useQuery({
        queryKey: queryKeys.qcDetections(projectId, qcStatus),
        queryFn: () => qcApi.getProjectDetections(projectId, qcStatus),
        enabled: !!projectId,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 10,
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
 * Hook for reviewing a detection (approve/reject/modify).
 *
 * Optimistic flow:
 *  1. onMutate -> snapshot current detection list + assignments list
 *  2. Patch the detection list cache: if the filter is 'pending' and we just
 *     moved the detection out of pending, remove it; otherwise patch its
 *     qcStatus in-place.
 *  3. Patch the assignments cache: decrement pendingDetections, increment
 *     reviewedDetections + the specific status counter on the project.
 *  4. onError -> roll back both snapshots.
 *  5. onSettled -> targeted invalidation of just the project's detection query
 *     (NOT the global 'qc.detections' prefix -- that was over-invalidating and
 *     wiping out adjacent cache entries).
 *
 * Call signature for optimistic behavior:
 *    mutateAsync({
 *      detectionId,
 *      reviewData,               // { qcStatus, qcReviewedBy, action, ... }
 *      projectId,                // required for optimistic update
 *      qcStatusFilter = 'pending' // which list the detection currently lives in
 *    })
 */
export function useReviewDetection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ detectionId, reviewData }) =>
            qcApi.reviewDetection(detectionId, reviewData),

        onMutate: async ({ detectionId, reviewData, projectId, qcStatusFilter = 'pending' }) => {
            const detectionsKey = projectId ? queryKeys.qcDetections(projectId, qcStatusFilter) : null;

            // Cancel any in-flight queries so they don't clobber our optimistic state
            if (detectionsKey) {
                await queryClient.cancelQueries({ queryKey: detectionsKey });
            }
            await queryClient.cancelQueries({ queryKey: ['qc', 'assignments'] });

            const prevDetections = detectionsKey ? queryClient.getQueryData(detectionsKey) : null;

            // Patch the detection list cache
            if (detectionsKey && Array.isArray(prevDetections)) {
                const nextStatus = reviewData?.qcStatus;
                queryClient.setQueryData(detectionsKey, (old) => {
                    if (!Array.isArray(old)) return old;
                    // If we're filtering by 'pending' and moved this detection
                    // out of pending, drop it entirely from the list so the
                    // queue shrinks immediately.
                    if (qcStatusFilter === 'pending' && nextStatus && nextStatus !== 'pending') {
                        return old.filter(d => d._id !== detectionId);
                    }
                    // Otherwise patch the status in place
                    return old.map(d => d._id === detectionId ? { ...d, qcStatus: nextStatus } : d);
                });
            }

            // Patch every cached assignments list (all status filters) so the
            // project card in the left rail updates its pending/reviewed counts
            // immediately.
            const assignmentQueries = queryClient.getQueriesData({ queryKey: ['qc', 'assignments'] });
            const prevAssignments = assignmentQueries.map(([key, data]) => [key, data]);

            if (projectId) {
                for (const [key, data] of assignmentQueries) {
                    if (!Array.isArray(data)) continue;
                    queryClient.setQueryData(key, data.map(project => {
                        const pid = project?.projectId?._id || project?.projectId || project?._id;
                        if (pid !== projectId) return project;
                        const delta = reviewData?.qcStatus;
                        const next = { ...project };
                        if (delta && delta !== 'pending') {
                            next.pendingDetections = Math.max(0, (next.pendingDetections || 0) - 1);
                            next.reviewedDetections = (next.reviewedDetections || 0) + 1;
                            if (delta === 'approved') next.approvedDetections = (next.approvedDetections || 0) + 1;
                            if (delta === 'rejected') next.rejectedDetections = (next.rejectedDetections || 0) + 1;
                        }
                        return next;
                    }));
                }
            }

            return { prevDetections, prevAssignments, detectionsKey };
        },

        onError: (_err, _variables, context) => {
            // Roll back on failure -- both detection list and assignments list
            if (context?.detectionsKey && context?.prevDetections != null) {
                queryClient.setQueryData(context.detectionsKey, context.prevDetections);
            }
            if (Array.isArray(context?.prevAssignments)) {
                for (const [key, data] of context.prevAssignments) {
                    queryClient.setQueryData(key, data);
                }
            }
        },

        onSettled: (_data, _error, variables) => {
            // Targeted invalidation -- only the specific project's detection
            // query, NOT the global ['qc','detections'] prefix which would
            // wipe out unrelated project caches. Assignments stay as the
            // optimistic patch (the 2-minute staleTime handles eventual
            // consistency on next refocus).
            if (variables?.projectId) {
                queryClient.invalidateQueries({
                    queryKey: ['qc', 'detections', variables.projectId],
                    exact: false,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['qc', 'detection', variables.detectionId] });
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

export function useQCUploads(options = {}) {
    return useQuery({
        queryKey: ['qc', 'uploads'],
        queryFn: async () => {
            const { data } = await api('/api/uploads/get-all-uploads');
            return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60,
        ...options,
    });
}

// ── PACP Defect Library Hooks ──

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

// ── Training Hooks ──

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

// ── Training Management Hooks ──

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

// ── Onboarding Hooks ──

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

// ── Review Template Hooks ──

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

// ── QC Review Analytics Hooks ──

export function useQCReviewStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.qcReviewStats(userId),
        queryFn: () => qcApi.getQCReviewStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}
