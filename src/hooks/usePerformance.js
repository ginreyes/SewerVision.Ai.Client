'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Performance metrics store
 */
const performanceMetrics = {
  apiCalls: [],
  renderTimes: [],
  errors: []
}

/**
 * Custom hook for tracking component render performance
 * 
 * @param {string} componentName - Name of the component being tracked
 * @param {Object} options - Options
 * @param {boolean} options.logToConsole - Whether to log to console (default: false in production)
 * @param {number} options.warnThreshold - Threshold in ms to warn about slow renders (default: 100ms)
 * 
 * @returns {Object} - { renderCount, lastRenderTime, avgRenderTime }
 * 
 * @example
 * const { renderCount, avgRenderTime } = useRenderPerformance('QCDashboard')
 */
export function useRenderPerformance(componentName, options = {}) {
  const {
    logToConsole = process.env.NODE_ENV === 'development',
    warnThreshold = 100
  } = options

  const renderCountRef = useRef(0)
  const renderTimesRef = useRef([])
  const startTimeRef = useRef(performance.now())
  const [stats, setStats] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0
  })

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTimeRef.current
    
    renderCountRef.current += 1
    renderTimesRef.current.push(renderTime)
    
    // Keep only last 50 render times
    if (renderTimesRef.current.length > 50) {
      renderTimesRef.current.shift()
    }

    const avgTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length

    setStats({
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      avgRenderTime: avgTime
    })

    // Log slow renders
    if (logToConsole && renderTime > warnThreshold) {
      console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
    }

    // Store metrics
    performanceMetrics.renderTimes.push({
      component: componentName,
      time: renderTime,
      timestamp: Date.now()
    })

    // Cleanup old metrics (keep last 100)
    if (performanceMetrics.renderTimes.length > 100) {
      performanceMetrics.renderTimes.shift()
    }

    // Reset start time for next render
    startTimeRef.current = performance.now()
  })

  return stats
}

/**
 * Custom hook for tracking API call performance
 * 
 * @returns {Object} - { trackApiCall, getApiStats }
 * 
 * @example
 * const { trackApiCall } = useApiPerformance()
 * 
 * const data = await trackApiCall('getDashboardStats', async () => {
 *   return await api.getDashboardStats(userId)
 * })
 */
export function useApiPerformance() {
  const trackApiCall = useCallback(async (apiName, asyncFn) => {
    const startTime = performance.now()
    const callId = `${apiName}-${Date.now()}`
    
    try {
      const result = await asyncFn()
      const endTime = performance.now()
      const duration = endTime - startTime

      performanceMetrics.apiCalls.push({
        id: callId,
        name: apiName,
        duration,
        success: true,
        timestamp: Date.now()
      })

      // Cleanup old metrics
      if (performanceMetrics.apiCalls.length > 100) {
        performanceMetrics.apiCalls.shift()
      }

      // Warn about slow API calls
      if (duration > 2000) {
        console.warn(`[Performance] Slow API call ${apiName}: ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const endTime = performance.now()
      
      performanceMetrics.apiCalls.push({
        id: callId,
        name: apiName,
        duration: endTime - startTime,
        success: false,
        error: error.message,
        timestamp: Date.now()
      })

      performanceMetrics.errors.push({
        type: 'api',
        name: apiName,
        error: error.message,
        timestamp: Date.now()
      })

      throw error
    }
  }, [])

  const getApiStats = useCallback(() => {
    const successfulCalls = performanceMetrics.apiCalls.filter(c => c.success)
    const failedCalls = performanceMetrics.apiCalls.filter(c => !c.success)
    
    const avgDuration = successfulCalls.length > 0
      ? successfulCalls.reduce((sum, c) => sum + c.duration, 0) / successfulCalls.length
      : 0

    return {
      totalCalls: performanceMetrics.apiCalls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      avgDuration,
      errorRate: performanceMetrics.apiCalls.length > 0
        ? (failedCalls.length / performanceMetrics.apiCalls.length) * 100
        : 0
    }
  }, [])

  return { trackApiCall, getApiStats }
}

/**
 * Get all performance metrics
 */
export function getPerformanceMetrics() {
  return { ...performanceMetrics }
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics() {
  performanceMetrics.apiCalls = []
  performanceMetrics.renderTimes = []
  performanceMetrics.errors = []
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  const apiCalls = performanceMetrics.apiCalls
  const renderTimes = performanceMetrics.renderTimes

  // Calculate API metrics
  const successfulApiCalls = apiCalls.filter(c => c.success)
  const avgApiDuration = successfulApiCalls.length > 0
    ? successfulApiCalls.reduce((sum, c) => sum + c.duration, 0) / successfulApiCalls.length
    : 0

  // Calculate render metrics
  const avgRenderTime = renderTimes.length > 0
    ? renderTimes.reduce((sum, r) => sum + r.time, 0) / renderTimes.length
    : 0

  // Get slowest components
  const componentRenders = {}
  renderTimes.forEach(r => {
    if (!componentRenders[r.component]) {
      componentRenders[r.component] = []
    }
    componentRenders[r.component].push(r.time)
  })

  const slowestComponents = Object.entries(componentRenders)
    .map(([component, times]) => ({
      component,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      renderCount: times.length
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5)

  return {
    api: {
      totalCalls: apiCalls.length,
      successRate: apiCalls.length > 0
        ? (successfulApiCalls.length / apiCalls.length) * 100
        : 100,
      avgDuration: avgApiDuration
    },
    renders: {
      totalRenders: renderTimes.length,
      avgRenderTime,
      slowestComponents
    },
    errors: performanceMetrics.errors.length
  }
}

export default useRenderPerformance
