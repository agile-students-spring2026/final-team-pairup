const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MeetingSchema = new Schema(
  {
    requestId: { type: String, required: true },
    hostUserId: { type: String, required: true },
    guestUserId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: 'America/New_York' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

const Meeting = mongoose.model('Meeting', MeetingSchema)

module.exports = Meeting
