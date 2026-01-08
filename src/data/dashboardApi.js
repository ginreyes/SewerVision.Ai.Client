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
    try {
      const response = await api('/api/dashboard/stats', 'GET');
      
      if (!response.ok) {
        // Safely extract error message
        let errorMessage = `Failed to fetch dashboard statistics (${response.status || 'unknown'})`;
        try {
          if (response.data?.message) {
            errorMessage = String(response.data.message);
          } else if (response.data?.error) {
            errorMessage = String(response.data.error);
          }
        } catch (e) {
          // If we can't extract the error message, use the default
        }
        throw new Error(errorMessage);
      }
      
      // Handle both response formats: { status: 'success', data: {...} } or direct data
      if (response.data?.data) {
        return response.data.data;
      }
      
      // If data is directly in response.data, return it
      return response.data;
    } catch (error) {
      // Use console.log instead of console.error to avoid Next.js error handler interception
      try {
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        console.log('Dashboard API Error:', errorMsg);
      } catch (logError) {
        // Silently fail if we can't log
      }
      throw error;
    }
  },
};

export default dashboardApi;

