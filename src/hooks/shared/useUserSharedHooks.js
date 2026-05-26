'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/data/userApi';
import { operatorApi } from '@/data/operatorApi';
import { adminOvertimeApi } from '@/data/adminOvertimeApi';
import { notesApi } from '@/data/notesApi';
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

// Pulls dashboard + team data and derives the rollups the analytics page needs:
// KPI strip values, a 7-day project-creation trend, and a role-count split.
// Kept as one hook so the analytics page doesn't have to re-derive on every render.
export function useUserTeamAnalyticsMetrics(userId, options = {}) {
    return useQuery({
        queryKey: ['user', 'team-analytics-metrics', userId],
        queryFn: async () => {
            const dashboard = await userApi.getDashboardData(userId);
            const projects = Array.isArray(dashboard?.projects) ? dashboard.projects : [];
            const team = Array.isArray(dashboard?.teamList) ? dashboard.teamList : [];

            const now = new Date();
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                days.push({
                    iso: d.toISOString().slice(0, 10),
                    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    count: 0,
                });
            }
            const indexByIso = new Map(days.map((d, i) => [d.iso, i]));
            for (const p of projects) {
                const created = p.createdAt || p.created_at;
                if (!created) continue;
                const iso = new Date(created).toISOString().slice(0, 10);
                if (indexByIso.has(iso)) days[indexByIso.get(iso)].count += 1;
            }

            const roleCounts = team.reduce(
                (acc, m) => {
                    if (m.role === 'operator') acc.operators += 1;
                    else if (m.role === 'qc-technician') acc.qc += 1;
                    return acc;
                },
                { operators: 0, qc: 0 }
            );
            const teamTotal = roleCounts.operators + roleCounts.qc;

            const statusCounts = projects.reduce(
                (acc, p) => {
                    const s = p.status || 'unknown';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                },
                {}
            );
            const completed = statusCounts['completed'] || 0;
            const active = projects.length - completed;
            const completionPct = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;

            return {
                kpis: {
                    teamTotal,
                    operators: roleCounts.operators,
                    qcTechs: roleCounts.qc,
                    activeProjects: active,
                    completedProjects: completed,
                    completionPct,
                    reportsCount: dashboard?.reportsCount || 0,
                },
                trend7d: days,
                roleSplit: {
                    operators: roleCounts.operators,
                    qcTechs: roleCounts.qc,
                    total: teamTotal,
                },
                statusCounts,
                projects,
                team,
            };
        },
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
    const { days, ...queryOptions } = options;
    return useQuery({
        queryKey: [...queryKeys.userMemberMetrics(memberId), { days: days ?? null }],
        queryFn: () => userApi.getMemberMetrics(memberId, { days }),
        enabled: !!memberId,
        staleTime: 1000 * 60 * 5,
        ...queryOptions,
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

/**
 * ============ OVERTIME REQUESTS ============
 */

export function useUserOvertimeRequests(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userOvertimeRequests(userId, filters),
        queryFn: () => userApi.getOvertimeRequests(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useUserOvertimeSummary(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userOvertimeSummary(userId),
        queryFn: () => userApi.getOvertimeSummary(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useRequestOvertime() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => userApi.requestOvertime(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['user', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['overtime', 'approval-queue'] });
        },
    });
}

export function useWithdrawOvertimeRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => userApi.withdrawOvertimeRequest(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['user', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['overtime', 'approval-queue'] });
        },
    });
}

export function useAdminOvertimeRequests(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.adminOvertimeRequests(filters),
        queryFn: () => adminOvertimeApi.getAllRequests(filters),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useOvertimeApprovalQueue(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.overtimeApprovalQueue(filters),
        queryFn: () => userApi.getOvertimeApprovalQueue(filters),
        enabled: !!filters.approverTier,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useAdminOvertimeSummary(options = {}) {
    return useQuery({
        queryKey: queryKeys.adminOvertimeSummary,
        queryFn: () => adminOvertimeApi.getGlobalSummary(),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useApproveOvertimeRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reviewedBy, reviewNote }) => adminOvertimeApi.approveRequest(id, { reviewedBy, reviewNote }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['user', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['overtime', 'approval-queue'] });
        },
    });
}

export function useRejectOvertimeRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reviewedBy, reviewNote }) => adminOvertimeApi.rejectRequest(id, { reviewedBy, reviewNote }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['user', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-requests'] });
            qc.invalidateQueries({ queryKey: ['admin', 'overtime-summary'] });
            qc.invalidateQueries({ queryKey: ['overtime', 'approval-queue'] });
        },
    });
}

/**
 * ============ MAY 14 — TEAM-LEAD MODULES ============
 * Approvals queue, Team Workload, Goal Tracking.
 */

// ── Approvals queue ──
export function useApprovalsQueue(status = 'pending', options = {}) {
    return useQuery({
        queryKey: queryKeys.userApprovalsQueue(status),
        queryFn: () => userApi.getApprovalsQueue(status),
        staleTime: 1000 * 30,
        ...options,
    });
}

function invalidateApprovalsAndOvertime(qc) {
    qc.invalidateQueries({
        predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'user' &&
            (query.queryKey[1] === 'approvals-queue' ||
                query.queryKey[1] === 'overtime-requests' ||
                query.queryKey[1] === 'overtime-summary'),
    });
    qc.invalidateQueries({ queryKey: ['overtime', 'approval-queue'] });
}

export function useApproveApprovalItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ kind, id, reviewNote }) =>
            userApi.approveApprovalItem(kind, id, reviewNote),
        onSuccess: () => invalidateApprovalsAndOvertime(qc),
    });
}

