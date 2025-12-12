const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const api = async (path, method = "GET", body = null, headers = {}) => {
  const isFormData = body instanceof FormData;
  const authToken = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...headers,
  };

  const res = await fetch(`${API}${path}`, {
    method,
    headers: defaultHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
};

/**
 * API helper for fetching blob responses (files, images, videos, etc.)
 * Follows the same pattern as the main api helper
 */
export const apiBlob = async (path, method = "GET", body = null, headers = {}) => {
  const isFormData = body instanceof FormData;
  const authToken = localStorage.getItem('authToken');
  
  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...headers,
  };

  const res = await fetch(`${API}${path}`, {
    method,
    headers: defaultHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
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
};
