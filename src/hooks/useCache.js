'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Simple in-memory cache store
 */
const cacheStore = new Map()

/**
 * Custom hook for data caching with TTL support
 * 
 * @param {string} key - Unique cache key
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {boolean} options.staleWhileRevalidate - Return stale data while fetching fresh (default: true)
 * @param {Function} options.onError - Error callback
 * 
 * @returns {Object} - { data, loading, error, refresh, invalidate }
 * 
 * @example
 * const { data, loading, refresh } = useCache(
 *   `dashboard-stats-${userId}`,
 *   () => api.getDashboardStats(userId),
 *   { ttl: 60000 }
 * )
 */
export function useCache(key, fetchFn, options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    staleWhileRevalidate = true,
    onError
  } = options

  const [data, setData] = useState(() => {
    const cached = cacheStore.get(key)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data
    }
    return null
  })
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)

  const fetchData = useCallback(async (force = false) => {
    // Check cache first
    const cached = cacheStore.get(key)
    const now = Date.now()

    if (!force && cached && now < cached.expiresAt) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }

    // Return stale data while fetching fresh
    if (staleWhileRevalidate && cached) {
      setData(cached.data)
    }

    // Prevent concurrent fetches
    if (fetchingRef.current) return

    fetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      
      // Update cache
      cacheStore.set(key, {
        data: result,
        expiresAt: now + ttl,
        updatedAt: now
      })

      setData(result)
      setLoading(false)
      fetchingRef.current = false
      return result
    } catch (err) {
      setError(err)
      setLoading(false)
      fetchingRef.current = false
      onError?.(err)
      throw err
    }
  }, [key, fetchFn, ttl, staleWhileRevalidate, onError])

  // Refresh function (forces fresh fetch)
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Invalidate cache
  const invalidate = useCallback(() => {
    cacheStore.delete(key)
    setData(null)
  }, [key])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [key])

  return {
    data,
    loading,
    error,
    refresh,
    invalidate
  }
}

/**
 * Global cache utilities
 */
export const cacheUtils = {
  /**
   * Get cached data by key
   */
  get(key) {
    const cached = cacheStore.get(key)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data
    }
    return null
  },

  /**
   * Set cache data
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    cacheStore.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      updatedAt: Date.now()
    })
  },

  /**
   * Invalidate specific cache key
   */
  invalidate(key) {
    cacheStore.delete(key)
  },

  /**
   * Invalidate all cache keys matching a pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of cacheStore.keys()) {
      if (regex.test(key)) {
        cacheStore.delete(key)
      }
    }
  },

  /**
   * Clear all cache
   */
  clear() {
    cacheStore.clear()
  },

  /**
   * Get cache statistics
   */
  getStats() {
    let validCount = 0
    let expiredCount = 0
    const now = Date.now()

    for (const [, value] of cacheStore) {
      if (now < value.expiresAt) {
        validCount++
      } else {
        expiredCount++
      }
    }

    return {
      totalEntries: cacheStore.size,
      validEntries: validCount,
      expiredEntries: expiredCount
    }
  }
}

export default useCache
