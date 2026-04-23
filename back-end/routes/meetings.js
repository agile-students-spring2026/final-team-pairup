const express = require('express')
const { body, validationResult } = require('express-validator')
const Meeting = require('../models/Meeting')
 
const router = express.Router()
 
const MEETING_STATUS_OPTIONS = ['scheduled', 'completed', 'cancelled', 'rescheduled']
 
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
  body('hostUserId').notEmpty().withMessage('hostUserId is required.'),
  body('guestUserId').notEmpty().withMessage('guestUserId is required.'),
  body('date').notEmpty().withMessage('date is required.'),
  body('startTime').notEmpty().withMessage('startTime is required.'),
  body('endTime').notEmpty().withMessage('endTime is required.'),
  body('timezone').optional().isString().withMessage('timezone must be a string.'),
  body('notes').optional().isString().withMessage('notes must be a string.'),
  validationErrors,
]
 
const patchValidators = [
  body('status')
    .optional()
    .isIn(MEETING_STATUS_OPTIONS)
    .withMessage(`status must be one of: ${MEETING_STATUS_OPTIONS.join(', ')}`),
  validationErrors,
]
 
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find()
    return res.status(200).json({ meetings })
  } catch (err) {
    console.error(`Error fetching meetings: ${err}`)
    return res.status(500).json({ error: 'Failed to fetch meetings.' })
  }
})
 
router.get('/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    return res.status(200).json({ meeting })
  } catch (err) {
    console.error(`Error fetching meeting: ${err}`)
    return res.status(500).json({ error: 'Failed to fetch meeting.' })
  }
})
 
router.post('/meetings', createValidators, async (req, res) => {
  try {
    const meeting = await new Meeting({
      requestId: req.body.requestId,
      hostUserId: req.body.hostUserId,
      guestUserId: req.body.guestUserId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      timezone: req.body.timezone || 'America/New_York',
      notes: req.body.notes || '',
    }).save()
    return res.status(201).json({ meeting })
  } catch (err) {
    console.error(`Error creating meeting: ${err}`)
    return res.status(500).json({ error: 'Failed to create meeting.' })
  }
})
 
router.patch('/meetings/:id', patchValidators, async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    return res.status(200).json({ meeting })
  } catch (err) {
    console.error(`Error updating meeting: ${err}`)
    return res.status(500).json({ error: 'Failed to update meeting.' })
  }
})
 
module.exports = router