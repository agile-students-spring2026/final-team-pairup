const mongoose = require('mongoose');
const { connectToDatabase } = require('../modules/db');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

function requireSafeTestDatabase() {
  const appUri = process.env.MONGODB_URI;
  const testUri = process.env.TEST_MONGODB_URI;

  if (!testUri) {
    throw new Error('TEST_MONGODB_URI is required for test runs.');
  }

  if (appUri && testUri === appUri) {
    throw new Error('TEST_MONGODB_URI must not be the same as MONGODB_URI.');
  }

  if (!/test/i.test(testUri)) {
    throw new Error(
      'Refusing to run tests because TEST_MONGODB_URI does not appear to target a test database.'
    );
  }

  process.env.MONGODB_URI = testUri;
}

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(10000);
    requireSafeTestDatabase();
    await connectToDatabase();
  },

  async afterAll() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  },
};