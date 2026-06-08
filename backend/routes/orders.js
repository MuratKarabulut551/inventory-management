const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });
    const items = await pool.query(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [req.params.id]);
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { customer_id, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch real prices from DB — never trust client-side prices
    let total = 0;
    const resolvedItems = [];
    for (const item of items) {
      const product = await client.query('SELECT quantity, price FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Product ${item.product_id} not found.` });
      }
      if (product.rows[0].quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}.` });
      }
      const price = parseFloat(product.rows[0].price);
      total += price * item.quantity;
      resolvedItems.push({ ...item, price });
    }

    const order = await client.query(
      'INSERT INTO orders (customer_id, total) VALUES ($1, $2) RETURNING *',
      [customer_id, total]
    );

    for (const item of resolvedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.rows[0].id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Preparing', 'Shipped', 'Delivered'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message); res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
