const User = require("../models/User");
const { connectToDatabase } = require("../modules/db");

async function authStub(req, res, next) {
  try {
    await connectToDatabase();

    const userId = req.query.userId;
    let user;

    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = authStub;