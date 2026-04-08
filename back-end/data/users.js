/**
 * data/users.js — single in-memory user store for the whole backend.
 *
 * Seeded from mockUsers.json at startup so that auth, settings, and
 * matching all read/write the same array.  Routes that previously
 * required mockUsers.json directly (routes/users.js, routes/matches.js)
 * now also require this file so every mutation is visible everywhere.
 */
const seedData = require('./mockUsers.json');

// Mutable array — push/splice here and every module sees the change.
const users = seedData.map((u) => ({ ...u }));

module.exports = users;