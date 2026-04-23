const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'];

const requestSchema = new mongoose.Schema(
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
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
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
    collection: 'requests',
  }
);

requestSchema.pre('save', function updateTimestamp() {
  this.updatedAt = new Date();
});

requestSchema.index({ fromUserId: 1, toUserId: 1, status: 1 });

module.exports = {
  Request:
    mongoose.models.Request || mongoose.model('Request', requestSchema),
  REQUEST_STATUSES,
};