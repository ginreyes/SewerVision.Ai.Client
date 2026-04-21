'use client';

/**
 * Barrel re-export for back-compat.
 * The contents previously in this file were split into domain-specific files
 * under `src/hooks/shared/`. All existing imports from
 * `@/hooks/useSharedHooks` continue to work unchanged.
 */

export * from './shared/useNotesSharedHooks';
export * from './shared/useProjectSharedHooks';
export * from './shared/useUserSharedHooks';
export * from './shared/useSupportSharedHooks';
export * from './shared/useKnowledgeSurveySharedHooks';
export * from './shared/useComplaintSharedHooks';
export * from './shared/useMessagingSharedHooks';
export * from './shared/useCacheSharedHooks';
