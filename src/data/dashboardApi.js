"use client";

import { api } from "@/lib/helper";

/**
 * Dashboard API functions
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics for admin
   */
  async getDashboardStats() {
    const response = await api('/api/dashboard/stats', 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch dashboard statistics');
    }
    
    return response.data.data;
  },
};

export default dashboardApi;

