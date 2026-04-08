const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockRequests = require('../data/mockRequests.json');

const router = express.Router();

const REQUEST_STATUS_OPTIONS = ['pending', 'accepted', 'declined', 'cancelled'];

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
  body('fromUserId').notEmpty().withMessage('fromUserId is required.'),
  body('toUserId').notEmpty().withMessage('toUserId is required.'),
  body('message')
    .optional()
    .isString()
    .withMessage('message must be a string.'),
  validationErrors,
];

const patchValidators = [
  body('status')
    .optional()
    .isIn(REQUEST_STATUS_OPTIONS)
    .withMessage(`status must be one of: ${REQUEST_STATUS_OPTIONS.join(', ')}`),
  validationErrors,
];

router.get('/requests', (req, res) => {
  return res.status(200).json({ requests: mockRequests });
});

router.get('/requests/:id', (req, res) => {
  const request = mockRequests.find((candidate) => candidate.id === req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  return res.status(200).json({ request });
});

router.post('/requests', createValidators, (req, res) => {
  const newRequest = {
    id: randomUUID(),
    fromUserId: req.body.fromUserId,
    toUserId: req.body.toUserId,
    message: req.body.message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockRequests.push(newRequest);

  return res.status(201).json({ request: newRequest });
});

router.patch('/requests/:id', patchValidators, (req, res) => {
  const requestIndex = mockRequests.findIndex((candidate) => candidate.id === req.params.id);

  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const existingRequest = mockRequests[requestIndex];
  const updatedRequest = {
    ...existingRequest,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  mockRequests[requestIndex] = updatedRequest;

  return res.status(200).json({ request: updatedRequest });
});

module.exports = router;