'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Custom hook for real-time data polling with automatic cleanup
 * 
 * @param {Function} fetchFn - The async function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds (default: 30000ms)
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether polling is enabled (default: true)
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onSuccess - Success callback
 * @param {Array} options.dependencies - Dependencies that should trigger a refetch
 * 
 * @returns {Object} - { isPolling, lastUpdated, error, refresh, pause, resume }
 * 
 * @example
 * const { refresh, isPolling, lastUpdated } = usePolling(
 *   () => fetchDashboardData(userId),
 *   30000,
 *   { enabled: !!userId, onError: (err) => console.error(err) }
 * )
 */
export function usePolling(fetchFn, interval = 30000, options = {}) {
  const {
    enabled = true,
    immediate = true,
    onError,
    onSuccess,
    dependencies = []
  } = options

  const [isPolling, setIsPolling] = useState(enabled)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const isMountedRef = useRef(true)

  const executeFetch = useCallback(async (silent = false) => {
    if (!isMountedRef.current) return

    try {
      setError(null)
      const result = await fetchFn()
      
      if (isMountedRef.current) {
        setLastUpdated(new Date())
        onSuccess?.(result)
      }
      
      return result
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
        onError?.(err)
      }
      throw err
    }
  }, [fetchFn, onError, onSuccess])

  // Manual refresh function
  const refresh = useCallback(async () => {
    return executeFetch(false)
  }, [executeFetch])

  // Pause polling
  const pause = useCallback(() => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Resume polling
  const resume = useCallback(() => {
    setIsPolling(true)
  }, [])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true

    if (enabled && immediate) {
      executeFetch(false)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [enabled, immediate, ...dependencies])

  // Polling effect
  useEffect(() => {
    if (!enabled || !isPolling) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      executeFetch(true)
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, isPolling, interval, executeFetch])

  return {
    isPolling,
    lastUpdated,
    error,
    refresh,
    pause,
    resume
  }
}

export default usePolling
