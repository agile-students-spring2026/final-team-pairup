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

/** Initial partner list for local state; replace with GET /partners. */
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

/** Returns the list of match invites sent to the current user. */
export async function getReceivedInvites() {
  await wait();
  return [...receivedInvitesMock];
}

/** Returns invites the current user has sent that are still pending. */
export async function getSentInvites() {
  await wait();
  return [...sentInvitesMock];
}

/** Returns recommended users to invite (shown inline on the Waiting tab). */
export async function getMatchRecommendations() {
  await wait();
  return [...matchRecommendationsMock];
}

/** Accept a received invite by id. Resolves with { id, status: 'accepted' }. */
export async function acceptInvite(id) {
  await wait(400);
  return { id, status: "accepted" };
}

/** Decline a received invite by id. Resolves with { id, status: 'declined' }. */
export async function declineInvite(id) {
  await wait(300);
  return { id, status: "declined" };
}

/** Cancel a sent invite by id. Resolves with { id, status: 'cancelled' }. */
export async function cancelSentInvite(id) {
  await wait(300);
  return { id, status: "cancelled" };
}
