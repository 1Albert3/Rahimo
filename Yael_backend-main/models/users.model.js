// models/users.model.js
const pool = require('../db');   // <— on pointe vers db/index.js

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password
     FROM users
     WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

module.exports = { findByEmail };
