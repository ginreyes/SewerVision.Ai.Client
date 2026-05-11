'use client';

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

    // Storage (admin controls; backup logs are role-scoped)
    storageConfig: ['storage', 'config'],
    storageUsage: ['storage', 'usage'],
    migrationList: ['storage', 'migrations'],
    migrationStatus: (jobId) => ['storage', 'migration', jobId],
    backupLogs: (filters) => ['storage', 'backup-logs', filters ?? {}],

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
    operatorRecentShiftHandoffs: (operatorId, limit) => ['operator', 'shift-handoffs', operatorId, limit],

    // QC — New Modules
    qcPersonalDefectTrends: (qcId, range) => ['qc', 'personal-defect-trends', qcId, range],

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
    userOvertimeRequests: (userId, filters) => ['user', 'overtime-requests', userId, filters ?? {}],
    userOvertimeSummary: (userId) => ['user', 'overtime-summary', userId],
    adminOvertimeRequests: (filters) => ['admin', 'overtime-requests', filters ?? {}],
    adminOvertimeSummary: ['admin', 'overtime-summary'],
    overtimeApprovalQueue: (filters) => ['overtime', 'approval-queue', filters ?? {}],
    repActivity: (mode, repId) => ['rep-activity', mode ?? 'list', repId ?? null],

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

    // Admin — Users
    allUsers: (filters) => ['admin', 'users', filters ?? {}],
    customers: ['admin', 'customers'],

    // Admin — Permission Levels
    permissionLevels: (role) => ['admin', 'permission-levels', role ?? 'all'],
    permissionModules: (role) => ['admin', 'permission-modules', role],

    // Admin — Calendar
    calendarEvents: ['admin', 'calendar-events'],

    // Admin — Announcements
    announcements: (filters) => ['admin', 'announcements', filters ?? {}],

    // Admin — Projects (admin-specific list)
    adminProjects: (filters) => ['admin', 'projects', filters ?? {}],
    projectHealth: (id) => ['project', 'health', id],

    // Admin — AI Model Configs (control plane)
    aiModelConfigs: ['admin', 'ai-model-configs'],
    aiModelCompare: (a, b, n) => ['admin', 'ai-model-compare', a, b, n],
};
