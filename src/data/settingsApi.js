"use client";

import { api } from "@/lib/helper";


/**
 * Settings API functions
 */
export const settingsApi = {
  /**
   * Get all settings
   */
  async getSettings(organizationId = null) {
    const url = organizationId 
      ? `/api/settings?organizationId=${organizationId}`
      : '/api/settings';
    
    const response = await api(url, 'GET');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.data;
  },

  /**
   * Get specific settings section
   */
  async getSettingsSection(section, organizationId = null) {
    const url = organizationId 
      ? `/api/settings/section/${section}?organizationId=${organizationId}`
      : `/api/settings/section/${section}`;
    
    const response = await api(url, 'GET');
    if (!response.ok) {
      throw new Error(`Failed to fetch ${section} settings`);
    }
    return response.data;
  },

  /**
   * Update all settings
   */
  async updateSettings(settings, userId, organizationId = null) {
    let url = `/api/settings?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'PUT', settings);
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return response.data;
  },

  /**
   * Update specific settings section
   */
  async updateSettingsSection(section, sectionData, userId, organizationId = null) {
    let url = `/api/settings/section/${section}?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'PATCH', sectionData);
    if (!response.ok) {
      throw new Error(`Failed to update ${section} settings`);
    }
    return response.data;
  },

  /**
   * Update AI Models settings
   */
  async updateAIModels(data, userId, organizationId = null) {
    let url = `/api/settings/ai-models?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'PATCH', data);
    if (!response.ok) {
      throw new Error('Failed to update AI Models settings');
    }
    return response.data;
  },

  /**
   * Update Cloud & Streaming settings
   */
  async updateCloudStreaming(data, userId, organizationId = null) {
    return this.updateSettingsSection('cloudStreaming', data, userId, organizationId);
  },

  /**
   * Update QC Workflow settings
   */
  async updateQCWorkflow(data, userId, organizationId = null) {
    return this.updateSettingsSection('qcWorkflow', data, userId, organizationId);
  },

  /**
   * Update Notification settings
   */
  async updateNotifications(data, userId, organizationId = null) {
    return this.updateSettingsSection('notifications', data, userId, organizationId);
  },

  /**
   * Update AI Learning settings
   */
  async updateAILearning(data, userId, organizationId = null) {
    return this.updateSettingsSection('aiLearning', data, userId, organizationId);
  },

  /**
   * Update AWS Configuration
   */
  async updateAWSConfig(data, userId, organizationId = null) {
    let url = `/api/settings/aws-config?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'PATCH', data);
    if (!response.ok) {
      throw new Error('Failed to update AWS configuration');
    }
    return response.data;
  },

  /**
   * Update System Admin settings
   */
  async updateSystemAdmin(data, userId, organizationId = null) {
    let url = `/api/settings/system-admin?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'PATCH', data);
    if (!response.ok) {
      throw new Error('Failed to update System Admin settings');
    }
    return response.data;
  },

  /**
   * Reset settings to defaults
   */
  async resetSettings(section = null, userId, organizationId = null) {
    let url = section 
      ? `/api/settings/reset/${section}?userId=${userId}`
      : `/api/settings/reset?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'POST');
    if (!response.ok) {
      throw new Error('Failed to reset settings');
    }
    return response.data;
  },

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled, message, userId, organizationId = null) {
    let url = `/api/settings/maintenance?userId=${userId}`;
    if (organizationId) url += `&organizationId=${organizationId}`;
    
    const response = await api(url, 'POST', { enabled, message });
    if (!response.ok) {
      throw new Error('Failed to toggle maintenance mode');
    }
    return response.data;
  },
};

export default settingsApi;