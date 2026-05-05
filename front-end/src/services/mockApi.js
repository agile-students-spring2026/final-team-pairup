/**
 * Central frontend API service layer.
 * Note: no local mock datasets are used here.
 */

import { apiUrl } from "../config/apiBase";

export const PARTNERS_MOCK_NOW = Date.now();

/** Dispatched after a friend invite is accepted so App can refetch GET /api/friends. */
export const PARTNERS_REFRESH_EVENT = "pairup:partners-refresh";
export const AUTH_EXPIRED_EVENT = "pairup:auth-expired";
let authExpiryNotified = false;

function getStoredUserId() {
  if (typeof window === "undefined") return "current-user";
  return localStorage.getItem("userId") || "current-user";
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export function getAuthHeaders(headers = {}) {
  const token = getStoredToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Legacy stub routes still expect ?userId= in dev
 * (for example some older /api/users/:id paths).
 */
export function withAuthQuery(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}userId=${encodeURIComponent(getStoredUserId())}`;
}

function withBearer(headers = {}) {
  return getAuthHeaders(headers);
}

function notifyPartnersRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PARTNERS_REFRESH_EVENT));
  }
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: withBearer(options.headers || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    if (!authExpiryNotified && typeof window !== "undefined") {
      authExpiryNotified = true;
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    throw new Error(data.error || data.message || "Unauthorized");
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }
  return data;
}

function initialsFromName(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function apiFriendToPartnerRow({ friendUserId, friendsSince, user }) {
  const name = user?.displayName || "Partner";
  return {
    id: friendUserId,
    name,
    initials: initialsFromName(name),
    backgroundLabel: user?.background || user?.school || "—",
    practiceTags: Array.isArray(user?.practiceFocus) ? user.practiceFocus : [],
    lastActivityAt: new Date(friendsSince).getTime() || Date.now(),
    lastMessagePreview: "Tap to open partner space",
    upcomingSession: null,
  };
}

async function fetchLegacyUser(userId) {
  try {
    const res = await fetch(withAuthQuery(apiUrl(`/api/users/${userId}`)), {
      headers: withBearer(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn("fetchLegacyUser:", err.message);
    return null;
  }
}

/** GET /api/friends — returns UI partner rows; [] if the API is unreachable. */
export async function fetchPartnersFromFriendsApi() {
  try {
    const res = await fetch(apiUrl("/api/friends"), {
      headers: withBearer(),
    });

    if (!res.ok) throw new Error("friends list failed");

    const data = await res.json();
    return (data.friends || []).map(apiFriendToPartnerRow);
  } catch (err) {
    console.warn("fetchPartnersFromFriendsApi:", err.message);
    return [];
  }
}

/** Merge API-backed friends into existing partner state (keeps demo rows unless same id). */
export function mergePartnerRows(existing, fromApi) {
  return Array.isArray(fromApi) ? [...fromApi] : [];
}

/** Initial partner list for local state; API-only (no demo seeds). */
export function getInitialPartners() {
  return [];
}

/** Seed row for default profile form (empty until profile API loads). */
export function getDefaultProfileSeed() {
  return null;
}

// ── Discover ──────────────────────────────────────────────────────────────────

/** Shuffled sample for Discover browse (GET /api/matches/random). */
export async function fetchDiscoverRandomUsers() {
  try {
    const base = withAuthQuery(apiUrl("/api/matches/random"));
    const url = `${base}&_=${Date.now()}`;
    const data = await requestJson(url, {
      cache: "no-store",
    });
    return data.matches || [];
  } catch (err) {
    console.warn("fetchDiscoverRandomUsers:", err.message);
    return [];
  }
}

/** Ranked algorithm matches (GET /api/matches). */
export async function fetchDiscoverBestMatches() {
  try {
    const base = withAuthQuery(apiUrl("/api/matches"));
    const url = `${base}&_=${Date.now()}`;
    const data = await requestJson(url, {
      cache: "no-store",
    });
    return data.matches || [];
  } catch (err) {
    console.warn("fetchDiscoverBestMatches:", err.message);
    return [];
  }
}

// ── User profile (view another user) ─────────────────────────────────────────

export async function fetchUserById(id) {
  try {
    const data = await requestJson(withAuthQuery(apiUrl(`/api/users/${id}`)));
    return data.user || null;
  } catch (err) {
    console.warn("fetchUserById:", err.message);
    return null;
  }
}

// ── Matches ───────────────────────────────────────────────────────────────────

function mapFriendRequestToInviteCard(request, user) {
  const senderName = user?.displayName || "Someone";
  return {
    id: request.id,
    kind: "friend",
    senderName,
    senderInitials: initialsFromName(senderName),
    role: user?.role ?? "—",
    tier: user?.targetTier ?? "—",
    background: user?.background ?? "—",
    practiceFocus: Array.isArray(user?.practiceFocus) ? user.practiceFocus : [],
    bio: user?.bio || "",
    matchScore: null,
    availabilityOverlap: [],
    avatarSeed:
      String(request.fromUserId || "friend").replace(/[^a-zA-Z0-9]/g, "") ||
      "friend",
    sentAt: new Date(request.createdAt).getTime() || Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
  };
}

function mapFriendRequestToSentInviteCard(request, user) {
  const recipientName = user?.displayName || "Someone";
  return {
    id: request.id,
    kind: "friend",
    recipientName,
    recipientInitials: initialsFromName(recipientName),
    role: user?.role ?? "—",
    tier: user?.targetTier ?? "—",
    background: user?.background ?? "—",
    practiceFocus: Array.isArray(user?.practiceFocus) ? user.practiceFocus : [],
    bio: user?.bio || "",
    matchScore: null,
    avatarSeed:
      String(request.toUserId || "friend").replace(/[^a-zA-Z0-9]/g, "") ||
      "friend",
    sentAt: new Date(request.createdAt).getTime() || Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
  };
}

export async function getReceivedInvites() {
  try {
    const data = await requestJson(apiUrl("/api/friends/requests?box=incoming"));
    const requests = data.requests || [];
    const cards = await Promise.all(
      requests.map(async (r) => {
        const user = await fetchLegacyUser(r.fromUserId);
        return mapFriendRequestToInviteCard(r, user);
      })
    );
    return cards.filter(Boolean);
  } catch {
    return [];
  }
}

/** Returns invites the current user has sent that are still pending. */
export async function getSentInvites() {
  try {
    const data = await requestJson(apiUrl("/api/friends/requests?box=outgoing"));
    const requests = data.requests || [];
    const cards = await Promise.all(
      requests.map(async (r) => {
        const user = await fetchLegacyUser(r.toUserId);
        return mapFriendRequestToSentInviteCard(r, user);
      })
    );
    return cards.filter(Boolean);
  } catch {
    return [];
  }
}

/** Returns recommended users to invite (shown inline on the Waiting tab). */
export async function getMatchRecommendations() {
  try {
    const [matchesData, outgoingData] = await Promise.all([
      requestJson(withAuthQuery(apiUrl("/api/matches"))),
      requestJson(apiUrl("/api/friends/requests?box=outgoing")),
    ]);

    const blockedIds = new Set((outgoingData.requests || []).map((r) => r.toUserId));
    return (matchesData.matches || [])
      .filter((m) => {
        const id = m.userId || m.id || m._id;
        return id && !blockedIds.has(id);
      })
      .slice(0, 5)
      .map((m) => {
        const id = m.userId || m.id || m._id;
        const name = m.displayName || m.name || "Someone";
        return {
          id,
          name,
          avatarSeed: String(id).replace(/[^a-zA-Z0-9]/g, "") || "match",
          role: m.role ?? "—",
          tier: m.targetTier ?? "—",
          background: m.background ?? "—",
          matchScore: m.matchPercent ?? 0,
        };
      });
  } catch {
    return [];
  }
}

/** Accept a received invite by id. */
export async function acceptInvite(id) {
  const res = await fetch(apiUrl(`/api/friends/requests/${id}`), {
    method: "PATCH",
    headers: withBearer({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status: "accepted" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to accept invite");
  }

  notifyPartnersRefresh();
  return { id, status: "accepted" };
}

/** Decline a received invite by id. */
export async function declineInvite(id) {
  const res = await fetch(apiUrl(`/api/friends/requests/${id}`), {
    method: "PATCH",
    headers: withBearer({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status: "declined" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to decline invite");
  }

  return { id, status: "declined" };
}

/** Cancel a sent invite by id. */
export async function cancelSentInvite(id) {
  const res = await fetch(apiUrl(`/api/friends/requests/${id}`), {
    method: "PATCH",
    headers: withBearer({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status: "cancelled" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to withdraw invite");
  }

  return { id, status: "cancelled" };
}
