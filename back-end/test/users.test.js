const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');

const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');

function baseUser(overrides = {}) {
  return {
    _id: 'current-user',
    email: 'current@example.com',
    passwordHash: '$2b$10$placeholderhashedpassword',
    displayName: 'Saun Current',
    role: 'SDE',
    practiceFocus: ['Coding', 'Behavioral'],
    targetTier: 'Mid-size tech',
    timeline: '3-6 months',
    level: 'Intermediate',
    weakestArea: 'Behavioral',
    background: 'CS undergrad',
    school: 'NYU Tandon',
    bio: 'Ready to practice interviews every week.',
    linkedinUrl: 'https://linkedin.com/in/currentuser',
    availability: {
      mon: [true, false, false],
      tue: [false, true, false],
      wed: [false, false, true],
      thu: [false, false, false],
      fri: [false, false, false],
      sat: [false, false, false],
      sun: [false, false, false],
    },
    whoGoesFirst: 'No preference',
    feedbackStyle: 'Balanced',
    timezone: 'America/New_York',
    sessionsCompleted: 0,
    showUpRate: 1,
    activePartnerships: 0,
    totalPartnerships: 0,
    pendingReceivedInvites: 0,
    inviteResponseRate: 1,
    notifications: {
      inviteReceived: true,
      matchConfirmed: true,
      sessionReminder: true,
    },
    ...overrides,
  };
}

function validUserPayload() {
  return {
    displayName: 'Ryan Ma',
    role: 'SDE',
    practiceFocus: ['Coding', 'Behavioral'],
    targetTier: 'Mid-size tech',
    timeline: '3-6 months',
    level: 'Intermediate',
    weakestArea: 'Behavioral',
    background: 'CS undergrad',
    school: 'NYU Tandon',
    bio: 'Ready to practice interviews every week.',
    linkedinUrl: 'https://linkedin.com/in/ryanma',
    availability: {
      mon: [true, false, false],
      tue: [false, true, false],
      wed: [false, false, true],
      thu: [false, false, false],
      fri: [false, false, false],
      sat: [false, false, false],
      sun: [false, false, false],
    },
    whoGoesFirst: 'No preference',
    feedbackStyle: 'Balanced',
    timezone: 'America/New_York',
  };
}

describe('users routes', () => {
  before(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    await User.create(
      baseUser(),
    );

    await User.create(
      baseUser({
        _id: 'user-sde-int-match',
        email: 'alex@example.com',
        displayName: 'Alex Chen',
      }),
    );
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('POST /api/users with valid data returns 201 and strips passwordHash', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(validUserPayload())
      .expect(201);

    expect(response.body.user).to.include({
      displayName: 'Ryan Ma',
      role: 'SDE',
      targetTier: 'Mid-size tech',
      level: 'Intermediate',
    });
    expect(response.body.user).to.not.have.property('passwordHash');
    expect(response.body.user).to.have.property('_id');
    expect(response.body.user).to.have.property('createdAt');
    expect(response.body.user).to.have.property('updatedAt');
  });

  it('POST /api/users with missing required field returns 400', async () => {
    const payload = validUserPayload();
    delete payload.displayName;

    const response = await request(app)
      .post('/api/users')
      .send(payload)
      .expect(400);

    expect(response.body.error).to.equal('Validation failed');
    expect(response.body.details.join(' ')).to.include('displayName is required');
  });

  it('POST /api/users with invalid enum returns 400', async () => {
    const payload = validUserPayload();
    payload.role = 'Designer';

    const response = await request(app)
      .post('/api/users')
      .send(payload)
      .expect(400);

    expect(response.body.error).to.equal('Validation failed');
    expect(response.body.details.join(' ')).to.include('role must be one of');
  });

  it('GET /api/users/me returns current user without passwordHash', async () => {
    const response = await request(app)
      .get('/api/users/me?userId=current-user')
      .expect(200);

    expect(response.body.user._id).to.equal('current-user');
    expect(response.body.user).to.have.property('email');
    expect(response.body.user).to.not.have.property('passwordHash');
  });

  it('GET /api/users/:id returns public profile without private fields', async () => {
    const response = await request(app)
      .get('/api/users/user-sde-int-match')
      .expect(200);

    expect(response.body.user).to.include({
      _id: 'user-sde-int-match',
      displayName: 'Alex Chen',
    });
    expect(response.body.user).to.not.have.property('email');
    expect(response.body.user).to.not.have.property('passwordHash');
    expect(response.body.user).to.not.have.property('notifications');
    expect(response.body.user).to.not.have.property('activePartnerships');
    expect(response.body.user).to.not.have.property('pendingReceivedInvites');
  });

  it('GET /api/users/:id with non-existent ID returns 404', async () => {
    const response = await request(app)
      .get('/api/users/not-a-real-user')
      .expect(404);

    expect(response.body.error).to.equal('User not found');
  });

  it('PATCH /api/users/me with valid partial update returns 200 and refreshes updatedAt', async () => {
    const beforeUser = await User.findById('current-user');
    const before = beforeUser.updatedAt;

    const response = await request(app)
      .patch('/api/users/me?userId=current-user')
      .send({
        displayName: 'Saun Updated',
        targetTier: 'Any',
        bio: 'Updated bio for profile test.',
      })
      .expect(200);

    expect(response.body.user.displayName).to.equal('Saun Updated');
    expect(response.body.user.targetTier).to.equal('Any');
    expect(response.body.user.bio).to.equal('Updated bio for profile test.');
    expect(new Date(response.body.user.updatedAt).getTime()).to.be.greaterThan(new Date(before).getTime());
    expect(response.body.user).to.not.have.property('passwordHash');
  });
});