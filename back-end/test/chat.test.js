const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('chat routes', () => {
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
