// middleware/authStub.js
// Temporary — Scott replaces with real JWT middleware
// Extracts current user from hardcoded ID or query param for testing
const mockUsers = require('../data/mockUsers.json');

function authStub(req, res, next) {
  const userId = req.query.userId || mockUsers[0]._id;
  const user = mockUsers.find(u => u._id === userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

module.exports = authStub;
