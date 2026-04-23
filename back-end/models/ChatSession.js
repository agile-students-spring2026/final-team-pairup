const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const CHAT_SESSION_STATUSES = ['active', 'archived'];

const chatSessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    participantIds: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            typeof value[0] === 'string' &&
            typeof value[1] === 'string' &&
            value[0] !== value[1]
          );
        },
        message: 'participantIds must contain two distinct user ids.',
      },
    },
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: CHAT_SESSION_STATUSES,
      default: 'active',
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
    collection: 'chatSessions',
  }
);

chatSessionSchema.pre('save', function updateTimestamp() {
  this.updatedAt = new Date();
});

chatSessionSchema.pre('findOneAndUpdate', function updateTimestampOnUpdate() {
  this.set({ updatedAt: new Date() });
});

chatSessionSchema.index({ participantIds: 1 });

module.exports = {
  ChatSession:
    mongoose.models.ChatSession || mongoose.model('ChatSession', chatSessionSchema),
  CHAT_SESSION_STATUSES,
};
