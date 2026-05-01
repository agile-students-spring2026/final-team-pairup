const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');

const mockUsers = require('../data/mockUsers.json');
const mockFriendRequests = require('../data/mockFriendRequests.json');

const JWT_SECRET = process.env.JWT_SECRET || 'pairup_secret_key';
const mongoose = require('mongoose');
const app = require('../app');
const { connectToDatabase } = require('../modules/db');
const User = require('../models/User');
const { FriendRequest } = require('../models/FriendRequest');
const mockUsers = require('../data/mockUsers.json');
const mockFriendRequests = require('../data/mockFriendRequests.json');

function makeToken(userId, email = `${userId}@test.com`) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

async function seedFriendData() {
  await Promise.all([
    User.deleteMany({}),
    FriendRequest.deleteMany({}),
  ]);

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
}

describe('friends routes', () => {
  beforeEach(async () => {
    await seedFriendData();
  });

  afterEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      FriendRequest.deleteMany({}),
    ]);
  });
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

  it('GET /api/friends returns accepted friends for current-user', async () => {
    const res = await request(app)
      .get('/api/friends')
      .set('Authorization', `Bearer ${makeToken('current-user')}`);

    expect(res.status).to.equal(200);
    expect(res.body.friends).to.be.an('array');

    const ids = res.body.friends.map((friend) => friend.friendUserId);
    expect(ids).to.include('user-pm-int-cross');

    expect(res.body.friends[0]).to.have.property('user');
    expect(res.body.friends[0].user).to.not.have.property('passwordHash');
  });

  it('GET /api/friends requires a valid token', async () => {
    const res = await request(app).get('/api/friends');

    expect(res.status).to.equal(401);
  });

  it('GET /api/friends/requests?box=incoming returns pending invites to current user', async () => {
    const res = await request(app)
      .get('/api/friends/requests')
      .query({ box: 'incoming' })
      .set('Authorization', `Bearer ${makeToken('current-user')}`);

    expect(res.status).to.equal(200);
    expect(res.body.requests).to.be.an('array');

    const incoming = res.body.requests.filter(
      (requestItem) => requestItem.direction === 'incoming'
    );

    expect(incoming.length).to.be.at.least(1);
    expect(
      incoming.every(
        (requestItem) =>
          requestItem.toUserId === 'current-user' &&
          requestItem.status === 'pending'
      )
    ).to.equal(true);
  });

  it('GET /api/friends/requests?box=outgoing returns invites sent by current user', async () => {
    const res = await request(app)
      .get('/api/friends/requests')
      .query({ box: 'outgoing' })
      .set('Authorization', `Bearer ${makeToken('current-user')}`);

    expect(res.status).to.equal(200);
    expect(res.body.requests).to.be.an('array');

    const outgoing = res.body.requests.filter(
      (requestItem) => requestItem.direction === 'outgoing'
    );

    expect(
      outgoing.every(
        (requestItem) => requestItem.fromUserId === 'current-user'
      )
    ).to.equal(true);
  });

  it('PATCH /api/friends/requests/:id accept marks request as accepted', async () => {
    const res = await request(app)
      .patch('/api/friends/requests/fr-incoming-demo')
      .set('Authorization', `Bearer ${makeToken('current-user')}`)
      .send({ status: 'accepted' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('accepted');

    const updated = await FriendRequest.findById('fr-incoming-demo').lean();
    expect(updated.status).to.equal('accepted');
  });

  it('POST /api/friends/requests creates outgoing invite', async () => {
    const res = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('current-user')}`)
      .send({ toUserId: 'user-sde-int-new' });

    expect(res.status).to.equal(201);
    expect(res.body.request.direction).to.equal('outgoing');
    expect(res.body.request.status).to.equal('pending');

    const created = await FriendRequest.findById(res.body.request.id).lean();
    expect(created).to.include({
      fromUserId: 'current-user',
      toUserId: 'user-sde-int-new',
      status: 'pending',
    });
  });

  it('POST /api/friends/requests returns 409 when reverse pending exists', async () => {
    await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('current-user')}`)
      .send({ toUserId: 'user-sde-int-new' })
      .expect(201);

    const res = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('user-sde-int-new')}`)
      .send({ toUserId: 'current-user' });

    expect(res.status).to.equal(409);
    expect(res.body.code).to.equal('REVERSE_PENDING');
  });

  it('POST /api/friends/requests returns 400 when inviting yourself', async () => {
    const res = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('current-user')}`)
      .send({ toUserId: 'current-user' });

    expect(res.status).to.be.oneOf([400, 409]);
  });

  it('PATCH decline works for recipient', async () => {
    const create = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('user-sde-beg-mid')}`)
      .send({ toUserId: 'user-sde-int-flaky' });

    expect(create.status).to.equal(201);

    const res = await request(app)
      .patch(`/api/friends/requests/${create.body.request.id}`)
      .set('Authorization', `Bearer ${makeToken('user-sde-int-flaky')}`)
      .send({ status: 'declined' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('declined');

    const updated = await FriendRequest.findById(create.body.request.id).lean();
    expect(updated.status).to.equal('declined');
  });

  it('PATCH cancel works for sender', async () => {
    const create = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${makeToken('user-sde-beg-any-noncs')}`)
      .send({ toUserId: 'user-sde-adv-any' });

    expect(create.status).to.equal(201);

    const res = await request(app)
      .patch(`/api/friends/requests/${create.body.request.id}`)
      .set('Authorization', `Bearer ${makeToken('user-sde-beg-any-noncs')}`)
      .send({ status: 'cancelled' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('cancelled');

    const updated = await FriendRequest.findById(create.body.request.id).lean();
    expect(updated.status).to.equal('cancelled');
  });
});