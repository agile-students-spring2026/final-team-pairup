require("dotenv").config();

const app = require("./app");
const { connectToDatabase } = require("./modules/db");

const PORT = process.env.PORT || 3000;
let listener = null;

async function start() {
  await connectToDatabase();

  return new Promise((resolve) => {
    listener = app.listen(PORT, () => {
      console.log(`PairUp backend running on port ${PORT}`);
      resolve(listener);
    });
  });
}

async function close() {
  if (!listener) {
    return;
  }

  await new Promise((resolve, reject) => {
    listener.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  listener = null;
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

module.exports = { start, close };