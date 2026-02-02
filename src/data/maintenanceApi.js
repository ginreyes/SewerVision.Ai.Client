import { api } from '@/lib/helper';

/**
 * Maintenance API
 * API functions for system maintenance dashboard
 */

/**
 * Get full maintenance overview (systems, alerts, tasks, stats)
 */
export const getMaintenanceOverview = async () => {
    const response = await api('/api/maintenance/overview', 'GET');
    return response;
};

/**
 * Get all system statuses
 */
export const getSystemStatuses = async () => {
    const response = await api('/api/maintenance/systems', 'GET');
    return response;
};

/**
 * Update a system status
 */
export const updateSystemStatus = async (systemId, data) => {
    const response = await api(`/api/maintenance/systems/${systemId}`, 'PATCH', data);
    return response;
};

/**
 * Refresh all system statuses (health check)
 */
export const refreshSystemStatuses = async () => {
    const response = await api('/api/maintenance/systems/refresh', 'POST');
    return response;
};

/**
 * Get maintenance tasks with optional filters
 */
export const getMaintenanceTasks = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/api/maintenance/tasks${queryString ? `?${queryString}` : ''}`;
    const response = await api(url, 'GET');
    return response;
};

/**
 * Create a new maintenance task
 */
export const createMaintenanceTask = async (taskData) => {
    const response = await api('/api/maintenance/tasks', 'POST', taskData);
    return response;
};

/**
 * Update a maintenance task
 */
export const updateMaintenanceTask = async (taskId, data) => {
    const response = await api(`/api/maintenance/tasks/${taskId}`, 'PATCH', data);
    return response;
};

/**
 * Delete a maintenance task
 */
export const deleteMaintenanceTask = async (taskId) => {
    const response = await api(`/api/maintenance/tasks/${taskId}`, 'DELETE');
    return response;
};

/**
 * Get system alerts with optional filters
 */
export const getSystemAlerts = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.resolved !== undefined) params.append('resolved', filters.resolved);
    if (filters.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = `/api/maintenance/alerts${queryString ? `?${queryString}` : ''}`;
    const response = await api(url, 'GET');
    return response;
};

/**
 * Create a new system alert
 */
export const createSystemAlert = async (alertData) => {
    const response = await api('/api/maintenance/alerts', 'POST', alertData);
    return response;
};

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (alertId, userId) => {
    const response = await api(`/api/maintenance/alerts/${alertId}/acknowledge`, 'PATCH', { userId });
    return response;
};

/**
 * Resolve an alert
 */
export const resolveAlert = async (alertId, userId) => {
    const response = await api(`/api/maintenance/alerts/${alertId}/resolve`, 'PATCH', { userId });
    return response;
};

/**
 * Delete/dismiss an alert
 */
export const deleteAlert = async (alertId) => {
    const response = await api(`/api/maintenance/alerts/${alertId}`, 'DELETE');
    return response;
};

// Export as named object
export const maintenanceApi = {
    getOverview: getMaintenanceOverview,
    getSystems: getSystemStatuses,
    updateSystem: updateSystemStatus,
    refreshSystems: refreshSystemStatuses,
    getTasks: getMaintenanceTasks,
    createTask: createMaintenanceTask,
    updateTask: updateMaintenanceTask,
    deleteTask: deleteMaintenanceTask,
    getAlerts: getSystemAlerts,
    createAlert: createSystemAlert,
    acknowledgeAlert,
    resolveAlert,
    deleteAlert,
};

export default maintenanceApi;
