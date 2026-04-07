// modules/matchReasons.js
// Generates 1-3 human-readable reason strings from scoreBreakdown

const { summarizeSharedAvailability } = require('./availabilityHelper');

/**
 * @param {Object} currentUser
 * @param {Object} candidate
 * @param {Object} scoreBreakdown - from calculateMatchScore
 * @returns {String[]} 1-3 reason strings, priority ordered
 */
function generateReasons(currentUser, candidate, scoreBreakdown) {
  const reasons = [];
  const isCrossRole = currentUser.role !== candidate.role;

  // Cross-role always gets special reason at position #1
  if (isCrossRole) {
    reasons.push('Cross-discipline prep \u2014 SDE x PM');
  }

  // Priority 1: Practice focus overlap
  if (scoreBreakdown.practiceFocus > 0) {
    const areas = scoreBreakdown.sharedFocusAreas;
    if (areas.length === 1) {
      reasons.push(`Both focusing on ${areas[0]}`);
    } else if (areas.length === 2) {
      reasons.push(`Both focusing on ${areas[0]} and ${areas[1]}`);
    } else if (areas.length === 3) {
      reasons.push(`Both focusing on ${areas[0]}, ${areas[1]}, and ${areas[2]}`);
    }
  }

  // Priority 2: Timeline match
  if (scoreBreakdown.timeline > 0) {
    if (currentUser.timeline === candidate.timeline) {
      reasons.push(`Both preparing in the ${currentUser.timeline} window`);
    } else {
      reasons.push('Similar prep timelines');
    }
  }

  // Priority 3: Level match
  if (scoreBreakdown.level > 0) {
    if (scoreBreakdown.levelDistance === 0) {
      if (isCrossRole) {
        reasons.push(`Both at ${currentUser.level} stage in prep`);
      } else {
        reasons.push(`Both at ${currentUser.level} level`);
      }
    } else if (scoreBreakdown.levelDistance === 1 && !isCrossRole) {
      reasons.push(
        `Close levels \u2014 ${currentUser.level} and ${candidate.level}`
      );
    }
  }

  // Priority 4: Target tier match
  if (scoreBreakdown.targetTier > 0) {
    if (currentUser.targetTier === candidate.targetTier && currentUser.targetTier !== 'Any') {
      if (isCrossRole) {
        reasons.push(`Both targeting ${currentUser.targetTier} companies`);
      } else {
        reasons.push(`Both targeting ${currentUser.role} at ${currentUser.targetTier}`);
      }
    } else if (currentUser.targetTier === 'Any' || candidate.targetTier === 'Any') {
      reasons.push('Flexible on company targets');
    }
  }

  // Priority 5: Availability overlap
  if (scoreBreakdown.availability > 0) {
    const summary = summarizeSharedAvailability(
      currentUser.availability,
      candidate.availability
    );
    if (summary) {
      reasons.push(`Both free ${summary}`);
    }
  }

  // Priority 6: Feedback + Who goes first
  if (scoreBreakdown.feedbackStyle > 0 &&
      currentUser.feedbackStyle === candidate.feedbackStyle) {
    reasons.push(`Both prefer ${currentUser.feedbackStyle} feedback`);
  }
  if (scoreBreakdown.whoGoesFirst === 3 &&
      currentUser.whoGoesFirst !== 'No preference') {
    reasons.push('Complementary interview preferences');
  }

  // Rules:
  // - If only availability scored, add fallback
  // - Never show availability as the ONLY reason
  const nonAvailReasons = reasons.filter(r => !r.startsWith('Both free'));
  if (nonAvailReasons.length === 0 && reasons.length > 0) {
    reasons.push("Get to know each other's prep style");
  }

  // Top 3 only
  return reasons.slice(0, 3);
}

module.exports = { generateReasons };
