/**
 * mockApi.js — simulated async service layer for the Matches feature.
 *
 * Pages and components must NEVER import directly from src/data/.
 * All data access goes through this file so that swapping in a real API
 * later only requires changes here.
 */

import {
  receivedInvitesMock,
  sentInvitesMock,
  matchRecommendationsMock,
} from '../data/matchesMock.js';

function wait(ms = 220) {
  return new Promise((res) => setTimeout(res, ms));
}

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
  return { id, status: 'accepted' };
}

/** Decline a received invite by id. Resolves with { id, status: 'declined' }. */
export async function declineInvite(id) {
  await wait(300);
  return { id, status: 'declined' };
}

/** Cancel a sent invite by id. Resolves with { id, status: 'cancelled' }. */
export async function cancelSentInvite(id) {
  await wait(300);
  return { id, status: 'cancelled' };
}
