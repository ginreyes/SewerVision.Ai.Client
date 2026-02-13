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

// Caching hooks and utilities (legacy - consider using TanStack Query hooks instead)
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

// TanStack Query hooks for data fetching and caching
export {
  // Dashboard hooks
  useDashboardStats,

  // Operator hooks
  useOperatorDashboardStats,
  useOperatorTasks,
  useOperatorReports,
  useOperatorOverview,
  useStartRecording,
  useStopRecording,

  // QC Technician hooks
  useQCDashboardStats,
  useQCAssignments,
  useQCAssignment,
  useProject,
  useProjectVideos,
  useProjectDetections,
  useDetection,
  useDetectionComments,
  useReviewDetection,
  useCreateManualDetection,
  useCompleteQCAssignment,
  useStartQCSession,
  useEndQCSession,
  useAddDetectionComment,
  useQCCertifications,
  useCreateCertification,
  useQCReports,
  useQCReportByProject,

  // Notes hooks
  useNotes,
  useNote,
  useNotesStats,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,

  // Cache utilities
  useQueryUtilities,
  queryKeys,
} from './useQueryHooks'

