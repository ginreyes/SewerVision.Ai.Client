'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook that debounces a value
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 500)
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm)
 *   }
 * }, [debouncedSearchTerm])
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook that returns a debounced callback function
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @param {Array} dependencies - Dependencies for the callback
 * @returns {Function} - The debounced function
 * 
 * @example
 * const handleSearch = useDebouncedCallback(
 *   (term) => {
 *     api.search(term)
 *   },
 *   500,
 *   []
 * )
 */
export function useDebouncedCallback(callback, delay = 300, dependencies = []) {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
    }, delay)
  }, [delay, ...dependencies])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Custom hook for throttling a callback function
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum delay between calls in milliseconds (default: 300ms)
 * @returns {Function} - The throttled function
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   updateScrollPosition()
 * }, 100)
 */
export function useThrottle(callback, delay = 300) {
  const lastRunRef = useRef(Date.now())
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback((...args) => {
    const now = Date.now()
    const timeSinceLastRun = now - lastRunRef.current

    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now
      callbackRef.current(...args)
    } else {
      // Schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        callbackRef.current(...args)
      }, delay - timeSinceLastRun)
    }
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

export default useDebounce
