// app.js — Minimal Express setup for matching endpoint
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authStub = require('./middleware/authStub');
const matchesRouter = require('./routes/matches');
const usersRouter = require('./routes/users');
const requestsRouter = require('./routes/requests');
const meetingsRouter = require('./routes/meetings');
const proposalsRouter = require('./routes/proposals');
const chatRouter = require('./routes/chat');
const friendsRouter = require('./routes/friends');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// Auth middleware on all /api routes
app.use('/api', authStub);

// Routes
app.use('/api', matchesRouter);

app.use('/api', usersRouter);

app.use('/api', requestsRouter);

app.use('/api', meetingsRouter);

app.use('/api', proposalsRouter);

app.use('/api', chatRouter);

app.use('/api', friendsRouter);
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
