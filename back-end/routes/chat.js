const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { ChatSession, CHAT_SESSION_STATUSES } = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { FriendRequest } = require('../models/FriendRequest');
const {
  canonicalParticipantIds,
} = require('../modules/chatPartnership');

const router = express.Router();

const SESSION_STATUS_OPTIONS = CHAT_SESSION_STATUSES;

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

function userInSession(session, userId) {
  return session.participantIds.includes(userId);
}

function getOtherParticipantId(session, userId) {
  return session.participantIds.find((id) => id !== userId);
}

function sessionToResponse(sessionDoc, userId) {
  const session = sessionDoc.toObject ? sessionDoc.toObject() : sessionDoc;
  return {
    id: session._id,
    participantIds: session.participantIds,
    status: session.status,
    createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
    updatedAt: session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt,
    otherUserId: getOtherParticipantId(session, userId),
  };
}

function messageToResponse(messageDoc) {
  const message = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
  return {
    id: message._id,
    sessionId: message.sessionId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
  };
}

function pairKey(userIdA, userIdB) {
  return canonicalParticipantIds(userIdA, userIdB).join('\0');
}

async function getRelationshipStatus(currentUserId, otherUserId) {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
    return 'none';
  }

  const between = await FriendRequest.find({
    $or: [
      { fromUserId: currentUserId, toUserId: otherUserId },
      { fromUserId: otherUserId, toUserId: currentUserId },
    ],
  }).lean();

  if (between.some((request) => request.status === 'accepted')) {
    return 'partnered';
  }

  const pending = between.filter((request) => request.status === 'pending');
  if (pending.some((request) => request.fromUserId === currentUserId)) {
    return 'invited';
  }
  if (pending.some((request) => request.toUserId === currentUserId)) {
    return 'received';
  }
  return 'none';
}

async function arePartnered(userIdA, userIdB) {
  if (!userIdA || !userIdB || userIdA === userIdB) {
    return false;
  }

  const accepted = await FriendRequest.exists({
    status: 'accepted',
    $or: [
      { fromUserId: userIdA, toUserId: userIdB },
      { fromUserId: userIdB, toUserId: userIdA },
    ],
  });

  return !!accepted;
}

const createSessionValidators = [
  body('otherUserId').notEmpty().withMessage('otherUserId is required.'),
  validationErrors,
];

const postMessageValidators = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('text is required.')
    .isString()
    .withMessage('text must be a string.'),
  validationErrors,
];

const patchSessionValidators = [
  body('status')
    .optional()
    .isIn(SESSION_STATUS_OPTIONS)
    .withMessage(`status must be one of: ${SESSION_STATUS_OPTIONS.join(', ')}`),
  validationErrors,
];

