const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Helper function to safely access localStorage (client-side only)
const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return null;
    }
  }
  return null;
};

export const api = async (path, method = "GET", body = null, headers = {}) => {
  const isFormData = body instanceof FormData;
  const authToken = getAuthToken();

  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: defaultHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
      credentials: "include", // Important for CORS and sending cookies if needed
    });

    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    // Safety check for empty responses
    let data;
    try {
      if (isJson) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = text ? text : null;
      }
    } catch (parseError) {
      console.warn('Failed to parse response:', parseError);
      data = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (networkError) {
    console.error('Network Error:', networkError);
    return {
      ok: false,
      status: 0,
      data: { message: 'Network error: Please check your connection or server status.' },
      originalError: networkError
    };
  }
};

/**
 * API helper for fetching blob responses (files, images, videos, etc.)
 * Follows the same pattern as the main api helper
 */
export const apiBlob = async (path, method = "GET", body = null, headers = {}) => {
  const isFormData = body instanceof FormData;
  const authToken = getAuthToken();

  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: defaultHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : null,
      credentials: "include",
    });

    let errorData = null;
    if (!res.ok) {
      try {
        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        errorData = isJson ? await res.json() : await res.text();
      } catch {
        errorData = { message: 'Failed to fetch file' };
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      blob: res.ok ? await res.blob() : null,
      error: errorData,
    };
  } catch (networkError) {
    console.error('Network Error (Blob):', networkError);
    return {
      ok: false,
      status: 0,
      headers: null,
      blob: null,
      error: { message: 'Network error: Please check your connection.' }
    };
  }
};
