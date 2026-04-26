// modules/matchScoring.js
// Pure scoring function — no Express, no side effects

const { countSharedCells } = require('./availabilityHelper');

const LEVEL_MAP = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
const TIMELINE_ORDER = ['< 1 month', '1-3 months', '3-6 months', 'Just practicing'];

/**
 * Calculate match score between two users.
 * @param {Object} currentUser
 * @param {Object} candidate
 * @returns {{ matchPercent: Number, scoreBreakdown: Object, sharedCells: Number, isCrossRole: Boolean } | null}
 */
function calculateMatchScore(currentUser, candidate) {
  // Hard filter: self
  if (currentUser._id === candidate._id) return null;

  // Hard filter: zero availability overlap
  const sharedCells = countSharedCells(currentUser.availability, candidate.availability);
  if (sharedCells === 0) return null;

  const isCrossRole = currentUser.role !== candidate.role;

  // Factor 1: Availability (35 max)
  let availability;
  if (sharedCells === 0) availability = 0;
  else if (sharedCells === 1) availability = 10;
  else if (sharedCells === 2) availability = 20;
  else if (sharedCells <= 4) availability = 28;
  else availability = 35;


  // Factor 2: Practice focus overlap (20 max)
  const sharedFocusAreas = currentUser.practiceFocus.filter(f =>
    candidate.practiceFocus.includes(f)
  );
  // Cross-role max: 1 overlap (only "Behavioral" can overlap)
  const effectiveOverlaps = isCrossRole
    ? Math.min(sharedFocusAreas.length, 1)
    : sharedFocusAreas.length;

  let practiceFocus;
  if (effectiveOverlaps === 0) practiceFocus = 0;
  else if (effectiveOverlaps === 1) practiceFocus = 10;
  else if (effectiveOverlaps === 2) practiceFocus = 16;
  else practiceFocus = 20;

  // Factor 3: Level proximity (20 max same-role, 10 max cross-role)
  const levelDistance = Math.abs(
    LEVEL_MAP[currentUser.level] - LEVEL_MAP[candidate.level]
  );
  let level;
  if (isCrossRole) {
    if (levelDistance === 0) level = 10;
    else if (levelDistance === 1) level = 4;
    else level = 0;
  } else {
    if (levelDistance === 0) level = 20;
    else if (levelDistance === 1) level = 8;
    else level = 0;
  }

  // Factor 4: Timeline match (10 max)
  const userTimeIdx = TIMELINE_ORDER.indexOf(currentUser.timeline);
  const candTimeIdx = TIMELINE_ORDER.indexOf(candidate.timeline);
  const timeDistance = Math.abs(userTimeIdx - candTimeIdx);
  let timeline;
  if (timeDistance === 0) timeline = 10;
  else if (timeDistance === 1) timeline = 4;
  else timeline = 0;

  // Factor 5: Target tier (8 max)
  let targetTier;
  if (currentUser.targetTier === candidate.targetTier) {
    targetTier = (currentUser.targetTier === 'Any') ? 6 : 8;
  } else if (currentUser.targetTier === 'Any' || candidate.targetTier === 'Any') {
    targetTier = 4;
  } else {
    targetTier = 0;
  }

  // Factor 6: Feedback style (4 max)
  let feedbackStyle;
  if (currentUser.feedbackStyle === candidate.feedbackStyle) {
    feedbackStyle = 4;
  } else if (
    currentUser.feedbackStyle === 'Balanced' ||
    candidate.feedbackStyle === 'Balanced'
  ) {
    feedbackStyle = 2;
  } else {
    feedbackStyle = 0;
  }

  // Factor 7: Who goes first (3 max)
  let whoGoesFirst;
  const a = currentUser.whoGoesFirst;
  const b = candidate.whoGoesFirst;
  if (a === 'No preference' && b === 'No preference') {
    whoGoesFirst = 3;
  } else if (
    (a === 'Go first as interviewee' && b === 'Go first as interviewer') ||
    (a === 'Go first as interviewer' && b === 'Go first as interviewee')
  ) {
    whoGoesFirst = 3;
  } else if (a === 'No preference' || b === 'No preference') {
    whoGoesFirst = 2;
  } else {
    whoGoesFirst = 1;
  }

  const rawScore = availability + practiceFocus + level + timeline +
    targetTier + feedbackStyle + whoGoesFirst;
  const matchPercent = Math.max(0, Math.round(rawScore));

  return {
    matchPercent,
    scoreBreakdown: {
      availability,
      practiceFocus,
      level,
      timeline,
      targetTier,
      feedbackStyle,
      whoGoesFirst,
      sharedFocusAreas: isCrossRole
        ? sharedFocusAreas.slice(0, 1)
        : sharedFocusAreas,
      levelDistance
    },
    sharedCells,
    isCrossRole
  };
}

module.exports = { calculateMatchScore };
