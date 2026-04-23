require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

const authStub = require("./middleware/authStub");
const authMiddleware = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const matchesRouter = require("./routes/matches");
const usersRouter = require("./routes/users");
const requestsRouter = require("./routes/requests");
const meetingsRouter = require("./routes/meetings");
const proposalsRouter = require("./routes/proposals");
const chatRouter = require("./routes/chat");
const friendsRouter = require("./routes/friends");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("PairUp backend running");
});

app.use("/api/auth", authRoutes);

// keep existing unfinished routes on stub auth
app.use("/api", authStub);
app.use("/api/settings", settingsRoutes);
app.use("/api", matchesRouter);
app.use("/api", usersRouter);
app.use("/api", requestsRouter);
app.use("/api", meetingsRouter);
app.use("/api", proposalsRouter);
app.use("/api", chatRouter);

// sprint 3 route using real JWT + MongoDB
app.use("/api", authMiddleware, friendsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;