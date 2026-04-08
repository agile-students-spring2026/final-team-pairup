// routes/matches.js — GET /api/matches
const express = require('express');
const router = express.Router();
const mockUsers = require('../data/users');
const { calculateMatchScore } = require('../modules/matchScoring');
const { calculateRankScore } = require('../modules/rankScoring');
const { generateReasons } = require('../modules/matchReasons');

router.get('/matches', (req, res) => {
  try {
    const currentUser = req.user;

    // If the current user hasn't completed onboarding yet (availability is null),
    // return empty matches instead of crashing countSharedCells.
    if (!currentUser.availability || currentUser.role === null) {
      return res.json({ currentUserId: currentUser._id, matches: [] });
    }

    const matches = [];

    for (const candidate of mockUsers) {
      // Skip candidates who haven't completed onboarding
      if (!candidate.availability || candidate.role === null) continue;
      // Step a: Score
      const matchResult = calculateMatchScore(currentUser, candidate);
      if (!matchResult) continue;

      // Step b: Threshold
      if (matchResult.matchPercent < 55) continue;

      // Step c: Rank
      const rankScore = calculateRankScore(matchResult.matchPercent, candidate);
      if (rankScore === null) continue;

      // Step d: Reasons
      const sharedGoals = generateReasons(
        currentUser, candidate, matchResult.scoreBreakdown
      );

      // Step e: Build response (explicit allowlist)
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
        isNew: candidate.sessionsCompleted < 3,
        matchPercent: matchResult.matchPercent,
        sharedGoals,
        sharedCells: matchResult.sharedCells,
        isCrossRole: matchResult.isCrossRole,
        inviteStatus: null,
        // Hidden — used for sorting only, stripped before response
        _rankScore: rankScore,
        _createdAt: candidate.createdAt
      });
    }

    // Sort: rankScore desc → matchPercent desc → sharedCells desc → createdAt desc
    matches.sort((a, b) => {
      if (b._rankScore !== a._rankScore) return b._rankScore - a._rankScore;
      if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
      if (b.sharedCells !== a.sharedCells) return b.sharedCells - a.sharedCells;
      return new Date(b._createdAt) - new Date(a._createdAt);
    });

    // Strip hidden sort fields before sending
    matches.forEach(m => { delete m._rankScore; delete m._createdAt; });

    res.json({ currentUserId: currentUser._id, matches });
  } catch (err) {
    console.error('Error in GET /api/matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
