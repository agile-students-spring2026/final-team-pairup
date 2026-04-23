const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const chatMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
    collection: 'chatMessages',
  }
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports =
  mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
