function normalizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

/**
 * Base URL for API requests.
 *
 * - In production with separate frontend/backend services, set
 *   REACT_APP_API_BASE_URL to your Railway backend public URL.
 * - If empty, requests default to same-origin (useful if you later serve
 *   frontend and backend from the same host).
 */
export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);

/** Absolute URL for API paths when frontend and backend are on different hosts. */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${p}` : p;
}
