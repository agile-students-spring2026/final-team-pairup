const mongoose = require('mongoose');
const { connectToDatabase } = require('../modules/db');

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(10000);
    await connectToDatabase();
  },

  async afterAll() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  },
};