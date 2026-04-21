const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TimeOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, required: true },
  },
  { _id: false }
)

const ProposalSchema = new Schema(
  {
    requestId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    sessionType: {
      type: String,
      enum: ['Mock interview', 'Behavioral', 'System design', 'LeetCode pair'],
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    meetingLink: { type: String, required: true },
    timeOptions: { type: [TimeOptionSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
    selectedSlotId: { type: String, default: null },
  },
  { timestamps: true }
)

const Proposal = mongoose.model('Proposal', ProposalSchema)

module.exports = Proposal
