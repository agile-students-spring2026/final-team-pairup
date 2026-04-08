const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockChatSessions = require('../data/mockChatSessions.json');
const mockChatMessages = require('../data/mockChatMessages.json');
const mockRequests = require('../data/mockRequests.json');
const {
  canonicalParticipantIds,
  arePartnered,
  findSessionForPair,
  getRelationshipStatus,
} = require('../modules/chatPartnership');

const router = express.Router();

const SESSION_STATUS_OPTIONS = ['active', 'archived'];

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

router.get('/chat/partner-status/:otherUserId', (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;
  const status = getRelationshipStatus(userId, otherUserId, mockRequests);
  return res.status(200).json({ otherUserId, status });
});

router.get('/chat/sessions', (req, res) => {
  const userId = req.user._id;
  const { status: statusFilter, limit } = req.query;

  let list = mockChatSessions.filter((s) => userInSession(s, userId));
  if (statusFilter) {
    if (!SESSION_STATUS_OPTIONS.includes(statusFilter)) {
      return res.status(400).json({
        error: `status must be one of: ${SESSION_STATUS_OPTIONS.join(', ')}`,
      });
    }
    list = list.filter((s) => s.status === statusFilter);
  }
  list = [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const lim = limit != null ? parseInt(limit, 10) : null;
  if (lim != null && !Number.isNaN(lim) && lim > 0) {
    list = list.slice(0, lim);
  }

  const sessions = list.map((s) => ({
    ...s,
    otherUserId: getOtherParticipantId(s, userId),
  }));

  return res.status(200).json({
    sessions,
    totalSessions: mockChatSessions.filter((s) => userInSession(s, userId)).length,
  });
});

router.post('/chat/sessions', createSessionValidators, (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.body;

  if (otherUserId === userId) {
    return res.status(400).json({ error: 'Cannot open a chat session with yourself.' });
  }

  if (!arePartnered(userId, otherUserId, mockRequests)) {
    return res.status(403).json({ error: 'Chat is only available with partnered users.' });
  }

  const existing = findSessionForPair(mockChatSessions, userId, otherUserId);
  if (existing) {
    return res.status(200).json({
      session: { ...existing, otherUserId: getOtherParticipantId(existing, userId) },
      created: false,
    });
  }

  const now = new Date().toISOString();
  const session = {
    id: randomUUID(),
    participantIds: canonicalParticipantIds(userId, otherUserId),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  mockChatSessions.push(session);

  return res.status(201).json({
    session: { ...session, otherUserId: getOtherParticipantId(session, userId) },
    created: true,
  });
});

router.get('/chat/sessions/:sessionId/messages', (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  const { before, limit } = req.query;

  const session = mockChatSessions.find((s) => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  if (!userInSession(session, userId)) {
    return res.status(403).json({ error: 'Not a participant in this session.' });
  }

  let msgs = mockChatMessages.filter((m) => m.sessionId === sessionId);
  if (before) {
    msgs = msgs.filter((m) => m.createdAt < before);
  }
  msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const lim = limit != null ? parseInt(limit, 10) : 50;
  const cap = Number.isNaN(lim) || lim < 1 ? 50 : lim;
  msgs = msgs.slice(-cap);

  return res.status(200).json({ messages: msgs });
});

router.post('/chat/sessions/:sessionId/messages', postMessageValidators, (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;
  const { text } = req.body;

  const sessionIndex = mockChatSessions.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  const session = mockChatSessions[sessionIndex];
  if (!userInSession(session, userId)) {
    return res.status(403).json({ error: 'Not a participant in this session.' });
  }

  const otherId = getOtherParticipantId(session, userId);
  if (!arePartnered(userId, otherId, mockRequests)) {
    return res.status(403).json({ error: 'Chat is only available with partnered users.' });
  }

  const now = new Date().toISOString();
  const message = {
    id: randomUUID(),
    sessionId,
    senderId: userId,
    text,
    createdAt: now,
  };
  mockChatMessages.push(message);

  mockChatSessions[sessionIndex] = {
    ...session,
    updatedAt: now,
  };

  return res.status(201).json({ message });
});

router.patch('/chat/sessions/:sessionId', patchSessionValidators, (req, res) => {
  const userId = req.user._id;
  const { sessionId } = req.params;

  const sessionIndex = mockChatSessions.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  const session = mockChatSessions[sessionIndex];
  if (!userInSession(session, userId)) {
    return res.status(403).json({ error: 'Not a participant in this session.' });
  }

  if (req.body.status == null) {
    return res.status(400).json({ error: 'No updatable fields provided.' });
  }

  const updated = {
    ...session,
    status: req.body.status,
    updatedAt: new Date().toISOString(),
  };
  mockChatSessions[sessionIndex] = updated;

  return res.status(200).json({
    session: { ...updated, otherUserId: getOtherParticipantId(updated, userId) },
  });
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
  (req, res) => {
    const userId = req.user._id;
    const sessionLimit = req.query.sessionLimit != null ? parseInt(req.query.sessionLimit, 10) : 20;
    const messageLimit = req.query.messageLimit != null ? parseInt(req.query.messageLimit, 10) : 30;

    const userSessions = mockChatSessions.filter((s) => userInSession(s, userId));
    const sorted = [...userSessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const cappedSessions = sorted.slice(0, sessionLimit);

    const sessions = cappedSessions.map((session) => {
      let msgs = mockChatMessages.filter((m) => m.sessionId === session.id);
      msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      msgs = msgs.slice(-messageLimit);
      return {
        ...session,
        otherUserId: getOtherParticipantId(session, userId),
        messages: msgs,
      };
    });

    return res.status(200).json({
      sessions,
      totalSessions: userSessions.length,
    });
  },
);

module.exports = router;
