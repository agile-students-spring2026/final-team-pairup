const express = require('express')
const { body, validationResult } = require('express-validator')
const Proposal = require('../models/Proposal')

const router = express.Router()

const SESSION_TYPE_OPTIONS = [
  'Mock interview',
  'Behavioral',
  'System design',
  'LeetCode pair',
]

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']
const PROPOSAL_STATUS_OPTIONS = ['pending', 'accepted', 'declined', 'cancelled']

function validationErrors(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    return next()
  }
  return res.status(400).json({
    error: 'Validation failed',
    details: result.array().map((item) => item.msg),
  })
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
]

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
]

// GET all proposals
router.get('/proposals', async (req, res) => {
  try {
    const proposals = await Proposal.find()
    return res.status(200).json({ proposals })
  } catch (err) {
    console.error(`Error fetching proposals: ${err}`)
    return res.status(500).json({ error: 'Failed to fetch proposals.' })
  }
})

// GET single proposal by id
router.get('/proposals/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' })
    }
    return res.status(200).json({ proposal })
  } catch (err) {
    console.error(`Error fetching proposal: ${err}`)
    return res.status(500).json({ error: 'Failed to fetch proposal.' })
  }
})

// POST create new proposal
router.post('/proposals', createValidators, async (req, res) => {
  try {
    const proposal = await new Proposal({
      requestId: req.body.requestId,
      fromUserId: req.body.fromUserId,
      toUserId: req.body.toUserId,
      sessionType: req.body.sessionType,
      level: req.body.level,
      meetingLink: req.body.meetingLink,
      timeOptions: req.body.timeOptions,
    }).save()

    return res.status(201).json({ proposal })
  } catch (err) {
    console.error(`Error creating proposal: ${err}`)
    return res.status(500).json({ error: 'Failed to create proposal.' })
  }
})

// PATCH update proposal status or selectedSlotId
router.patch('/proposals/:id', patchValidators, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' })
    }

    return res.status(200).json({ proposal })
  } catch (err) {
    console.error(`Error updating proposal: ${err}`)
    return res.status(500).json({ error: 'Failed to update proposal.' })
  }
})

module.exports = router
