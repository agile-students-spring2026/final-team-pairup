const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing. Add it to back-end/.env before starting the server.'
    );
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose.connect(uri);
  await connectionPromise;
  return mongoose.connection;
}

module.exports = { connectToDatabase };