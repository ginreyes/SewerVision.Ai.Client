"use client";

import { api } from "@/lib/helper";

/**
 * Reports API functions for admin
 */
export const reportsApi = {
  /**
   * Get all reports with optional filters
   */
  async getReports(filters = {}) {
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
  },

  /**
   * Get report by ID
   */
  async getReportById(reportId) {
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
  },

  /**
   * Create a new report
   */
  async createReport(reportData) {
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
  },

  /**
   * Get reports analytics/statistics
   */
  async getReportsAnalytics(period = 'month') {
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
  },

  /**
   * Get operator's reports
   */
  async getOperatorReports(operatorId) {
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
  },

  /**
   * Get all report templates
   */
  async getTemplates() {
    try {
      const response = await api('/api/reports/templates', 'GET');

      if (!response.ok) {
        throw new Error(response.data?.message || 'Failed to fetch templates');
      }

      return response.data;
    } catch (error) {
      console.error('Get Templates API Error:', error);
      throw error;
    }
  },

  /**
   * Create a new report template
   */
  async createTemplate(templateData) {
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
  },

  /**
   * Download report as PDF
   */
  async downloadReport(reportId) {
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
  }
};

export default reportsApi;
