require('dotenv').config();

const bcrypt = require('bcrypt');
const mockUsers = require('../data/mockUsers.json');
const mockFriendRequests = require('../data/mockFriendRequests.json');
const { connectToDatabase } = require('../modules/db');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');

async function run() {
  await connectToDatabase();

  const currentUser = mockUsers.find((user) => user._id === 'current-user');
  const currentUserHash = await bcrypt.hash('Password123!', 10);

  const userOps = mockUsers.map((user) => ({
    updateOne: {
      filter: { _id: user._id },
      update: {
        $set: {
          ...user,
          email: String(user.email || '').trim().toLowerCase(),
          passwordHash:
            user._id === 'current-user' ? currentUserHash : user.passwordHash,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (userOps.length > 0) {
    await User.bulkWrite(userOps);
  }

  const requestOps = mockFriendRequests.map((request) => ({
    updateOne: {
      filter: { _id: request.id },
      update: {
        $set: {
          _id: request.id,
          fromUserId: request.fromUserId,
          toUserId: request.toUserId,
          status: request.status,
          createdAt: request.createdAt ? new Date(request.createdAt) : new Date(),
          updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(),
        },
      },
      upsert: true,
    },
  }));

  if (requestOps.length > 0) {
    await FriendRequest.bulkWrite(requestOps);
  }

  console.log('Seed complete.');
  if (currentUser) {
    console.log(`Dev login email: ${currentUser.email}`);
    console.log('Dev login password: Password123!');
  }
  process.exit(0);
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});