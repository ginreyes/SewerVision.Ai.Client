/**
 * Workload tier styling — matches the classifyWorkload() thresholds on the
 * backend (low < 4 open items, balanced < 10, heavy >= 10).
 */
export const WORKLOAD_CONFIG = {
    low: {
        label: 'Low',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
    balanced: {
        label: 'Balanced',
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800',
        dot: 'bg-indigo-500',
    },
    heavy: {
        label: 'Heavy',
        className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
    },
};

export const getWorkloadConfig = (workload) =>
    WORKLOAD_CONFIG[workload] || WORKLOAD_CONFIG.balanced;
