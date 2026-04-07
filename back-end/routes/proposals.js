const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockProposals = require('../data/mockProposals.json');

const router = express.Router();

const SESSION_TYPE_OPTIONS = [
  'Mock interview',
  'Behavioral',
  'System design',
  'LeetCode pair',
];

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const PROPOSAL_STATUS_OPTIONS = ['pending', 'accepted', 'declined', 'cancelled'];

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

const createValidators = [
  body('requestId').notEmpty().withMessage('requestId is required.'),
  body('fromUserId').notEmpty().withMessage('fromUserId is required.'),
  body('toUserId').notEmpty().withMessage('toUserId is required.'),
  body('sessionType')
    .isIn(SESSION_TYPE_OPTIONS)
    .withMessage(`sessionType must be one of: ${SESSION_TYPE_OPTIONS.join(', ')}`),
  body('level')
    .isIn(LEVEL_OPTIONS)
    .withMessage(`level must be one of: ${LEVEL_OPTIONS.join(', ')}`),
  body('meetingLink').isString().notEmpty().withMessage('meetingLink is required.'),
  body('timeOptions')
    .isArray({ min: 1 })
    .withMessage('timeOptions must be a non-empty array.'),
  validationErrors,
];

const patchValidators = [
  body('status')
    .optional()
    .isIn(PROPOSAL_STATUS_OPTIONS)
    .withMessage(`status must be one of: ${PROPOSAL_STATUS_OPTIONS.join(', ')}`),
  body('selectedSlotId')
    .optional()
    .isString()
    .withMessage('selectedSlotId must be a string.'),
  validationErrors,
];

router.get('/proposals', (req, res) => {
  return res.status(200).json({ proposals: mockProposals });
});

router.get('/proposals/:id', (req, res) => {
  const proposal = mockProposals.find((candidate) => candidate.id === req.params.id);

  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  return res.status(200).json({ proposal });
});

router.post('/proposals', createValidators, (req, res) => {
  const newProposal = {
    id: randomUUID(),
    requestId: req.body.requestId,
    fromUserId: req.body.fromUserId,
    toUserId: req.body.toUserId,
    sessionType: req.body.sessionType,
    level: req.body.level,
    meetingLink: req.body.meetingLink,
    timeOptions: req.body.timeOptions,
    status: 'pending',
    selectedSlotId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockProposals.push(newProposal);

  return res.status(201).json({ proposal: newProposal });
});

router.patch('/proposals/:id', patchValidators, (req, res) => {
  const proposalIndex = mockProposals.findIndex((candidate) => candidate.id === req.params.id);

  if (proposalIndex === -1) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const existingProposal = mockProposals[proposalIndex];
  const updatedProposal = {
    ...existingProposal,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  mockProposals[proposalIndex] = updatedProposal;

  return res.status(200).json({ proposal: updatedProposal });
});

module.exports = router;