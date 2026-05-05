const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const Meeting = require('../models/Meeting');

function makeToken(userId, email = `${userId}@test.com`) {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

describe('meetings routes', () => {
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Meeting.deleteMany({})]);

    await User.create({
      _id: 'current-user',
      email: 'current@example.com',
      passwordHash: 'hash-current',
      displayName: 'Current User',
    });
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), Meeting.deleteMany({})]);
  });

  it('GET /api/meetings returns 200 and meetings array', async () => {
    const res = await request(app)
      .get('/api/meetings')
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('meetings');
    expect(res.body.meetings).to.be.an('array');
  });

  it('POST /api/meetings with valid data returns 201', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${makeToken('current-user', 'current@example.com')}`)
      .send({
        requestId: 'req-1',
        hostUserId: 'u1',
        guestUserId: 'u2',
        date: '2026-03-24',
        startTime: '11:00',
        endTime: '12:00',
        timezone: 'America/New_York',
        notes: 'Mock interview',
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('meeting');
    expect(res.body.meeting).to.have.property('_id');
    expect(res.body.meeting.status).to.equal('scheduled');
  });
});
