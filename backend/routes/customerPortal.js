const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') return res.status(403).json({ error: 'Customer access only.' });
  next();
};

// Get own profile
router.get('/profile', authenticate, requireCustomer, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.*, u.email as user_email FROM customers c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get own orders
router.get('/orders', authenticate, requireCustomer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, c.name as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE c.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get single order detail
router.get('/orders/:id', authenticate, requireCustomer, async (req, res) => {
  try {
    const order = await pool.query(
      `SELECT o.* FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1 AND c.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const items = await pool.query(
      `SELECT oi.*, p.name as product_name, p.description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
