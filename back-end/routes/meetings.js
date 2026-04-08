const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const mockMeetings = require('../data/mockMeetings.json');

const router = express.Router();

const MEETING_STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled', 'rescheduled'];

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
  body('hostUserId').notEmpty().withMessage('hostUserId is required.'),
  body('guestUserId').notEmpty().withMessage('guestUserId is required.'),
  body('date').notEmpty().withMessage('date is required.'),
  body('startTime').notEmpty().withMessage('startTime is required.'),
  body('endTime').notEmpty().withMessage('endTime is required.'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('timezone must be a string.'),
  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string.'),
  validationErrors,
];

const patchValidators = [
  body('status')
    .optional()
    .isIn(MEETING_STATUS_OPTIONS)
    .withMessage(`status must be one of: ${MEETING_STATUS_OPTIONS.join(', ')}`),
  validationErrors,
];

router.get('/meetings', (req, res) => {
  return res.status(200).json({ meetings: mockMeetings });
});

router.get('/meetings/:id', (req, res) => {
  const meeting = mockMeetings.find((candidate) => candidate.id === req.params.id);

  if (!meeting) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  return res.status(200).json({ meeting });
});

router.post('/meetings', createValidators, (req, res) => {
  const newMeeting = {
    id: randomUUID(),
    requestId: req.body.requestId,
    hostUserId: req.body.hostUserId,
    guestUserId: req.body.guestUserId,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    timezone: req.body.timezone || 'America/New_York',
    status: 'scheduled',
    notes: req.body.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockMeetings.push(newMeeting);

  return res.status(201).json({ meeting: newMeeting });
});

router.patch('/meetings/:id', patchValidators, (req, res) => {
  const meetingIndex = mockMeetings.findIndex((candidate) => candidate.id === req.params.id);

  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const existingMeeting = mockMeetings[meetingIndex];
  const updatedMeeting = {
    ...existingMeeting,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  mockMeetings[meetingIndex] = updatedMeeting;

  return res.status(200).json({ meeting: updatedMeeting });
});

module.exports = router;