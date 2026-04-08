const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('friends routes', () => {
  it('GET /api/friends returns accepted friends for current-user', async () => {
    const res = await request(app).get('/api/friends').query({ userId: 'current-user' });

    expect(res.status).to.equal(200);
    expect(res.body.friends).to.be.an('array');
    const ids = res.body.friends.map((f) => f.friendUserId);
    expect(ids).to.include('user-pm-int-cross');
    expect(res.body.friends[0]).to.have.property('user');
    expect(res.body.friends[0].user).to.not.have.property('passwordHash');
  });

  it('GET /api/friends/requests?box=incoming returns pending invites to you', async () => {
    const res = await request(app)
      .get('/api/friends/requests')
      .query({ userId: 'current-user', box: 'incoming' });

    expect(res.status).to.equal(200);
    const incoming = res.body.requests.filter((r) => r.direction === 'incoming');
    expect(incoming.length).to.be.at.least(1);
    expect(incoming.every((r) => r.toUserId === 'current-user' && r.status === 'pending')).to.equal(true);
  });

  it('PATCH /api/friends/requests/:id accept marks accepted', async () => {
    const res = await request(app)
      .patch('/api/friends/requests/fr-incoming-demo')
      .query({ userId: 'current-user' })
      .send({ status: 'accepted' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('accepted');
  });

  it('POST /api/friends/requests creates outgoing invite', async () => {
    const res = await request(app)
      .post('/api/friends/requests')
      .query({ userId: 'current-user' })
      .send({ toUserId: 'user-sde-int-new' });

    expect(res.status).to.equal(201);
    expect(res.body.request.direction).to.equal('outgoing');
    expect(res.body.request.status).to.equal('pending');
  });

  it('POST /api/friends/requests returns 409 when reverse pending exists', async () => {
    const res = await request(app)
      .post('/api/friends/requests')
      .query({ userId: 'user-sde-int-new' })
      .send({ toUserId: 'current-user' });

    expect(res.status).to.equal(409);
    expect(res.body.code).to.equal('REVERSE_PENDING');
  });

  it('PATCH decline works for recipient', async () => {
    const create = await request(app)
      .post('/api/friends/requests')
      .query({ userId: 'user-sde-beg-mid' })
      .send({ toUserId: 'user-sde-int-flaky' });

    expect(create.status).to.equal(201);
    const id = create.body.request.id;

    const res = await request(app)
      .patch(`/api/friends/requests/${id}`)
      .query({ userId: 'user-sde-int-flaky' })
      .send({ status: 'declined' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('declined');
  });

  it('PATCH cancel works for sender', async () => {
    const create = await request(app)
      .post('/api/friends/requests')
      .query({ userId: 'user-sde-beg-any-noncs' })
      .send({ toUserId: 'user-sde-adv-any' });

    expect(create.status).to.equal(201);
    const id = create.body.request.id;

    const res = await request(app)
      .patch(`/api/friends/requests/${id}`)
      .query({ userId: 'user-sde-beg-any-noncs' })
      .send({ status: 'cancelled' });

    expect(res.status).to.equal(200);
    expect(res.body.request.status).to.equal('cancelled');
  });
});
