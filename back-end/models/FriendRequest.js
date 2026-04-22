const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const FRIEND_REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'];

const friendRequestSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },
    toUserId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: FRIEND_REQUEST_STATUSES,
      default: 'pending',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: 'friendRequests',
  }
);

friendRequestSchema.pre('save', function updateTimestamp() {
  this.updatedAt = new Date();
});

friendRequestSchema.index({ fromUserId: 1, toUserId: 1, status: 1 });

module.exports = {
  FriendRequest:
    mongoose.models.FriendRequest ||
    mongoose.model('FriendRequest', friendRequestSchema),
  FRIEND_REQUEST_STATUSES,
};