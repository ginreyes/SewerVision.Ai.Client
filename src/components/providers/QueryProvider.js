'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * QueryProvider - TanStack Query Provider with optimized defaults
 * 
 * Features:
 * - Stale-while-revalidate caching strategy
 * - Automatic refetching on window focus
 * - Error retry with exponential backoff
 * - Devtools for debugging
 */
export function QueryProvider({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data freshness settings
                        staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
                        gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection time (previously cacheTime)

                        // Refetching behavior
                        refetchOnWindowFocus: true, // Refetch when window regains focus
                        refetchOnReconnect: true, // Refetch when network reconnects
                        refetchOnMount: true, // Refetch when component mounts if stale

                        // Error handling
                        retry: 3, // Retry failed requests 3 times
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

                        // Network mode
                        networkMode: 'offlineFirst', // Try cache first, then network
                    },
                    mutations: {
                        // Mutation defaults
                        retry: 1,
                        networkMode: 'offlineFirst',
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools only render in development */}
            <ReactQueryDevtools
                initialIsOpen={false}
                position="bottom"
                buttonPosition="bottom-left"
            />
        </QueryClientProvider>
    );
}

export default QueryProvider;
