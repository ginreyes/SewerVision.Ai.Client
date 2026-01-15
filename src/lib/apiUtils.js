'use client'

/**
 * API Utilities Module
 * 
 * Provides enhanced API utilities including retry logic, error handling,
 * request deduplication, and response caching.
 * 
 * @module lib/apiUtils
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [baseDelay=1000] - Base delay in milliseconds
 * @property {number} [maxDelay=10000] - Maximum delay between retries
 * @property {boolean} [exponentialBackoff=true] - Use exponential backoff
 * @property {Function} [shouldRetry] - Custom function to determine if should retry
 * @property {Function} [onRetry] - Callback when retry occurs
 */

/**
 * Default retry options
 */
const defaultRetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  shouldRetry: (error, attempt) => {
    // Retry on network errors or 5xx server errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return true
    }
    if (error.status >= 500 && error.status < 600) {
      return true
    }
    // Don't retry on 4xx errors (client errors)
    if (error.status >= 400 && error.status < 500) {
      return false
    }
    return attempt < 3
  },
  onRetry: null
}

/**
 * Calculate delay for retry with exponential backoff
 * 
 * @param {number} attempt - Current attempt number
 * @param {RetryOptions} options - Retry options
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(attempt, options) {
  if (!options.exponentialBackoff) {
    return options.baseDelay
  }
  
  const delay = options.baseDelay * Math.pow(2, attempt - 1)
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.min(delay + jitter, options.maxDelay)
}

/**
 * Sleep for specified milliseconds
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry wrapper for async functions with exponential backoff
 * 
 * @param {Function} asyncFn - Async function to retry
 * @param {RetryOptions} options - Retry options
 * @returns {Promise<any>} - Result of the async function
 * 
 * @example
 * const data = await withRetry(
 *   () => api('/api/dashboard/stats', 'GET'),
 *   { maxRetries: 3, onRetry: (err, attempt) => console.log(`Retry ${attempt}`) }
 * )
 */
export async function withRetry(asyncFn, options = {}) {
  const opts = { ...defaultRetryOptions, ...options }
  let lastError
  
  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      const result = await asyncFn()
      
      // Check if the response indicates an error
      if (result && result.ok === false) {
        const error = new Error(result.data?.message || result.data?.error || 'Request failed')
        error.status = result.status
        error.data = result.data
        throw error
      }
      
      return result
    } catch (error) {
      lastError = error
      
      // Check if we should retry
      if (attempt <= opts.maxRetries && opts.shouldRetry(error, attempt)) {
        const delay = calculateDelay(attempt, opts)
        
        // Call onRetry callback if provided
        opts.onRetry?.(error, attempt, delay)
        
        await sleep(delay)
      } else {
        throw error
      }
    }
  }
  
  throw lastError
}

/**
 * In-flight request map for deduplication
 */
const inFlightRequests = new Map()

/**
 * Deduplicate concurrent identical requests
 * 
 * @param {string} key - Unique key for the request
 * @param {Function} asyncFn - Async function to execute
 * @returns {Promise<any>} - Result of the async function
 * 
 * @example
 * // Multiple calls with same key will return the same promise
 * const [result1, result2] = await Promise.all([
 *   dedupeRequest('user-123', () => fetchUser(123)),
 *   dedupeRequest('user-123', () => fetchUser(123))
 * ])
 */
export async function dedupeRequest(key, asyncFn) {
  // Check if request is already in flight
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }
  
  // Create new request promise
  const requestPromise = asyncFn().finally(() => {
    inFlightRequests.delete(key)
  })
  
  inFlightRequests.set(key, requestPromise)
  return requestPromise
}

/**
 * Parse error from API response
 * 
 * @param {Object} response - API response object
 * @returns {Error} - Parsed error object
 */
export function parseApiError(response) {
  const error = new Error()
  
  if (response.data) {
    if (typeof response.data === 'string') {
      error.message = response.data
    } else {
      error.message = response.data.message || response.data.error || 'An error occurred'
      error.code = response.data.code
      error.details = response.data.details
    }
  } else {
    error.message = `HTTP Error ${response.status}`
  }
  
  error.status = response.status
  error.response = response
  
  return error
}

/**
 * Format error for user display
 * 
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export function formatErrorMessage(error) {
  // Network errors
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  // Server errors
  if (error.status >= 500) {
    return 'The server encountered an error. Please try again later.'
  }
  
  // Authentication errors
  if (error.status === 401) {
    return 'Your session has expired. Please log in again.'
  }
  
  // Authorization errors
  if (error.status === 403) {
    return 'You do not have permission to perform this action.'
  }
  
  // Not found errors
  if (error.status === 404) {
    return 'The requested resource was not found.'
  }
  
  // Validation errors
  if (error.status === 400 || error.status === 422) {
    return error.message || 'Please check your input and try again.'
  }
  
  // Default
  return error.message || 'An unexpected error occurred. Please try again.'
}

/**
 * Check if error is a network error
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} - True if network error
 */
export function isNetworkError(error) {
  return error.name === 'TypeError' && error.message === 'Failed to fetch'
}

/**
 * Check if error is a server error (5xx)
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} - True if server error
 */
export function isServerError(error) {
  return error.status >= 500 && error.status < 600
}

/**
 * Check if error is an authentication error
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} - True if auth error
 */
export function isAuthError(error) {
  return error.status === 401 || error.status === 403
}

export default {
  withRetry,
  dedupeRequest,
  parseApiError,
  formatErrorMessage,
  isNetworkError,
  isServerError,
  isAuthError
}
