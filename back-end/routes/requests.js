const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { Request, REQUEST_STATUSES } = require('../models/Request');
const { connectToDatabase } = require('../modules/db');

const router = express.Router();

function validationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json({
    error: 'Validation failed',
    details: result.array().map((item) => item.msg),
  });
}

function asyncHandler(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

function serializeRequest(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : doc;
  return {
    id: plain._id,
    fromUserId: plain.fromUserId,
    toUserId: plain.toUserId,
    message: plain.message || '',
    status: plain.status,
    createdAt:
      plain.createdAt instanceof Date
        ? plain.createdAt.toISOString()
        : plain.createdAt,
    updatedAt:
      plain.updatedAt instanceof Date
        ? plain.updatedAt.toISOString()
        : plain.updatedAt,
  };
}

const createValidators = [
  body('fromUserId')
    .isString()
    .withMessage('fromUserId must be a string.')
    .trim()
    .notEmpty()
    .withMessage('fromUserId is required.'),
  body('toUserId')
    .isString()
    .withMessage('toUserId must be a string.')
    .trim()
    .notEmpty()
    .withMessage('toUserId is required.'),
  body('message')
    .optional()
    .isString()
    .withMessage('message must be a string.')
    .isLength({ max: 500 })
    .withMessage('message must be 500 characters or less.'),
  validationErrors,
];

const patchValidators = [
  param('id').isString().notEmpty(),
  body('status')
    .isIn(REQUEST_STATUSES)
    .withMessage(`status must be one of: ${REQUEST_STATUSES.join(', ')}`),
  validationErrors,
];

router.get(
  '/requests',
  asyncHandler(async (req, res) => {
    await connectToDatabase();
    const list = await Request.find().sort({ updatedAt: -1 }).lean();
    return res.status(200).json({
      requests: list.map(serializeRequest),
    });
  })
);

router.get(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    await connectToDatabase();
    const doc = await Request.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    return res.status(200).json({ request: serializeRequest(doc) });
  })
);

router.post(
  '/requests',
  createValidators,
  asyncHandler(async (req, res) => {
    await connectToDatabase();

    const fromUserId = String(req.body.fromUserId).trim();
    const toUserId = String(req.body.toUserId).trim();

    if (fromUserId === toUserId) {
      return res
        .status(400)
        .json({ error: 'Cannot send a request to yourself.' });
    }

    const created = await Request.create({
      fromUserId,
      toUserId,
      message: req.body.message || '',
      status: 'pending',
    });

    return res.status(201).json({ request: serializeRequest(created) });
  })
);

router.patch(
  '/requests/:id',
  patchValidators,
  asyncHandler(async (req, res) => {
    await connectToDatabase();

    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.body.status,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Request not found' });
    return res.status(200).json({ request: serializeRequest(updated) });
  })
);

module.exports = router;