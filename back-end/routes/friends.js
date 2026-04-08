const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockFriendRequests = require('../data/mockFriendRequests.json');
const mockUsers = require('../data/mockUsers.json');
const usersRouter = require('./users');

const toPublicUser = usersRouter.toPublicUser;

const router = express.Router();

function validationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  return res.status(400).json({
    error: 'Validation failed',
    details: result.array().map((item) => item.msg),
  });
}

function userExists(userId) {
  return mockUsers.some((u) => u._id === userId);
}

function findFriendRequestBetween(a, b) {
  return mockFriendRequests.filter(
    (r) =>
      (r.fromUserId === a && r.toUserId === b) || (r.fromUserId === b && r.toUserId === a),
  );
}

function areFriends(userId, otherUserId) {
  return mockFriendRequests.some(
    (r) =>
      r.status === 'accepted' &&
      ((r.fromUserId === userId && r.toUserId === otherUserId) ||
        (r.fromUserId === otherUserId && r.toUserId === userId)),
  );
}

function pendingOutgoing(fromUserId, toUserId) {
  return mockFriendRequests.find(
    (r) => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === 'pending',
  );
}

const inviteValidators = [
  body('toUserId').notEmpty().withMessage('toUserId is required.'),
  validationErrors,
];

const patchValidators = [
  body('status')
    .isIn(['accepted', 'declined', 'cancelled'])
    .withMessage('status must be one of: accepted, declined, cancelled.'),
  validationErrors,
];

/** List accepted friendships for the current user with public profiles. */
router.get('/friends', (req, res) => {
  const userId = req.user._id;
  const accepted = mockFriendRequests.filter(
    (r) =>
      r.status === 'accepted' &&
      (r.fromUserId === userId || r.toUserId === userId),
  );

  const friends = accepted.map((r) => {
    const friendId = r.fromUserId === userId ? r.toUserId : r.fromUserId;
    const user = mockUsers.find((u) => u._id === friendId);
    return {
      friendUserId: friendId,
      friendsSince: r.updatedAt,
      user: user ? toPublicUser(user) : { _id: friendId, displayName: 'Unknown user' },
    };
  });

  return res.status(200).json({ friends });
});

/**
 * Friend invites (social). box=incoming | outgoing | pending (both) | all (includes terminal states involving you).
 */
router.get('/friends/requests', (req, res) => {
  const userId = req.user._id;
  const { box = 'pending' } = req.query;

  let list = mockFriendRequests;
  if (box === 'incoming') {
    list = list.filter((r) => r.toUserId === userId && r.status === 'pending');
  } else if (box === 'outgoing') {
    list = list.filter((r) => r.fromUserId === userId && r.status === 'pending');
  } else if (box === 'pending') {
    list = list.filter(
      (r) =>
        r.status === 'pending' &&
        (r.fromUserId === userId || r.toUserId === userId),
    );
  } else if (box === 'all') {
    list = list.filter((r) => r.fromUserId === userId || r.toUserId === userId);
  } else {
    return res.status(400).json({
      error: 'box must be one of: incoming, outgoing, pending, all.',
    });
  }

  const requests = list.map((r) => ({
    ...r,
    direction: r.fromUserId === userId ? 'outgoing' : 'incoming',
  }));

  return res.status(200).json({ requests });
});

router.get('/friends/requests/:id', (req, res) => {
  const userId = req.user._id;
  const fr = mockFriendRequests.find((r) => r.id === req.params.id);
  if (!fr) {
    return res.status(404).json({ error: 'Friend request not found.' });
  }
  if (fr.fromUserId !== userId && fr.toUserId !== userId) {
    return res.status(403).json({ error: 'Not allowed to view this request.' });
  }
  return res.status(200).json({
    request: {
      ...fr,
      direction: fr.fromUserId === userId ? 'outgoing' : 'incoming',
    },
  });
});

router.post('/friends/requests', inviteValidators, (req, res) => {
  const fromUserId = req.user._id;
  const { toUserId } = req.body;

  if (toUserId === fromUserId) {
    return res.status(400).json({ error: 'Cannot send a friend invite to yourself.' });
  }
  if (!userExists(toUserId)) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (areFriends(fromUserId, toUserId)) {
    return res.status(409).json({ error: 'You are already friends with this user.' });
  }

  if (pendingOutgoing(fromUserId, toUserId)) {
    return res.status(409).json({ error: 'A pending invite to this user already exists.' });
  }

  const reverse = pendingOutgoing(toUserId, fromUserId);
  if (reverse) {
    return res.status(409).json({
      error: 'This user has already sent you a friend invite. Accept theirs instead.',
      code: 'REVERSE_PENDING',
      reverseRequestId: reverse.id,
    });
  }

  const now = new Date().toISOString();
  const request = {
    id: randomUUID(),
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  mockFriendRequests.push(request);

  return res.status(201).json({ request: { ...request, direction: 'outgoing' } });
});

router.patch('/friends/requests/:id', patchValidators, (req, res) => {
  const userId = req.user._id;
  const { status: nextStatus } = req.body;
  const idx = mockFriendRequests.findIndex((r) => r.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Friend request not found.' });
  }

  const fr = mockFriendRequests[idx];

  if (fr.status !== 'pending') {
    return res.status(409).json({ error: 'This invite is no longer pending.' });
  }

  if (nextStatus === 'accepted' || nextStatus === 'declined') {
    if (fr.toUserId !== userId) {
      return res.status(403).json({ error: 'Only the recipient can accept or decline.' });
    }
  }

  if (nextStatus === 'cancelled') {
    if (fr.fromUserId !== userId) {
      return res.status(403).json({ error: 'Only the sender can cancel an invite.' });
    }
  }

  const now = new Date().toISOString();
  const updated = {
    ...fr,
    status: nextStatus,
    updatedAt: now,
  };
  mockFriendRequests[idx] = updated;

  if (nextStatus === 'accepted') {
    const others = findFriendRequestBetween(fr.fromUserId, fr.toUserId).filter((r) => r.id !== fr.id && r.status === 'pending');
    for (const other of others) {
      const oi = mockFriendRequests.findIndex((x) => x.id === other.id);
      if (oi !== -1) {
        mockFriendRequests[oi] = {
          ...mockFriendRequests[oi],
          status: 'cancelled',
          updatedAt: now,
        };
      }
    }
  }

  const out = mockFriendRequests[idx];
  return res.status(200).json({
    request: {
      ...out,
      direction: out.fromUserId === userId ? 'outgoing' : 'incoming',
    },
  });
});

module.exports = router;
