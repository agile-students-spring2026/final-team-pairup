/**
 * Partnership for chat: an accepted request in either direction between two users.
 */
function canonicalParticipantIds(userIdA, userIdB) {
  return [userIdA, userIdB].sort();
}

function arePartnered(userIdA, userIdB, requests) {
  if (!userIdA || !userIdB || userIdA === userIdB) {
    return false;
  }
  return requests.some(
    (r) =>
      r.status === 'accepted' &&
      ((r.fromUserId === userIdA && r.toUserId === userIdB) ||
        (r.fromUserId === userIdB && r.toUserId === userIdA)),
  );
}

function findSessionForPair(sessions, userIdA, userIdB) {
  const canonical = canonicalParticipantIds(userIdA, userIdB);
  const key = canonical.join('\0');
  return sessions.find((s) => canonicalParticipantIds(s.participantIds[0], s.participantIds[1]).join('\0') === key);
}

/**
 * UI-facing relationship with another user (from pair request state).
 * @returns {'partnered'|'invited'|'received'|'none'}
 */
function getRelationshipStatus(currentUserId, otherUserId, requests) {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
    return 'none';
  }
  const between = requests.filter(
    (r) =>
      (r.fromUserId === currentUserId && r.toUserId === otherUserId) ||
      (r.fromUserId === otherUserId && r.toUserId === currentUserId),
  );
  if (between.some((r) => r.status === 'accepted')) {
    return 'partnered';
  }
  const pending = between.filter((r) => r.status === 'pending');
  if (pending.some((r) => r.fromUserId === currentUserId)) {
    return 'invited';
  }
  if (pending.some((r) => r.toUserId === currentUserId)) {
    return 'received';
  }
  return 'none';
}

module.exports = {
  canonicalParticipantIds,
  arePartnered,
  findSessionForPair,
  getRelationshipStatus,
};
