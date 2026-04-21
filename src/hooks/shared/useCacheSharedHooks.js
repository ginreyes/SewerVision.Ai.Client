'use client';

import { useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/data/dashboardApi';
import { qcApi } from '@/data/qcApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ CACHE UTILITIES ============
 */

/**
 * Hook for prefetching and cache management
 */
export function useQueryUtilities() {
    const queryClient = useQueryClient();

    return {
        /**
         * Prefetch dashboard stats
         */
        prefetchDashboardStats: () => {
            queryClient.prefetchQuery({
                queryKey: queryKeys.dashboardStats,
                queryFn: () => dashboardApi.getDashboardStats(),
            });
        },

        /**
         * Prefetch QC dashboard stats
         */
        prefetchQCDashboardStats: (qcTechnicianId) => {
            if (qcTechnicianId) {
                queryClient.prefetchQuery({
                    queryKey: queryKeys.qcDashboardStats(qcTechnicianId),
                    queryFn: () => qcApi.getDashboardStats(qcTechnicianId),
                });
            }
        },

        /**
         * Invalidate all queries matching a key pattern
         */
        invalidateQueries: (keyPattern) => {
            queryClient.invalidateQueries({ queryKey: keyPattern });
        },

        /**
         * Clear all cached data
         */
        clearAllCache: () => {
            queryClient.clear();
        },

        /**
         * Get cached data without refetching
         */
        getCachedData: (queryKey) => {
            return queryClient.getQueryData(queryKey);
        },

        /**
         * Set data directly in cache
         */
        setCachedData: (queryKey, data) => {
            queryClient.setQueryData(queryKey, data);
        },

        /**
         * Refetch specific query
         */
        refetchQuery: (queryKey) => {
            queryClient.refetchQueries({ queryKey });
        },
    };
}