router.get('/chat/partner-status/:otherUserId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const status = await getRelationshipStatus(userId, otherUserId);
    return res.status(200).json({ otherUserId, status });
  } catch (error) {
    console.error('GET /chat/partner-status failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chat/sessions', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status: statusFilter, limit } = req.query;

    if (statusFilter && !SESSION_STATUS_OPTIONS.includes(statusFilter)) {
      return res.status(400).json({
        error: `status must be one of: ${SESSION_STATUS_OPTIONS.join(', ')}`,
      });
    }

    const query = { participantIds: userId };
    if (statusFilter) {
      query.status = statusFilter;
    }

    const totalSessions = await ChatSession.countDocuments({ participantIds: userId });
    let dbQuery = ChatSession.find(query).sort({ updatedAt: -1 });
    const parsedLimit = limit != null ? parseInt(limit, 10) : null;
    if (parsedLimit != null && !Number.isNaN(parsedLimit) && parsedLimit > 0) {
      dbQuery = dbQuery.limit(parsedLimit);
    }

    const sessionDocs = await dbQuery;
    const sessions = sessionDocs.map((session) => sessionToResponse(session, userId));

    return res.status(200).json({ sessions, totalSessions });
  } catch (error) {
    console.error('GET /chat/sessions failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chat/sessions', createSessionValidators, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.body;

    if (otherUserId === userId) {
      return res.status(400).json({ error: 'Cannot open a chat session with yourself.' });
    }

    if (!(await arePartnered(userId, otherUserId))) {
      return res.status(403).json({ error: 'Chat is only available with partnered users.' });
    }

    const existing = await ChatSession.findOne({ pairKey: pairKey(userId, otherUserId) });
    if (existing) {
      return res.status(200).json({
        session: sessionToResponse(existing, userId),
        created: false,
      });
    }

    const session = await ChatSession.create({
      participantIds: canonicalParticipantIds(userId, otherUserId),
      pairKey: pairKey(userId, otherUserId),
      status: 'active',
    });

    return res.status(201).json({
      session: sessionToResponse(session, userId),
      created: true,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const userId = req.user._id;
      const existing = await ChatSession.findOne({ pairKey: pairKey(userId, req.body.otherUserId) });
      return res.status(200).json({
        session: sessionToResponse(existing, userId),
        created: false,
      });
    }
    console.error('POST /chat/sessions failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chat/sessions/:sessionId/messages', async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { before, limit } = req.query;

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (!userInSession(session, userId)) {
      return res.status(403).json({ error: 'Not a participant in this session.' });
    }

    const query = { sessionId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const parsedLimit = limit != null ? parseInt(limit, 10) : 50;
    const cap = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 50 : parsedLimit;

    const messages = await ChatMessage.find(query).sort({ createdAt: -1 }).limit(cap).lean();
    messages.reverse();

    return res.status(200).json({ messages: messages.map(messageToResponse) });
  } catch (error) {
    console.error('GET /chat/sessions/:id/messages failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chat/sessions/:sessionId/messages', postMessageValidators, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { text } = req.body;

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (!userInSession(session, userId)) {
      return res.status(403).json({ error: 'Not a participant in this session.' });
    }

    const otherId = getOtherParticipantId(session, userId);
    if (!(await arePartnered(userId, otherId))) {
      return res.status(403).json({ error: 'Chat is only available with partnered users.' });
    }

    const message = await ChatMessage.create({
      sessionId,
      senderId: userId,
      text,
    });

    await ChatSession.findByIdAndUpdate(sessionId, { updatedAt: new Date() });

    return res.status(201).json({ message: messageToResponse(message) });
  } catch (error) {
    console.error('POST /chat/sessions/:id/messages failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/chat/sessions/:sessionId', patchSessionValidators, async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    if (!userInSession(session, userId)) {
      return res.status(403).json({ error: 'Not a participant in this session.' });
    }

    if (req.body.status == null) {
      return res.status(400).json({ error: 'No updatable fields provided.' });
    }

    session.status = req.body.status;
    await session.save();

    return res.status(200).json({ session: sessionToResponse(session, userId) });
  } catch (error) {
    console.error('PATCH /chat/sessions/:id failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get(
  '/chat/history',
  [
    query('sessionLimit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('sessionLimit must be an integer between 1 and 100.'),
    query('messageLimit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('messageLimit must be an integer between 1 and 200.'),
    validationErrors,
  ],
  async (req, res) => {
    try {
      const userId = req.user._id;
      const sessionLimit = req.query.sessionLimit != null ? parseInt(req.query.sessionLimit, 10) : 20;
      const messageLimit = req.query.messageLimit != null ? parseInt(req.query.messageLimit, 10) : 30;

      const userSessions = await ChatSession.find({ participantIds: userId })
        .sort({ updatedAt: -1 })
        .limit(sessionLimit)
        .lean();
      const totalSessions = await ChatSession.countDocuments({ participantIds: userId });

      const sessionIds = userSessions.map((session) => session._id);
      const messages = await ChatMessage.find({ sessionId: { $in: sessionIds } })
        .sort({ sessionId: 1, createdAt: 1 })
        .lean();

      const messagesBySession = new Map();
      for (const message of messages) {
        const existing = messagesBySession.get(message.sessionId) || [];
        existing.push(message);
        messagesBySession.set(message.sessionId, existing);
      }

      const sessions = userSessions.map((session) => {
        const sessionMessages = messagesBySession.get(session._id) || [];
        return {
          ...sessionToResponse(session, userId),
          messages: sessionMessages.slice(-messageLimit).map(messageToResponse),
        };
      });

      return res.status(200).json({ sessions, totalSessions });
    } catch (error) {
      console.error('GET /chat/history failed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

module.exports = router;
