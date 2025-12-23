const { Pool } = require('pg');
require('dotenv').config();

// Δημιουργία του Pool σύνδεσης
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Έλεγχος σύνδεσης κατά την εκκίνηση
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database Connection Error:', err.stack);
  } else {
    console.log(`✅ Connected to database: ${process.env.DB_NAME}`);
    release();
  }
});

module.exports = pool;