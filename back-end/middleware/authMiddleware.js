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
const users = require('../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'pairup_secret_key';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // payload.id is set by authController loginUser
  const user = users.find((u) => u._id === payload.id || u.id === payload.id);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

module.exports = authMiddleware;
