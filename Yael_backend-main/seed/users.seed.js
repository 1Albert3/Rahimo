// seed/users.seed.js
require('dotenv').config();
const pool   = require('../db');    // <— on pointe vers db/index.js
const bcrypt = require('bcrypt');

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const rawPw = process.env.SEED_ADMIN_PWD;
  if (!email || !rawPw) {
    console.error('🚨 SEED_ADMIN_EMAIL et SEED_ADMIN_PWD doivent être définis.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(rawPw, 10);
  await pool.query(
    `INSERT INTO users(email, password)
     VALUES($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [email, hashed]
  );

  console.log(`✅ Admin seedé (${email}).`);
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
