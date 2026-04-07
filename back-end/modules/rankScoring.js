// modules/rankScoring.js
// Adjusts matchPercent into rankScore for feed ordering.
// Returns null for overloaded candidates.

/**
 * @param {Number} matchPercent
 * @param {Object} candidate - full user object
 * @returns {Number|null} - null means exclude from results
 */
function calculateRankScore(matchPercent, candidate) {
  // Overload filter
  if (candidate.activePartnerships >= 6) return null;
  if (candidate.pendingReceivedInvites >= 8) return null;

  // Quality bonus
  let qualityBonus = 0;
  if (candidate.sessionsCompleted >= 3) {
    if (candidate.showUpRate >= 0.9) qualityBonus = 8;
    else if (candidate.showUpRate >= 0.8) qualityBonus = 4;
  }

  // Capacity penalty
  let capacityPenalty = 0;
  if (candidate.activePartnerships >= 5) capacityPenalty = 35;
  else if (candidate.activePartnerships >= 3) capacityPenalty = 15;

  // Responsiveness penalty
  let responsePenalty = 0;
  if (candidate.inviteResponseRate < 0.5) responsePenalty = 25;
  else if (candidate.inviteResponseRate < 0.8) responsePenalty = 10;

  return matchPercent + qualityBonus - capacityPenalty - responsePenalty;
}

module.exports = { calculateRankScore };
