// routes/matches.js — GET /api/matches (ranked), GET /api/matches/random (shuffled sample)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { connectToDatabase } = require('../modules/db');
const { calculateMatchScore } = require('../modules/matchScoring');
const { calculateRankScore } = require('../modules/rankScoring');
const { generateReasons } = require('../modules/matchReasons');
const { FriendRequest } = require('../models/FriendRequest');

const RANDOM_DISCOVER_SAMPLE_SIZE = 12;

function shuffleArray(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i];
    out[i] = out[j];
    out[j] = t;
  }
  return out;
}

function stripMatchSortFields(matches) {
  matches.forEach((m) => {
    delete m._rankScore;
    delete m._createdAt;
  });
}

async function computeMatchesRows(currentUser) {
  const hasFullAvailability =
    currentUser.availability &&
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].every(
      (day) =>
        Array.isArray(currentUser.availability[day]) &&
        currentUser.availability[day].length === 3
    );

  if (!hasFullAvailability || currentUser.role == null) {
    return { currentUserId: currentUser._id, matches: [] };
  }

  await connectToDatabase();
  const existingRelationships = await FriendRequest.find({
    $or: [
      { fromUserId: currentUser._id },
      { toUserId: currentUser._id },
    ],
    status: { $in: ['pending', 'accepted'] },
  }).lean();

  const excludedUserIds = new Set(
    existingRelationships.map((request) =>
      request.fromUserId === currentUser._id
        ? request.toUserId
        : request.fromUserId
    )
  );

  const candidates = await User.find({
    _id: { $ne: currentUser._id },
  }).lean();

  const matches = [];

  for (const candidate of candidates) {
    if (excludedUserIds.has(candidate._id)) continue;
    const candidateHasFullAvailability =
      candidate.availability &&
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].every(
        (day) =>
          Array.isArray(candidate.availability[day]) &&
          candidate.availability[day].length === 3
      );

    if (!candidateHasFullAvailability || candidate.role == null) continue;

    const matchResult = calculateMatchScore(currentUser, candidate);
    if (!matchResult) continue;

    const rankScore = calculateRankScore(matchResult.matchPercent, candidate);

    const sharedGoals = generateReasons(
      currentUser,
      candidate,
      matchResult.scoreBreakdown
    );

    matches.push({
      userId: candidate._id,
      displayName: candidate.displayName,
      background: candidate.background,
      school: candidate.school,
      role: candidate.role,
      practiceFocus: candidate.practiceFocus,
      targetTier: candidate.targetTier,
      timeline: candidate.timeline,
      level: candidate.level,
      weakestArea: candidate.weakestArea,
      bio: candidate.bio,
      linkedinUrl: candidate.linkedinUrl,
      availability: candidate.availability,
      whoGoesFirst: candidate.whoGoesFirst,
      feedbackStyle: candidate.feedbackStyle,
      sessionsCompleted: candidate.sessionsCompleted,
      showUpRate: candidate.showUpRate,
      isNew: (candidate.sessionsCompleted ?? 0) < 3,
      matchPercent: matchResult.matchPercent,
      sharedGoals,
      sharedCells: matchResult.sharedCells,
      isCrossRole: matchResult.isCrossRole,
      inviteStatus: null,
      _rankScore: rankScore ?? matchResult.matchPercent,
      _createdAt: candidate.createdAt,
    });
  }

  return { currentUserId: currentUser._id, matches };
}

router.get('/matches/random', async (req, res) => {
  try {
    const { currentUserId, matches } = await computeMatchesRows(req.user);
    if (matches.length === 0) {
      return res.json({ currentUserId, matches: [] });
    }
    const shuffled = shuffleArray(matches);
    const sample = shuffled.slice(
      0,
      Math.min(RANDOM_DISCOVER_SAMPLE_SIZE, shuffled.length)
    );
    stripMatchSortFields(sample);
    res.json({ currentUserId, matches: sample });
  } catch (err) {
    console.error('Error in GET /api/matches/random:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const { currentUserId, matches } = await computeMatchesRows(req.user);

    matches.sort((a, b) => {
      if (b.matchPercent !== a.matchPercent) {
        return b.matchPercent - a.matchPercent;
      }
      if (b.sharedCells !== a.sharedCells) {
        return b.sharedCells - a.sharedCells;
      }
      return new Date(b._createdAt) - new Date(a._createdAt);
    });

    stripMatchSortFields(matches);

    res.json({ currentUserId, matches });
  } catch (err) {
    console.error('Error in GET /api/matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
