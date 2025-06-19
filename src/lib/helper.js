const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export const api = async (path, method = "GET", body = null, headers = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(isJson ? data.message || "API request failed" : data);
  }

  return data;
};
