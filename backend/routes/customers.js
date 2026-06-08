const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all customers
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Get single customer
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Create customer
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Update customer
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      'UPDATE customers SET name=$1, email=$2, phone=$3, address=$4 WHERE id=$5 RETURNING *',
      [name, email, phone, address, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Delete customer
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
