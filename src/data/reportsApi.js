"use client";

import { api } from "@/lib/helper";

/**
 * Get all reports with optional filters
 */
export const getReports = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }

    if (filters.searchTerm) {
      queryParams.append('searchTerm', filters.searchTerm);
    }

    if (filters.dateRange) {
      queryParams.append('dateRange', filters.dateRange);
    }

    const queryString = queryParams.toString();
    const url = `/api/reports/get-all-report${queryString ? `?${queryString}` : ''}`;

    const response = await api(url, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch reports');
    }

    return response.data;
  } catch (error) {
    console.error('Reports API Error:', error);
    throw error;
  }
};

/**
 * Get projects available for reporting (filtered by QC technician)
 */
export const getProjectsForReport = async (userId) => {
  try {
    // Get only projects assigned to this QC technician
    const response = await api(`/api/projects/get-all-projects?qcTechnicianId=${userId}&limit=100`, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch projects');
    }

    return response.data?.data || [];
  } catch (error) {
    console.error('Get Projects API Error:', error);
    throw error;
  }
};

/**
 * Get report by ID
 */
export const getReportById = async (reportId) => {
  try {
    const response = await api(`/api/reports/get-report/${reportId}`, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch report');
    }

    return response.data;
  } catch (error) {
    console.error('Report API Error:', error);
    throw error;
  }
};

/**
 * Create a new report
 */
export const createReport = async (reportData) => {
  try {
    const response = await api('/api/reports/create-report', 'POST', reportData);

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to create report');
    }

    return response.data;
  } catch (error) {
    console.error('Create Report API Error:', error);
    throw error;
  }
};

/**
 * Get reports analytics/statistics
 */
export const getReportsAnalytics = async (period = 'month') => {
  try {
    const response = await api(`/api/reports/analytics?period=${period}`, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch analytics');
    }

    return response.data;
  } catch (error) {
    console.error('Analytics API Error:', error);
    throw error;
  }
};

/**
 * Get operator's reports
 */
export const getOperatorReports = async (operatorId) => {
  try {
    const response = await api(`/api/reports/get-operator-reports/${operatorId}`, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch operator reports');
    }

    return response.data;
  } catch (error) {
    console.error('Operator Reports API Error:', error);
    throw error;
  }
};

/**
 * Get all report templates
 */
export const getTemplates = async () => {
  try {
    const response = await api('/api/reports/templates', 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch templates');
    }

    return response.data?.data || [];
  } catch (error) {
    console.error('Get Templates API Error:', error);
    throw error;
  }
};

/**
 * Create a new report template
 */
export const createTemplate = async (templateData) => {
  try {
    const response = await api('/api/reports/templates/create', 'POST', templateData);

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to create template');
    }

    return response.data;
  } catch (error) {
    console.error('Create Template API Error:', error);
    throw error;
  }
};

/**
 * Download report as PDF
 */
export const downloadReport = async (reportId) => {
  try {
    const response = await api(`/api/reports/download/${reportId}`, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to download report');
    }

    return response.data;
  } catch (error) {
    console.error('Download Report API Error:', error);
    throw error;
  }
};

/**
 * Get detailed 2-day report
 */
export const getDetailed2DayReport = async (userId, startDate, endDate) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append('userId', userId);
    }
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    const queryString = queryParams.toString();
    const url = `/api/reports/detailed-2day${queryString ? `?${queryString}` : ''}`;

    const response = await api(url, 'GET');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch detailed report');
    }

    return response.data;
  } catch (error) {
    console.error('Detailed Report API Error:', error);
    throw error;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId) => {
  try {
    const response = await api(`/api/reports/delete-report/${reportId}`, 'DELETE');

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to delete report');
    }

    return response.data;
  } catch (error) {
    console.error('Delete Report API Error:', error);
    throw error;
  }
};

/**
 * Update a report template
 */
export const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await api(`/api/reports/templates/${templateId}`, 'PUT', templateData);

    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to update template');
    }

    return response.data;
  } catch (error) {
    console.error('Update Template API Error:', error);
    throw error;
  }
};

// Default export for backward compatibility
const reportsApi = {
  getReports,
  getProjectsForReport,
  getReportById,
  createReport,
  getReportsAnalytics,
  getOperatorReports,
  getTemplates,
  createTemplate,
  downloadReport,
  getDetailed2DayReport,
  deleteReport,
  updateTemplate
};

export default reportsApi;
