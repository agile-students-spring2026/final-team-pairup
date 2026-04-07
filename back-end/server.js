// server.js — Entry point. Separate from app.js for testability.
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PairUp backend running on port ${PORT}`);
});
