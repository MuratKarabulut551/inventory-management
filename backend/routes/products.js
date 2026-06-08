const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all products
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Get single product
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Create product
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, quantity, low_stock_alert, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, quantity, low_stock_alert, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, quantity, low_stock_alert, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Update product
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, description, quantity, low_stock_alert, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, description=$2, quantity=$3, low_stock_alert=$4, price=$5 WHERE id=$6 RETURNING *',
      [name, description, quantity, low_stock_alert, price, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

// Delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
