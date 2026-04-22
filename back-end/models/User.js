const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const defaultNotifications = () => ({
  inviteReceived: true,
  matchConfirmed: true,
  sessionReminder: true,
});

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: null,
    },
    practiceFocus: {
      type: [String],
      default: [],
    },
    targetTier: {
      type: String,
      default: null,
    },
    timeline: {
      type: String,
      default: null,
    },
    level: {
      type: String,
      default: null,
    },
    weakestArea: {
      type: String,
      default: null,
    },
    background: {
      type: String,
      default: null,
    },
    school: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    linkedinUrl: {
      type: String,
      default: null,
    },
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    whoGoesFirst: {
      type: String,
      default: null,
    },
    feedbackStyle: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
    },
    showUpRate: {
      type: Number,
      default: 1,
    },
    activePartnerships: {
      type: Number,
      default: 0,
    },
    totalPartnerships: {
      type: Number,
      default: 0,
    },
    pendingReceivedInvites: {
      type: Number,
      default: 0,
    },
    inviteResponseRate: {
      type: Number,
      default: 1,
    },
    notifications: {
      type: mongoose.Schema.Types.Mixed,
      default: defaultNotifications,
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
    collection: 'users',
  }
);

userSchema.pre('save', function updateTimestamp() {
  this.updatedAt = new Date();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);