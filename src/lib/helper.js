import { BACKEND_URL as API } from "./config";

// Simple cookie helpers (client-side only)
export const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name, value, options = {}) => {
  if (typeof document === "undefined") return;
  const {
    days = 1,
    path = "/",
    sameSite = "Lax",
    secure = window.location.protocol === "https:",
  } = options;

  const maxAge = days * 24 * 60 * 60;
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure";
  document.cookie = cookie;
};

export const deleteCookie = (name) => {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0`;
};

// Helper function to access auth token from cookies (no localStorage)
const getAuthToken = () => {
  try {
    return getCookie("authToken");
  } catch (error) {
    console.warn("Failed to read auth token cookie:", error);
    return null;
  }
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

// June 22 — backward-compat unwrap for the response-shape migration.
// Backend is migrating from { status: 'error', message } -> { ok, message,
// statusCode }. unwrap() reads either shape and normalizes so callsites don't
// have to special-case. When every controller is migrated, the legacy branches
// can be deleted.
export const unwrap = (apiResult) => {
  if (!apiResult || typeof apiResult !== "object") {
    return { ok: false, data: null, message: "No response", statusCode: 0 };
  }
  const httpOk = apiResult.ok === true && apiResult.status >= 200 && apiResult.status < 300;
  const body = apiResult.data;
  if (body && typeof body === "object") {
    if ("ok" in body) {
      return {
        ok: !!body.ok && httpOk,
        data: body.ok ? body.data : null,
        message: body.message || (httpOk ? "" : "Request failed"),
        statusCode: body.statusCode || apiResult.status,
        code: body.code,
      };
    }
    if (body.status === "error") {
      return { ok: false, data: null, message: body.message || "Request failed", statusCode: apiResult.status };
    }
    if (body.status === "success") {
      return { ok: true, data: body.data ?? body, message: "", statusCode: apiResult.status };
    }
  }
  return {
    ok: httpOk,
    data: httpOk ? body : null,
    message: httpOk ? "" : (body && body.message) || "Request failed",
    statusCode: apiResult.status,
  };
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
