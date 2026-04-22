/**
 * mockApi.js — simulated async service layer.
 *
 * Pages and components must NEVER import directly from src/data/.
 * All data access goes through this file so that swapping in a real API
 * later only requires changes here.
 */

import { mockDiscoverUsers } from "../data/mockDiscoverUsers";
import { mockUsers } from "../data/mockUsers";
import { PARTNERS_MOCK_NOW, partnersMock } from "../data/partnersMock";
import { getPartnerSpaceDemo as getPartnerSpaceDemoFromData } from "../data/partnerSpaceDemo";
import mockProfile from "../data/mockProfile.json";
import {
  receivedInvitesMock,
  sentInvitesMock,
  matchRecommendationsMock,
} from "../data/matchesMock.js";

// Re-export for consumers that need the demo clock anchor (tests, app shell).
export { PARTNERS_MOCK_NOW };

/** Dispatched after a friend invite is accepted so App can refetch GET /api/friends. */
export const PARTNERS_REFRESH_EVENT = "pairup:partners-refresh";

function getStoredUserId() {
  if (typeof window === "undefined") return "current-user";
  return localStorage.getItem("userId") || "current-user";
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
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
  const token = getStoredToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

function notifyPartnersRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PARTNERS_REFRESH_EVENT));
  }
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
    const res = await fetch(withAuthQuery(`/api/users/${userId}`), {
      headers: withBearer(),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/** GET /api/friends — returns UI partner rows; [] if the API is unreachable. */
export async function fetchPartnersFromFriendsApi() {
  try {
    const res = await fetch("/api/friends", {
      headers: withBearer(),
    });

    if (!res.ok) throw new Error("friends list failed");

    const data = await res.json();
    return (data.friends || []).map(apiFriendToPartnerRow);
  } catch {
    return [];
  }
}

/** Merge API-backed friends into existing partner state (keeps demo rows unless same id). */
export function mergePartnerRows(existing, fromApi) {
  const map = new Map();
  existing.forEach((p) => map.set(p.id, p));
  fromApi.forEach((p) => map.set(p.id, p));
  return Array.from(map.values());
}

/** Initial partner list for local state; demo rows until GET /api/friends merges in. */
export function getInitialPartners() {
  return [...partnersMock];
}

/** Partner-space demo flags/messages; replace with GET /partners/:id/space. */
export function getPartnerSpaceDemo(partnerId) {
  return getPartnerSpaceDemoFromData(partnerId);
}

/** Seed row for default profile form; replace with GET /profile/me. */
export function getDefaultProfileSeed() {
  return mockProfile[0] ?? null;
}

// ── Discover ──────────────────────────────────────────────────────────────────

export function fetchDiscoverUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDiscoverUsers);
    }, 250);
  });
}

// ── User profile (view another user) ─────────────────────────────────────────

function wait(ms = 220) {
  return new Promise((res) => setTimeout(res, ms));
}

/** Replace with GET /users/:id */
export async function fetchUserById(id) {
  await wait(180);
  const user = mockUsers.find((u) => u.id === Number(id));
  return user ? { ...user } : null;
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

/** Returns received invites: friend requests from the API when available, else demo match cards. */
export async function getReceivedInvites() {
  try {
    const res = await fetch("/api/friends/requests?box=incoming", {
      headers: withBearer(),
    });

    if (!res.ok) throw new Error("incoming friend requests failed");

    const data = await res.json();
    const requests = data.requests || [];

    const cards = await Promise.all(
      requests.map(async (r) => {
        const user = await fetchLegacyUser(r.fromUserId);
        return mapFriendRequestToInviteCard(r, user);
      })
    );

    return cards.filter(Boolean);
  } catch {
    await wait();
    return [...receivedInvitesMock];
  }
}

/** Returns invites the current user has sent that are still pending. */
export async function getSentInvites() {
  try {
    const res = await fetch("/api/friends/requests?box=outgoing", {
      headers: withBearer(),
    });

    if (!res.ok) throw new Error("outgoing friend requests failed");

    const data = await res.json();
    const requests = data.requests || [];

    const cards = await Promise.all(
      requests.map(async (r) => {
        const user = await fetchLegacyUser(r.toUserId);
        return mapFriendRequestToSentInviteCard(r, user);
      })
    );

    return cards.filter(Boolean);
  } catch {
    await wait();
    return [...sentInvitesMock];
  }
}

/** Returns recommended users to invite (shown inline on the Waiting tab). */
export async function getMatchRecommendations() {
  await wait();
  return [...matchRecommendationsMock];
}

/** Accept a received invite by id (friend request UUID or demo recv-* id). */
export async function acceptInvite(id) {
  if (String(id).startsWith("recv-")) {
    await wait(400);
    return { id, status: "accepted" };
  }

  const res = await fetch(`/api/friends/requests/${id}`, {
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
  if (String(id).startsWith("recv-")) {
    await wait(300);
    return { id, status: "declined" };
  }

  const res = await fetch(`/api/friends/requests/${id}`, {
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
  if (
    String(id).startsWith("sent-") ||
    String(id).startsWith("recv-")
  ) {
    await wait(300);
    return { id, status: "cancelled" };
  }

  const res = await fetch(`/api/friends/requests/${id}`, {
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
