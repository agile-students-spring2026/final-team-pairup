// test/matches.test.js
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');

describe('GET /api/matches', function () {
  it('returns 200 with currentUserId and matches array', async function () {
    const res = await request(app).get('/api/matches');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('currentUserId', 'current-user');
    expect(res.body).to.have.property('matches').that.is.an('array');
  });

  it('each match has matchPercent, sharedGoals, and inviteStatus', async function () {
    const res = await request(app).get('/api/matches');
    for (const match of res.body.matches) {
      expect(match).to.have.property('matchPercent').that.is.a('number');
      expect(match).to.have.property('sharedGoals').that.is.an('array');
      expect(match).to.have.property('inviteStatus');
    }
  });

  it('results are sorted by score descending', async function () {
    const res = await request(app).get('/api/matches');
    const percents = res.body.matches.map(m => m.matchPercent);
    if (percents.length >= 2) {
      expect(percents[0]).to.be.at.least(percents[percents.length - 1]);
    }
  });

  it('response excludes email and passwordHash', async function () {
    const res = await request(app).get('/api/matches');
    for (const match of res.body.matches) {
      expect(match).to.not.have.property('email');
      expect(match).to.not.have.property('passwordHash');
    }
  });

  it('current user is not in results', async function () {
    const res = await request(app).get('/api/matches');
    const ids = res.body.matches.map(m => m.userId);
    expect(ids).to.not.include('current-user');
  });

  it('returns 401 for invalid userId', async function () {
    const res = await request(app).get('/api/matches?userId=nonexistent');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });
});
