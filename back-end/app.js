// app.js — Minimal Express setup for matching endpoint
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authStub = require('./middleware/authStub');
const matchesRouter = require('./routes/matches');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// Auth middleware on all /api routes
app.use('/api', authStub);

// Routes
app.use('/api', matchesRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
