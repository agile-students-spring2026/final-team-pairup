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

