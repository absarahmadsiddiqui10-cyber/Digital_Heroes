const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const token = () => localStorage.getItem("dh_token");

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("dh_user") || "null");
  } catch {
    return null;
  }
};

export function setSession(d) {
  localStorage.setItem("dh_token", d.token);
  localStorage.setItem("dh_user", JSON.stringify(d.user));
}

export function clearSession() {
  localStorage.removeItem("dh_token");
  localStorage.removeItem("dh_user");
}

export async function api(path, options = {}) {
  let headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token()) {
    headers.Authorization = "Bearer " + token();
  }

  let r = await fetch(BASE + path, { ...options, headers }),
    d = await r.json().catch(() => ({ message: "Invalid response" }));

  if (!r.ok) {
    throw Error(d.message || "Request failed");
  }

  return d;
}
