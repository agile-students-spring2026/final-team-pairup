const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');
const { ChatSession } = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { connectToDatabase } = require('../modules/db');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/pairup_test';

const seededUsers = [
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
    displayName: 'Matched User',
  },
  {
    _id: 'user-sde-beg-far',
    email: 'notpartner@example.com',
    passwordHash: 'hash-non-partner',
    displayName: 'Not Partnered User',
  },
];

const seededFriendRequests = [
  {
    _id: 'req-partner-current-match',
    fromUserId: 'current-user',
    toUserId: 'user-sde-int-match',
    status: 'accepted',
  },
];

const seededSessions = [
  {
    _id: 'chat-session-1',
    participantIds: ['current-user', 'user-sde-int-match'],
    pairKey: 'current-user\0user-sde-int-match',
    status: 'active',
    createdAt: new Date('2026-04-07T10:00:00.000Z'),
    updatedAt: new Date('2026-04-07T14:30:00.000Z'),
  },
];

const seededMessages = [
  {
    _id: 'msg-1',
    sessionId: 'chat-session-1',
    senderId: 'current-user',
    text: 'Hey — want to run a mock this week?',
    createdAt: new Date('2026-04-07T11:00:00.000Z'),
  },
  {
    _id: 'msg-2',
    sessionId: 'chat-session-1',
    senderId: 'user-sde-int-match',
    text: "Yes, I'm free Thursday evening.",
    createdAt: new Date('2026-04-07T14:30:00.000Z'),
  },
];

describe('chat routes', function chatRoutesSuite() {
  this.timeout(10000);

  before(async () => {
    process.env.MONGODB_URI = TEST_DB_URI;
    await connectToDatabase();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      FriendRequest.deleteMany({}),
      ChatSession.deleteMany({}),
      ChatMessage.deleteMany({}),
    ]);

    await User.insertMany(seededUsers);
    await FriendRequest.insertMany(seededFriendRequests);
    await ChatSession.insertMany(seededSessions);
    await ChatMessage.insertMany(seededMessages);
  });

  after(async () => {
    await Promise.all([
      User.deleteMany({}),
      FriendRequest.deleteMany({}),
      ChatSession.deleteMany({}),
      ChatMessage.deleteMany({}),
    ]);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/chat/partner-status/:otherUserId returns partnered for accepted pair', async () => {
    const res = await request(app)
      .get('/api/chat/partner-status/user-sde-int-match')
      .query({ userId: 'current-user' });

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('partnered');
    expect(res.body.otherUserId).to.equal('user-sde-int-match');
  });

  it('GET /api/chat/sessions as current-user returns seeded session', async () => {
    const res = await request(app).get('/api/chat/sessions').query({ userId: 'current-user' });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('sessions');
    expect(res.body.sessions).to.be.an('array');
    expect(res.body.sessions.some((s) => s.id === 'chat-session-1')).to.equal(true);
    expect(res.body.sessions.find((s) => s.id === 'chat-session-1')).to.have.property(
      'otherUserId',
      'user-sde-int-match',
    );
    expect(res.body).to.have.property('totalSessions');
  });

  it('GET /api/chat/sessions/:id/messages returns chronological window', async () => {
    const res = await request(app)
      .get('/api/chat/sessions/chat-session-1/messages')
      .query({ userId: 'current-user', limit: 10 });

    expect(res.status).to.equal(200);
    expect(res.body.messages).to.be.an('array');
    expect(res.body.messages.length).to.be.at.least(1);
    expect(res.body.messages[0]).to.have.keys('id', 'sessionId', 'senderId', 'text', 'createdAt');
  });

  it('POST /api/chat/sessions/:id/messages creates a message', async () => {
    const res = await request(app)
      .post('/api/chat/sessions/chat-session-1/messages')
      .query({ userId: 'current-user' })
      .send({ text: 'Ping from test' });

    expect(res.status).to.equal(201);
    expect(res.body.message.text).to.equal('Ping from test');
    expect(res.body.message.senderId).to.equal('current-user');
  });

  it('POST /api/chat/sessions returns existing session when pair already exists', async () => {
    const res = await request(app)
      .post('/api/chat/sessions')
      .query({ userId: 'current-user' })
      .send({ otherUserId: 'user-sde-int-match' });

    expect(res.status).to.equal(200);
    expect(res.body.created).to.equal(false);
    expect(res.body.session.id).to.equal('chat-session-1');
  });

  it('POST /api/chat/sessions returns 403 when not partnered', async () => {
    const res = await request(app)
      .post('/api/chat/sessions')
      .query({ userId: 'user-sde-beg-far' })
      .send({ otherUserId: 'current-user' });

    expect(res.status).to.equal(403);
  });

  it('GET /api/chat/sessions/:id/messages returns 403 for non-participant', async () => {
    const res = await request(app)
      .get('/api/chat/sessions/chat-session-1/messages')
      .query({ userId: 'user-sde-beg-far' });

    expect(res.status).to.equal(403);
  });

  it('GET /api/chat/history returns sessions with nested messages', async () => {
    const res = await request(app)
      .get('/api/chat/history')
      .query({ userId: 'current-user', sessionLimit: 5, messageLimit: 50 });

    expect(res.status).to.equal(200);
    expect(res.body.sessions).to.be.an('array');
    const first = res.body.sessions.find((s) => s.id === 'chat-session-1');
    expect(first).to.exist;
    expect(first.messages).to.be.an('array');
    expect(res.body).to.have.property('totalSessions');
  });

  it('PATCH /api/chat/sessions/:id updates status', async () => {
    const res = await request(app)
      .patch('/api/chat/sessions/chat-session-1')
      .query({ userId: 'current-user' })
      .send({ status: 'archived' });

    expect(res.status).to.equal(200);
    expect(res.body.session.status).to.equal('archived');
  });
});
