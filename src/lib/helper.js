const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const api = async (path, method = "GET", body = null, headers = {}) => {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
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
