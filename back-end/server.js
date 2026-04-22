require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

let listener;

async function startServer() {
  try {
    await connectDB();

    listener = app.listen(PORT, () => {
      console.log(`PairUp backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = {
  close: () => listener && listener.close(),
};