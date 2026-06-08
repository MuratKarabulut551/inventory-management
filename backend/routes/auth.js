const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register-customer', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'customer']
    );
    const user = userResult.rows[0];
    const customerResult = await client.query(
      'INSERT INTO customers (name, email, phone, address, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, phone || null, address || null, user.id]
    );
    await client.query('COMMIT');
    const token = jwt.sign(
      { id: user.id, role: 'customer', customer_id: customerResult.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({ user, token });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Customer register error:', err.message);
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use.' });
    res.status(500).json({ error: 'Registration failed.' });
  } finally {
    client.release();
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    let customer_id = null;
    if (user.role === 'customer') {
      const cust = await pool.query('SELECT id FROM customers WHERE user_id = $1', [user.id]);
      if (cust.rows.length > 0) customer_id = cust.rows[0].id;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, customer_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
