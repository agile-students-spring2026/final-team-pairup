const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('meetings routes', () => {
  it('GET /api/meetings returns 200 and meetings array', async () => {
    const res = await request(app).get('/api/meetings');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('meetings');
    expect(res.body.meetings).to.be.an('array');
  });

  it('POST /api/meetings with valid data returns 201', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .send({
        requestId: 'req-1',
        hostUserId: 'u1',
        guestUserId: 'u2',
        date: '2026-03-24',
        startTime: '11:00',
        endTime: '12:00',
        timezone: 'PT',
        notes: 'Mock interview',
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('meeting');
    expect(res.body.meeting).to.have.property('id');
    expect(res.body.meeting.status).to.equal('scheduled');
  });
});