const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const { connectToDatabase } = require('../modules/db');
const User = require('../models/User');
const Proposal = require('../models/Proposal');

function makeToken(userId, email = `${userId}@test.com`) {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

describe('proposals routes', () => {
  before(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Proposal.deleteMany({})]);
    await User.create({
      _id: 'current-user',
      email: 'current@example.com',
      passwordHash: 'hash-current',
      displayName: 'Current User',
    });
  });

  after(async () => {
    await Promise.all([User.deleteMany({}), Proposal.deleteMany({})]);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/proposals returns 200 and proposals array', async () => {
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const Proposal = require('../models/Proposal');

const JWT_SECRET = process.env.JWT_SECRET || 'pairup_secret_key';

function makeToken(userId, email = `${userId}@test.com`) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

function validProposalPayload() {
  return {
    requestId: `friend-current-user-user-sde-int-match`,
    fromUserId: 'current-user',
    toUserId: 'user-sde-int-match',
    sessionType: 'Mock interview',
    level: 'Intermediate',
    meetingLink: 'https://meet.google.com/test',
    timeOptions: [
      {
        id: 'slot-1',
        label: 'Sun, Mar 24 · 11:00 AM – 12:00 PM',
        date: '2026-03-24',
        startTime: '11:00',
        endTime: '12:00',
        timezone: 'America/New_York',
      },
    ],
  };
}

describe('proposals routes', () => {
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Proposal.deleteMany({})]);

    await User.insertMany([
      {
        _id: 'current-user',
        email: 'current@example.com',
        passwordHash: 'hash-current',
        displayName: 'Current User',
      },
      {
        _id: 'user-sde-int-match',
        email: 'match@example.com',
        passwordHash: 'hash-match',
        displayName: 'Match User',
      },
    ]);
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), Proposal.deleteMany({})]);
  });

  it('GET /api/proposals returns 200 and proposals array', async () => {
    const res = await request(app)
      .get('/api/proposals')
      .query({ userId: 'current-user' })
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`);
    const res = await request(app)
      .get('/api/proposals')
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('proposals');
    expect(res.body.proposals).to.be.an('array');
  });

  it('POST /api/proposals with valid data returns 201', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send({
        requestId: 'req-1',
        fromUserId: 'u1',
        toUserId: 'u2',
        sessionType: 'Mock interview',
        level: 'Intermediate',
        meetingLink: 'https://meet.google.com/test',
        timeOptions: [
          {
            id: 'slot-1',
            label: 'Sun, Mar 24 · 11:00 AM – 12:00 PM',
            date: '2026-03-24',
            startTime: '11:00',
            endTime: '12:00',
            timezone: 'America/New_York',
          },
        ],
      });
      .query({ userId: 'current-user' })
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send(validProposalPayload());

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('proposal');
    expect(res.body.proposal).to.have.property('_id');
    expect(res.body.proposal.status).to.equal('pending');

    const created = await Proposal.findById(res.body.proposal._id).lean();
    expect(created).to.not.equal(null);
    expect(created.timeOptions[0]).to.include({
      id: 'slot-1',
      date: '2026-03-24',
      startTime: '11:00',
      endTime: '12:00',
      timezone: 'America/New_York',
    });
  });

  it('POST /api/proposals rejects incomplete time option fields', async () => {
    const payload = validProposalPayload();
    payload.timeOptions = [
      {
        id: 'slot-bad',
        label: 'Missing required date and time fields',
      },
    ];

    const res = await request(app)
      .post('/api/proposals')
      .query({ userId: 'current-user' })
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send(payload);

    expect(res.status).to.be.oneOf([400, 500]);
    expect(res.body.error || res.body.message).to.exist;
  });

  it('PATCH /api/proposals/:id updates selectedSlotId and status', async () => {
    const createRes = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send({
        requestId: 'req-1',
        fromUserId: 'u1',
        toUserId: 'u2',
        sessionType: 'Mock interview',
        level: 'Intermediate',
        meetingLink: 'https://meet.google.com/test',
        timeOptions: [
          {
            id: 'slot-1',
            label: 'Sun, Mar 24 · 11:00 AM – 12:00 PM',
            date: '2026-03-24',
            startTime: '11:00',
            endTime: '12:00',
            timezone: 'America/New_York',
          },
        ],
      });
      .query({ userId: 'current-user' })
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send(validProposalPayload());

    expect(createRes.status).to.equal(201);

    const proposalId = createRes.body.proposal._id;

    const patchRes = await request(app)
      .patch(`/api/proposals/${proposalId}`)
      .query({ userId: 'current-user' })
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send({
        status: 'accepted',
        selectedSlotId: 'slot-1',
      });

    expect(patchRes.status).to.equal(200);
    expect(patchRes.body.proposal.status).to.equal('accepted');
    expect(patchRes.body.proposal.selectedSlotId).to.equal('slot-1');
  });
});