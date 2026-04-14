'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import { qcApi } from '@/data/qcApi';
import { notesApi } from '@/data/notesApi';
import { settingsApi } from '@/data/settingsApi';
import notificationApi from '@/data/notificationApi ';
import { userApi } from '@/data/userApi';
import supportApi from '@/data/supportApi';
import messageApi from '@/data/messageApi';
import cannedResponseApi from '@/data/cannedResponseApi';
import complaintApi from '@/data/complaintApi';
import { knowledgeBaseApi } from '@/data/knowledgeBaseApi';
import { surveyApi } from '@/data/surveyApi';
import { operatorApi } from '@/data/operatorApi';
import { api } from '@/lib/helper';
import { queryKeys } from './queryKeys';

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
 * ============ SHARED PROJECT DETAIL HOOKS ============
 * Used by admin/operator/user ProjectDetail to fetch observations,
 * snapshots, metadata, PACP codes, and videos for a specific project.
 * Replaces the 15-20 raw api() calls each ProjectDetail had.
 */

export function useProjectObservations(projectId, page = 1, pageSize = 10, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'observations', page, pageSize],
        queryFn: async () => {
            const { data } = await api(`/api/observations/get-all-observations?projectId=${projectId}&page=${page}&limit=${pageSize}`);
            const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            const total = data?.pagination?.total ?? list.length;
            return { observations: list, total };
        },
        enabled: !!projectId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useProjectSnapshots(projectId, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'snapshots'],
        queryFn: async () => {
            const { data } = await api(`/api/snapshots/get-all-snapshots?projectId=${projectId}`);
            return Array.isArray(data) ? data : data?.data || [];
        },
        enabled: !!projectId,
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useProjectMetadata(projectId, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'metadata'],
        queryFn: async () => {
            const { data } = await api(`/api/projects/get-project/${projectId}`);
            return data?.data?.metadata || {};
        },
        enabled: !!projectId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function usePacpCodes(options = {}) {
    return useQuery({
        queryKey: ['pacp-codes'],
        queryFn: async () => {
            const { data } = await api('/api/pacpcodes/get-all-pacpcodes');
            return Array.isArray(data) ? data : data?.data || [];
        },
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

/**
 * ============ USER ATTENDANCE / TIME ENTRIES (ANY ROLE) ============
 * Generic wrappers around the operator time entry API — the backend
 * accepts any userId via the `operator` param despite the name.
 */

export function useUserTimeEntries(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: ['user-time-entries', userId, filters],
        queryFn: () => operatorApi.getTimeEntries(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserTimeSummary(userId, options = {}) {
    return useQuery({
        queryKey: ['user-time-summary', userId],
        queryFn: () => operatorApi.getTimeSummary(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
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

// ── Knowledge Base Hooks ──

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

// ── Survey Hooks ──

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

// ── Canned Workflow Hooks ──

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

// ── Survey Invite Hooks (admin-facing) ──

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

// ── Escalation Rule Hooks ──

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

// ── User New Module Hooks ──

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
