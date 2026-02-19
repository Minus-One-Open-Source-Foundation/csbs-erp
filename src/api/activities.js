// src/activities.js
const API_BASE = (() => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
     console.warn("VITE_API_URL not set in .env");
     return "";
  }
  if (!url.endsWith('/api')) {
    return url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  return url;
})();

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...getAuthHeader(),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || "API error");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const getPendingActivities = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const path = `/activities/pending${qs ? `?${qs}` : ""}`;
  return request(path, { method: "GET" });
};

export const approveActivity = (id) =>
  request(`/activities/${id}/approve`, { method: "POST" });

export const rejectActivity = (id, reason) =>
  request(`/activities/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
