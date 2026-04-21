'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/data/userApi';
import { operatorApi } from '@/data/operatorApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ USER ATTENDANCE / TIME ENTRIES (ANY ROLE) ============
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

// ── User Schedule / Budgets / Templates / Metrics Hooks ──

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
