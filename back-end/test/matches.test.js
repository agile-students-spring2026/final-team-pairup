// test/matches.test.js
const { expect } = require('chai');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const { connectToDatabase } = require('../modules/db');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');
const mockUsers = require('../data/mockUsers.json');
const mockFriendRequests = require('../data/mockFriendRequests.json');

function makeToken(userId, email = `${userId}@test.com`) {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

describe('GET /api/matches', function () {
  before(async () => {
    await connectToDatabase();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), FriendRequest.deleteMany({})]);
    await User.insertMany(mockUsers);
    await FriendRequest.insertMany(
      mockFriendRequests.map((request) => ({
        _id: request.id,
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }))
    );
  });

  after(async () => {
    await Promise.all([User.deleteMany({}), FriendRequest.deleteMany({})]);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('returns 200 with currentUserId and matches array', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('current-user', 'saun@nyu.edu')}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('currentUserId', 'current-user');
    expect(res.body).to.have.property('matches').that.is.an('array');
  });

  it('each match has matchPercent, sharedGoals, and inviteStatus', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('current-user', 'saun@nyu.edu')}`);
    for (const match of res.body.matches) {
      expect(match).to.have.property('matchPercent').that.is.a('number');
      expect(match).to.have.property('sharedGoals').that.is.an('array');
      expect(match).to.have.property('inviteStatus');
    }
  });

  it('results are sorted by score descending', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('current-user', 'saun@nyu.edu')}`);
    const percents = res.body.matches.map(m => m.matchPercent);
    if (percents.length >= 2) {
      expect(percents[0]).to.be.at.least(percents[percents.length - 1]);
    }
  });

  it('response excludes email and passwordHash', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('current-user', 'saun@nyu.edu')}`);
    for (const match of res.body.matches) {
      expect(match).to.not.have.property('email');
      expect(match).to.not.have.property('passwordHash');
    }
  });

  it('current user is not in results', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('current-user', 'saun@nyu.edu')}`);
    const ids = res.body.matches.map(m => m.userId);
    expect(ids).to.not.include('current-user');
  });

  it('returns 401 for invalid JWT user', async function () {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${makeToken('nonexistent', 'none@example.com')}`);
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('error', 'User not found');
  });
});
