// routes/matches.js — GET /api/matches (MongoDB-backed)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { connectToDatabase } = require('../modules/db');
const { calculateMatchScore } = require('../modules/matchScoring');
const { calculateRankScore } = require('../modules/rankScoring');
const { generateReasons } = require('../modules/matchReasons');
const { FriendRequest } = require('../models/FriendRequest');



router.get('/matches', async (req, res) => {
  try {
    const currentUser = req.user;

    // If the current user hasn't completed onboarding yet (availability is null),
    // return empty matches instead of crashing countSharedCells.
    const hasFullAvailability =
      currentUser.availability &&
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].every(
        (day) =>
          Array.isArray(currentUser.availability[day]) &&
          currentUser.availability[day].length === 3
      );

    if (!hasFullAvailability || currentUser.role == null) {
      return res.json({ currentUserId: currentUser._id, matches: [] });
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


    // Pull every other user from Mongo (excluding the current user).
    const candidates = await User.find({
      _id: { $ne: currentUser._id },
    }).lean();

    const matches = [];

    for (const candidate of candidates) {
      // Skip candidates who haven't completed onboarding
      if (excludedUserIds.has(candidate._id)) continue;
      const candidateHasFullAvailability =
        candidate.availability &&
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].every(
          (day) =>
            Array.isArray(candidate.availability[day]) &&
            candidate.availability[day].length === 3
        );

      if (!candidateHasFullAvailability || candidate.role == null) continue;


      

      // Step a: Score
      const matchResult = calculateMatchScore(currentUser, candidate);
      if (!matchResult) continue;


      // Step c: Rank
      const rankScore = calculateRankScore(matchResult.matchPercent, candidate);


      // Step d: Reasons
      const sharedGoals = generateReasons(
        currentUser,
        candidate,
        matchResult.scoreBreakdown
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
        isNew: (candidate.sessionsCompleted ?? 0) < 3,
        matchPercent: matchResult.matchPercent,
        sharedGoals,
        sharedCells: matchResult.sharedCells,
        isCrossRole: matchResult.isCrossRole,
        inviteStatus: null,
        // Hidden — used for sorting only, stripped before response
        _rankScore: rankScore ?? matchResult.matchPercent,
        _createdAt: candidate.createdAt,
      });
    }

    // Sort: rankScore desc → matchPercent desc → sharedCells desc → createdAt desc
    matches.sort((a, b) => {
      if (b.matchPercent !== a.matchPercent) {
        return b.matchPercent - a.matchPercent;
      }
      if (b.sharedCells !== a.sharedCells) {
        return b.sharedCells - a.sharedCells;
      }
      return new Date(b._createdAt) - new Date(a._createdAt);
    });


    // Strip hidden sort fields before sending
    matches.forEach((m) => {
      delete m._rankScore;
      delete m._createdAt;
    });

    res.json({ currentUserId: currentUser._id, matches });
  } catch (err) {
    console.error('Error in GET /api/matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;