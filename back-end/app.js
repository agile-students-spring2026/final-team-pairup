require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authStub = require("./middleware/authStub");
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const matchesRouter = require("./routes/matches");
const usersRouter = require("./routes/users");
const requestsRouter = require('./routes/requests');
const meetingsRouter = require('./routes/meetings');
const proposalsRouter = require('./routes/proposals');
const chatRouter = require('./routes/chat');
const friendsRouter = require('./routes/friends');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3001" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "PairUp backend running" });
});

// Stub auth for shared team API routes
app.use("/api", authStub);

// Your auth/settings routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);

// Teammates' routes
app.use("/api", matchesRouter);
app.use("/api", usersRouter);
app.use('/api', requestsRouter);
app.use('/api', meetingsRouter);
app.use('/api', proposalsRouter);
app.use('/api', chatRouter);
app.use('/api', friendsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;