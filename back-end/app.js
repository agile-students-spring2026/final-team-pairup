const express = require("express");
const cors = require("cors");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("PairUp backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);

module.exports = app;