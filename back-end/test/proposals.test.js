const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('proposals routes', () => {
  it('GET /api/proposals returns 200 and proposals array', async () => {
    const res = await request(app).get('/api/proposals');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('proposals');
    expect(res.body.proposals).to.be.an('array');
  });

  it('POST /api/proposals with valid data returns 201', async () => {
    const res = await request(app)
      .post('/api/proposals')
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
          },
        ],
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('proposal');
    expect(res.body.proposal).to.have.property('id');
    expect(res.body.proposal.status).to.equal('pending');
  });

  it('PATCH /api/proposals/:id updates selectedSlotId and status', async () => {
    const createRes = await request(app)
      .post('/api/proposals')
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
          },
        ],
      });

    const proposalId = createRes.body.proposal.id;

    const patchRes = await request(app)
      .patch(`/api/proposals/${proposalId}`)
      .send({
        status: 'accepted',
        selectedSlotId: 'slot-1',
      });

    expect(patchRes.status).to.equal(200);
    expect(patchRes.body.proposal.status).to.equal('accepted');
    expect(patchRes.body.proposal.selectedSlotId).to.equal('slot-1');
  });
});