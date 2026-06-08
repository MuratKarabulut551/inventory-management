const pool = require('./db');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');

    const products = [
      // Roof Systems
      {
        name: 'SLIRO - Automatic Sliding Roof System',
        description: 'Motorized fully automatic sliding roof system. Rain sensor and remote control included. Aluminum load-bearing profile, tempered glass infill.',
        quantity: 8, low_stock_alert: 3, price: 47500.00,
      },
      {
        name: 'VERA - Fixed Roof System',
        description: 'Fixed slope aluminum roof system. High UV resistance, double-glass insulation. Suitable for terraces and winter gardens.',
        quantity: 14, low_stock_alert: 4, price: 28900.00,
      },
      {
        name: 'CARPORT - Vehicle Parking System',
        description: 'Aluminum-framed vehicle carport system. Polycarbonate or glass infill options, ground anchor mounting included.',
        quantity: 11, low_stock_alert: 3, price: 22400.00,
      },

      // Movable Glass Systems
      {
        name: 'VERTIARC - Guillotine Glass System',
        description: 'Vertically moving guillotine glass system. Threshold-free passage, 10mm tempered safety glass, stainless steel mechanism.',
        quantity: 20, low_stock_alert: 5, price: 18750.00,
      },
      {
        name: 'SLIARC - Threshold-Free Sliding System',
        description: 'Ground-level threshold-free sliding glass system. Ideal for large openings, sliding pulley system, aluminum concealed track.',
        quantity: 25, low_stock_alert: 6, price: 15200.00,
      },
      {
        name: 'ISOSLIARC - Insulated Sliding System',
        description: 'Thermally insulated version of SLIARC. Thermal bridge-breaking profile, double-pane insulated glass, minimal heat loss in winter.',
        quantity: 18, low_stock_alert: 5, price: 19800.00,
      },
      {
        name: 'ISOBALCOARC - Insulated Folding Glass Balcony',
        description: 'Next-generation thermally insulated folding balcony system. 4+16+4 insulated glass, aluminum frame, wind and watertightness certified.',
        quantity: 16, low_stock_alert: 4, price: 24600.00,
      },
      {
        name: 'BALCOARC - Folding Glass Balcony System',
        description: 'Standard folding glass balcony system. 8mm single tempered glass, lightweight aluminum profile, easy installation and maintenance.',
        quantity: 22, low_stock_alert: 5, price: 17300.00,
      },

      // Spare Parts & Accessories
      {
        name: 'Aluminum Profile Set (6m)',
        description: 'Compatible with all AluArc systems. 6063-T5 extrusion aluminum profile per 6m. Can be cut per meter, anodized/painted option.',
        quantity: 120, low_stock_alert: 20, price: 850.00,
      },
      {
        name: 'Glass Panel - Single IGU (4+12+4)',
        description: 'Standard 4+12+4mm argon-filled insulated glass panel for sliding and folding systems. Custom size production.',
        quantity: 75, low_stock_alert: 15, price: 1250.00,
      },
      {
        name: 'Glass Panel - Double IGU (4+16+4+12+4)',
        description: 'Triple glass system for ISOSLIARC and ISOBALCOARC. Superior thermal and sound insulation, low-e coating.',
        quantity: 40, low_stock_alert: 10, price: 2100.00,
      },
      {
        name: 'Motor Drive Unit (SLIRO)',
        description: 'DC motor drive unit for SLIRO Automatic Sliding Roof. 24V, compatible with remote control and rain sensor.',
        quantity: 12, low_stock_alert: 3, price: 4800.00,
      },
      {
        name: 'Multi-Point Lock System',
        description: '3-point security lock for sliding and folding systems. Stainless steel, tested to steel door standards.',
        quantity: 55, low_stock_alert: 10, price: 680.00,
      },
      {
        name: 'EPDM Gasket & Seal Kit',
        description: 'EPDM rubber gasket set compatible with all AluArc systems. UV resistant, performs between -40C and +120C.',
        quantity: 200, low_stock_alert: 30, price: 145.00,
      },
    ];

    for (const p of products) {
      await client.query(
        'INSERT INTO products (name, description, quantity, low_stock_alert, price) VALUES ($1, $2, $3, $4, $5)',
        [p.name, p.description, p.quantity, p.low_stock_alert, p.price],
      );
    }
    console.log(`Products added: ${products.length}`);

    await client.query('DELETE FROM customers');
    await client.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');

    const customers = [
      { name: 'Arman Construction Ltd.',     email: 'info@armanconstruction.com', phone: '+90 312 441 22 10', address: 'Ankara, Cankaya, Mustafa Kemal St. No:55' },
      { name: 'Gunes Building Co.',          email: 'sales@gunesbuilding.com',    phone: '+90 216 555 77 30', address: 'Istanbul, Kadikoy, Moda Ave. No:12'       },
      { name: 'Kaya Architecture',           email: 'projects@kayaarch.com',      phone: '+90 232 364 88 45', address: 'Izmir, Konak, Alsancak St. No:8'          },
      { name: 'Delta Building Systems Inc.', email: 'technical@deltabuilding.com',phone: '+90 242 317 99 60', address: 'Antalya, Muratpasa, Meltem St. No:33'     },
      { name: 'Prizma Construction & Trade', email: 'accounting@prizma.com',      phone: '+90 224 271 55 18', address: 'Bursa, Nilufer, Ozluce St. No:21'         },
      { name: 'Boran Building Materials',    email: 'info@boranbuilding.com',     phone: '+90 322 459 33 72', address: 'Adana, Seyhan, Denizli St. No:47'         },
      { name: 'Elmas Aluminum Systems',      email: 'info@elmasaluminum.com',     phone: '+90 332 241 76 90', address: 'Konya, Selcuklu, Bosna St. No:14'         },
      { name: 'YapTek Engineering',          email: 'office@yaptek.com',          phone: '+90 362 431 67 25', address: 'Samsun, Atakum, Deniz St. No:3'           },
    ];

    for (const c of customers) {
      await client.query(
        'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4)',
        [c.name, c.email, c.phone, c.address],
      );
    }
    console.log(`Customers added: ${customers.length}`);

    await client.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE order_items_id_seq RESTART WITH 1');

    const orders = [
      { customerId: 1, status: 'Delivered', createdAt: '2025-11-14', items: [{ productId: 1, qty: 2 }, { productId: 9,  qty: 10 }] },
      { customerId: 2, status: 'Shipped',   createdAt: '2025-12-03', items: [{ productId: 7, qty: 3 }, { productId: 11, qty: 6  }] },
      { customerId: 3, status: 'Delivered', createdAt: '2025-12-20', items: [{ productId: 4, qty: 4 }, { productId: 13, qty: 4  }] },
      { customerId: 4, status: 'Preparing', createdAt: '2026-01-08', items: [{ productId: 2, qty: 1 }, { productId: 3,  qty: 2  }, { productId: 9,  qty: 8  }] },
      { customerId: 5, status: 'Shipped',   createdAt: '2026-01-22', items: [{ productId: 5, qty: 5 }, { productId: 10, qty: 10 }, { productId: 14, qty: 20 }] },
      { customerId: 6, status: 'Delivered', createdAt: '2026-02-05', items: [{ productId: 8, qty: 2 }, { productId: 13, qty: 4  }] },
      { customerId: 7, status: 'Preparing', createdAt: '2026-02-18', items: [{ productId: 6, qty: 3 }, { productId: 11, qty: 9  }, { productId: 12, qty: 3  }] },
      { customerId: 8, status: 'Shipped',   createdAt: '2026-03-10', items: [{ productId: 1, qty: 1 }, { productId: 12, qty: 1  }, { productId: 14, qty: 30 }] },
      { customerId: 1, status: 'Preparing', createdAt: '2026-04-02', items: [{ productId: 3, qty: 3 }, { productId: 9,  qty: 15 }, { productId: 13, qty: 6  }] },
      { customerId: 2, status: 'Delivered', createdAt: '2026-04-15', items: [{ productId: 4, qty: 2 }, { productId: 10, qty: 4  }] },
      { customerId: 3, status: 'Shipped',   createdAt: '2026-05-01', items: [{ productId: 7, qty: 2 }, { productId: 11, qty: 4  }, { productId: 14, qty: 10 }] },
      { customerId: 4, status: 'Delivered', createdAt: '2026-05-20', items: [{ productId: 5, qty: 4 }, { productId: 9,  qty: 6  }] },
    ];

    const { rows: priceRows } = await client.query('SELECT id, price FROM products');
    const priceMap = Object.fromEntries(priceRows.map(r => [r.id, parseFloat(r.price)]));

    for (const o of orders) {
      const total = o.items.reduce((sum, item) => sum + priceMap[item.productId] * item.qty, 0);
      const { rows: [order] } = await client.query(
        'INSERT INTO orders (customer_id, status, total, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
        [o.customerId, o.status, total.toFixed(2), o.createdAt],
      );
      for (const item of o.items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.productId, item.qty, priceMap[item.productId]],
        );
      }
    }
    console.log(`Orders added: ${orders.length}`);

    await client.query('COMMIT');
    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
};

seed();
