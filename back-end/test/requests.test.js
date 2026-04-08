const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('requests routes', () => {
  it('GET /api/requests returns 200 and requests array', async () => {
    const res = await request(app).get('/api/requests');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('requests');
    expect(res.body.requests).to.be.an('array');
  });

  it('POST /api/requests with valid data returns 201', async () => {
    const res = await request(app)
      .post('/api/requests')
      .send({
        fromUserId: 'u1',
        toUserId: 'u2',
        message: 'Want to practice this week?',
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('request');
    expect(res.body.request).to.have.property('id');
    expect(res.body.request.status).to.equal('pending');
  });

  it('PATCH /api/requests/:id updates request status', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .send({
        fromUserId: 'u1',
        toUserId: 'u2',
        message: 'Want to practice this week?',
      });

    const requestId = createRes.body.request.id;

    const patchRes = await request(app)
      .patch(`/api/requests/${requestId}`)
      .send({
        status: 'accepted',
      });

    expect(patchRes.status).to.equal(200);
    expect(patchRes.body.request.status).to.equal('accepted');
  });
});