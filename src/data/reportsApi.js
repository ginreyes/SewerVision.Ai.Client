"use client";

import { api } from "@/lib/helper";

/**
 * Reports API functions for QC Technician
 */
export const reportsApi = {
  /**
   * Get QC Technician Reports
   */
  async getReports(qcTechnicianId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters.dateRange) {
      params.append('dateRange', filters.dateRange);
    }

    const response = await api(`/api/qc-technicians/reports-list/${qcTechnicianId}?${params.toString()}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch reports');
    }
    
    return response.data;
  },

  /**
   * Create Report
   */
  async createReport(reportData) {
    const response = await api('/api/qc-technicians/reports', 'POST', reportData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to create report');
    }
    
    return response.data.data;
  },

  /**
   * Get Report Templates
   */
  async getTemplates(userId) {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api(`/api/qc-technicians/templates${params}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch templates');
    }
    
    return response.data.data;
  },

  /**
   * Create Report Template
   */
  async createTemplate(templateData) {
    const response = await api('/api/qc-technicians/templates', 'POST', templateData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to create template');
    }
    
    return response.data.data;
  },

  /**
   * Get Projects for Report Creation
   */
  async getProjectsForReport(qcTechnicianId) {
    const response = await api(`/api/qc-technicians/reports/projects/${qcTechnicianId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch projects');
    }
    
    return response.data.data;
  },

  /**
   * Get Detailed 2-Day Report
   */
  async getDetailed2DayReport(qcTechnicianId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api(
      `/api/qc-technicians/reports/detailed-2day/${qcTechnicianId}?${params.toString()}`,
      'GET'
    );
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch detailed report');
    }
    
    return response.data.data;
  }
};

export default reportsApi;

