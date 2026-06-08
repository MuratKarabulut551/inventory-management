require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createUser() {
  const name = process.argv[2] || 'Admin';
  const email = process.argv[3] || 'admin@example.com';
  const password = process.argv[4] || 'changeme123';
  const role = process.argv[5] || 'admin';

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    [name, email, hash, role]
  );
  console.log(`User "${email}" created successfully!`);
  process.exit();
}

createUser().catch(err => {
  console.error(err.message);
  process.exit(1);
});
