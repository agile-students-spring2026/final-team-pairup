const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');

const router = express.Router();

const PUBLIC_STRIP_FIELDS = new Set([
  'email',
  'passwordHash',
  'notifications',
  'activePartnerships',
  'totalPartnerships',
  'pendingReceivedInvites',
  'inviteResponseRate',
]);

function toIso(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toPublicUser(user) {
  const plain = { ...(user?.toObject ? user.toObject() : user) };

  for (const field of PUBLIC_STRIP_FIELDS) {
    delete plain[field];
  }

  plain.createdAt = toIso(plain.createdAt);
  plain.updatedAt = toIso(plain.updatedAt);
  return plain;
}

function serializeRequest(request, currentUserId) {
  return {
    id: request._id,
    fromUserId: request.fromUserId,
    toUserId: request.toUserId,
    status: request.status,
    createdAt: toIso(request.createdAt),
    updatedAt: toIso(request.updatedAt),
    direction: request.fromUserId === currentUserId ? 'outgoing' : 'incoming',
  };
}

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

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

const inviteValidators = [
  body('toUserId')
    .isString()
    .withMessage('toUserId must be a string.')
    .trim()
    .notEmpty()
    .withMessage('toUserId is required.'),
  validationErrors,
];

const patchValidators = [
  body('status')
    .isIn(['accepted', 'declined', 'cancelled'])
    .withMessage('status must be one of: accepted, declined, cancelled.'),
  validationErrors,
];

router.get(
  '/friends',
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const accepted = await FriendRequest.find({
      status: 'accepted',
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    const friendIds = [
      ...new Set(
        accepted.map((request) =>
          request.fromUserId === userId ? request.toUserId : request.fromUserId
        )
      ),
    ];

    const users = await User.find({ _id: { $in: friendIds } }).lean();
    const usersById = new Map(users.map((user) => [user._id, user]));

    const friends = accepted.map((request) => {
      const friendUserId =
        request.fromUserId === userId ? request.toUserId : request.fromUserId;
      const user = usersById.get(friendUserId);

      return {
        friendUserId,
        friendsSince: toIso(request.updatedAt),
        user: user
          ? toPublicUser(user)
          : { _id: friendUserId, displayName: 'Unknown user' },
      };
    });

    return res.status(200).json({ friends });
  })
);

router.get(
  '/friends/requests',
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { box = 'pending' } = req.query;

    let filter;
    if (box === 'incoming') {
      filter = { toUserId: userId, status: 'pending' };
    } else if (box === 'outgoing') {
      filter = { fromUserId: userId, status: 'pending' };
    } else if (box === 'pending') {
      filter = {
        status: 'pending',
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      };
    } else if (box === 'all') {
      filter = {
        $or: [{ fromUserId: userId }, { toUserId: userId }],
      };
    } else {
      return res.status(400).json({
        error: 'box must be one of: incoming, outgoing, pending, all.',
      });
    }

    const list = await FriendRequest.find(filter).sort({ updatedAt: -1 }).lean();
    const requests = list.map((request) => serializeRequest(request, userId));

    return res.status(200).json({ requests });
  })
);

router.get(
  '/friends/requests/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const request = await FriendRequest.findById(req.params.id).lean();

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    if (request.fromUserId !== userId && request.toUserId !== userId) {
      return res.status(403).json({ error: 'Not allowed to view this request.' });
    }

    return res.status(200).json({
      request: serializeRequest(request, userId),
    });
  })
);

router.post(
  '/friends/requests',
  inviteValidators,
  asyncHandler(async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const rawToUserId = req.body?.toUserId;
      const toUserId = String(rawToUserId || '').trim();

      console.log('POST /friends/requests');
      console.log('fromUserId:', fromUserId);
      console.log('rawToUserId:', rawToUserId);
      console.log('toUserId:', toUserId);

      if (!toUserId) {
        return res.status(400).json({ error: 'toUserId is required.' });
      }

      if (toUserId === fromUserId) {
        return res
          .status(400)
          .json({ error: 'Cannot send a friend invite to yourself.' });
      }

      const recipient = await User.findById(toUserId).lean();
      console.log('recipient exists:', !!recipient);

      if (!recipient) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const acceptedExisting = await FriendRequest.exists({
        status: 'accepted',
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      console.log('acceptedExisting:', !!acceptedExisting);

      if (acceptedExisting) {
        return res
          .status(409)
          .json({ error: 'You are already friends with this user.' });
      }

      const outgoingPending = await FriendRequest.findOne({
        fromUserId,
        toUserId,
        status: 'pending',
      }).lean();
      console.log('outgoingPending:', !!outgoingPending);

      if (outgoingPending) {
        return res.status(409).json({
          error: 'A pending invite to this user already exists.',
        });
      }

      const reversePending = await FriendRequest.findOne({
        fromUserId: toUserId,
        toUserId: fromUserId,
        status: 'pending',
      }).lean();
      console.log('reversePending:', !!reversePending);

      if (reversePending) {
        return res.status(409).json({
          error: 'This user has already sent you a friend invite. Accept theirs instead.',
          code: 'REVERSE_PENDING',
          reverseRequestId: reversePending._id,
        });
      }

      const request = await FriendRequest.create({
        fromUserId,
        toUserId,
        status: 'pending',
      });

      console.log('created request:', request);

      return res.status(201).json({
        request: serializeRequest(request, fromUserId),
      });
    } catch (error) {
      console.error('POST /friends/requests ERROR:', error);
      return res.status(500).json({
        error: error.message || 'Internal server error',
      });
    }
  })
);

router.patch(
  '/friends/requests/:id',
  patchValidators,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status: nextStatus } = req.body;

    console.log('PATCH /friends/requests/:id');
    console.log('userId:', userId);
    console.log('requestId:', req.params.id);
    console.log('nextStatus:', nextStatus);

    const existing = await FriendRequest.findById(req.params.id).lean();

    if (!existing) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    console.log('existing request:', existing);

    if (existing.status !== 'pending') {
      return res.status(409).json({ error: 'This invite is no longer pending.' });
    }

    if (nextStatus === 'accepted' || nextStatus === 'declined') {
      if (existing.toUserId !== userId) {
        return res
          .status(403)
          .json({ error: 'Only the recipient can accept or decline.' });
      }
    }

    if (nextStatus === 'cancelled') {
      if (existing.fromUserId !== userId) {
        return res
          .status(403)
          .json({ error: 'Only the sender can cancel an invite.' });
      }
    }

    const updated = await FriendRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: nextStatus,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    console.log('updated request:', updated);

    return res.status(200).json({
      request: serializeRequest(updated, userId),
    });
  })
);

module.exports = router;