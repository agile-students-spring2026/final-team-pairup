/**
 * middleware/authMiddleware.js
 *
 * Verifies the JWT sent in the Authorization header and attaches the
 * matching user from the shared store to req.user.
 *
 * Usage (replace authStub in app.js when Scott's work is ready):
 *   app.use('/api', authMiddleware);
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectToDatabase } = require('../modules/db');

async function authMiddleware(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing.');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.slice(7);

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    await connectToDatabase();
    const user = await User.findById(payload.id || payload._id).lean();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authMiddleware;