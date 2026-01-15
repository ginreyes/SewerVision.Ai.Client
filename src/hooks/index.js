'use client'

/**
 * Custom Hooks Index
 * 
 * This file exports all custom hooks for easy importing throughout the application.
 * 
 * @module hooks
 */

// Polling hook for real-time data updates
export { usePolling } from './usePolling'

// Debounce and throttle hooks for performance optimization
export { 
  useDebounce, 
  useDebouncedCallback, 
  useThrottle 
} from './useDebounce'

// Caching hooks and utilities
export { 
  useCache, 
  cacheUtils 
} from './useCache'

// Performance monitoring hooks
export { 
  useRenderPerformance, 
  useApiPerformance,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  getPerformanceSummary
} from './usePerformance'