export function useRejectApprovalItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ kind, id, reviewNote }) =>
            userApi.rejectApprovalItem(kind, id, reviewNote),
        onSuccess: () => invalidateApprovalsAndOvertime(qc),
    });
}

// ── Team workload ──
export function useTeamWorkload(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamWorkload(filters),
        queryFn: () => userApi.getTeamWorkload(filters),
        staleTime: 1000 * 60,
        ...options,
    });
}

// ── Team goals ──
export function useTeamGoals(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamGoals(filters),
        queryFn: () => userApi.getTeamGoals(filters),
        staleTime: 1000 * 60,
        ...options,
    });
}

function invalidateTeamGoals(qc) {
    qc.invalidateQueries({
        predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'user' &&
            query.queryKey[1] === 'team-goals',
    });
}

export function useCreateTeamGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => userApi.createTeamGoal(payload),
        onSuccess: () => invalidateTeamGoals(qc),
    });
}

export function useUpdateTeamGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => userApi.updateTeamGoal(id, payload),
        onSuccess: () => invalidateTeamGoals(qc),
    });
}

export function useDeleteTeamGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => userApi.deleteTeamGoal(id),
        onSuccess: () => invalidateTeamGoals(qc),
    });
}

// ── Team training & certifications (May 19) ──
export function useTeamTraining(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamTraining(filters),
        queryFn: () => userApi.getTrainingRecords(filters),
        staleTime: 1000 * 60,
        ...options,
    });
}

function invalidateTeamTraining(qc) {
    qc.invalidateQueries({
        predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'user' &&
            query.queryKey[1] === 'team-training',
    });
}

export function useCreateTrainingRecord() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => userApi.createTrainingRecord(payload),
        onSuccess: () => invalidateTeamTraining(qc),
    });
}

export function useUpdateTrainingRecord() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => userApi.updateTrainingRecord(id, payload),
        onSuccess: () => invalidateTeamTraining(qc),
    });
}

export function useDeleteTrainingRecord() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => userApi.deleteTrainingRecord(id),
        onSuccess: () => invalidateTeamTraining(qc),
    });
}

// Accepts either a bare record id or { id, force } so a caller can request a
// cooldown override (e.g. after the server returned a 429 with canForce).
export function useRemindTrainingMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (arg) => {
            const { id, force } = typeof arg === 'object' && arg !== null ? arg : { id: arg, force: false };
            return userApi.remindTrainingMember(id, { force });
        },
        onSuccess: () => invalidateTeamTraining(qc),
    });
}

// ── Team training bulk actions + dashboard widgets (May 21) ──
// Bulk-renew/bulk-remind/remind also append AuditLog rows (May 22) so the
// History tab predicate is in the same prefix-match — invalidate together
// to keep the History tab in sync with the actions that produced its rows.
function invalidateTeamCompliance(qc) {
    qc.invalidateQueries({
        predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'user' &&
            (query.queryKey[1] === 'team-training' ||
                query.queryKey[1] === 'team-certification-summary' ||
                query.queryKey[1] === 'member-training-detail' ||
                query.queryKey[1] === 'training-audit'),
    });
}

export function useBulkRenewTraining() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ recordIds, newExpiryDate }) =>
            userApi.bulkRenewTrainingRecords({ recordIds, newExpiryDate }),
        onSuccess: () => invalidateTeamCompliance(qc),
    });
}

export function useBulkRemind() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ recordIds, reminderSchedule }) =>
            userApi.bulkRemindTrainingRecords({ recordIds, reminderSchedule }),
        onSuccess: () => invalidateTeamCompliance(qc),
    });
}

export function useTeamCertificationSummary(options = {}) {
    return useQuery({
        queryKey: queryKeys.userTeamCertificationSummary(),
        queryFn: () => userApi.getTeamCertificationSummary(),
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useTeamMemberTraining(memberId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userMemberTrainingDetail(memberId),
        queryFn: () => userApi.getMemberTrainingDetail(memberId),
        enabled: !!memberId,
        staleTime: 1000 * 60,
        ...options,
    });
}

/**
 * One-shot CSV export. Not a useQuery — kicks off a fresh fetch every call and
 * resolves to the raw CSV text so the page can trigger a browser download.
 */
export function useExportTrainingRecords() {
    return useMutation({
        mutationFn: (filters = {}) => userApi.exportTrainingRecords(filters),
    });
}

// ── Training audit trail + project health rollup (May 22) ──
export function useTrainingAudit(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userTrainingAudit(filters),
        queryFn: () => userApi.getTrainingAudit(filters),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useProjectHealthRollup(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userProjectHealthRollup(filters),
        queryFn: () => userApi.getProjectHealthRollup(filters),
        // This is effectively a triage list — poll every 30s like the admin
        // Project Health widget so a project sliding into the red surfaces
        // without a manual refresh. The 30s poll is the single refresh signal:
        // staleTime matches it and window-focus refetch is disabled so a tab
        // re-focus doesn't fire an extra request on top of the scheduled poll
        // (the previous comment claimed this but never set the flag).
        staleTime: 1000 * 30,
        refetchInterval: 1000 * 30,
        refetchOnWindowFocus: false,
        ...options,
    });
}

/**
 * Team-lead Notes view (May 21).
 *
 * Today notesApi.getNotes already filters by the supplied userId, so the
 * team-lead's notes are scoped to their own ownership server-side. This hook
 * gives the wrapper a stable surface so we can layer scope='team' (notes
 * across direct reports) onto notesApi without rewiring callers.
 */
export function useUserNotes(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: ['user', 'notes', userId, filters],
        queryFn: () => notesApi.getNotes(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 30,
        ...options,
    });
}
