import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Package, Users, ShoppingCart, CheckCircle2, Loader } from 'lucide-react';

const C = {
  bg:         '#F0F4F8',
  card:       '#FFFFFF',
  border:     '#E2E8F0',
  accent:     '#38BDF8',
  accentSoft: 'rgba(56,189,248,0.1)',
  purple:     '#818CF8',
  purpleSoft: 'rgba(129,140,248,0.1)',
  pink:       '#F472B6',
  pinkSoft:   'rgba(244,114,182,0.1)',
  green:      '#34D399',
  greenSoft:  'rgba(52,211,153,0.1)',
  text:       '#0F172A',
  textSub:    '#475569',
  textMuted:  '#94A3B8',
};

function toCSV(headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

function download(filename, csv) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Exports() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState({ products: false, customers: false, orders: false });
  const [done,      setDone]      = useState({ products: false, customers: false, orders: false });

  useEffect(() => {
    Promise.all([
      api.get('/api/products'),
      api.get('/api/customers'),
      api.get('/api/orders'),
    ]).then(([p, c, o]) => {
      setProducts(p.data);
      setCustomers(c.data);
      setOrders(o.data);
    }).catch(() => {});
  }, []);

  const exportData = async (type) => {
    setLoading(l => ({ ...l, [type]: true }));
    setDone(d => ({ ...d, [type]: false }));
    await new Promise(r => setTimeout(r, 600));

    if (type === 'products') {
      const csv = toCSV(['id','name','description','quantity','low_stock_alert','price','created_at'], products);
      download(`dinven_products_${new Date().toISOString().split('T')[0]}.csv`, csv);
    }
    if (type === 'customers') {
      const csv = toCSV(['id','name','email','phone','address','created_at'], customers);
      download(`dinven_customers_${new Date().toISOString().split('T')[0]}.csv`, csv);
    }
    if (type === 'orders') {
      const csv = toCSV(['id','customer_name','status','total','created_at'], orders);
      download(`dinven_orders_${new Date().toISOString().split('T')[0]}.csv`, csv);
    }

    setLoading(l => ({ ...l, [type]: false }));
    setDone(d => ({ ...d, [type]: true }));
    setTimeout(() => setDone(d => ({ ...d, [type]: false })), 3000);
  };

  const exports = [
    {
      key:    'products',
      icon:   Package,
      label:  'Products',
      desc:   'Export all product inventory with prices, stock levels and descriptions',
      count:  products.length,
      color:  C.accent,
      soft:   C.accentSoft,
      fields: ['ID', 'Name', 'Description', 'Quantity', 'Low Stock Alert', 'Price', 'Created At'],
    },
    {
      key:    'customers',
      icon:   Users,
      label:  'Customers',
      desc:   'Export full customer list with contact information and addresses',
      count:  customers.length,
      color:  C.purple,
      soft:   C.purpleSoft,
      fields: ['ID', 'Name', 'Email', 'Phone', 'Address', 'Created At'],
    },
    {
      key:    'orders',
      icon:   ShoppingCart,
      label:  'Orders',
      desc:   'Export all orders with customer names, status and total amounts',
      count:  orders.length,
      color:  C.pink,
      soft:   C.pinkSoft,
      fields: ['ID', 'Customer', 'Status', 'Total', 'Created At'],
    },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>REPORTS</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Exports</h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Download your data as CSV files</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 mb-7 flex items-center gap-4"
        style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.2)` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(56,189,248,0.15)' }}>
          <FileText size={18} style={{ color: C.accent }} />
        </div>
        <div>
          <p className="text-base font-bold" style={{ color: C.text }}>CSV Format</p>
          <p className="text-sm font-medium" style={{ color: C.textSub }}>
            Files are UTF-8 encoded with BOM — ready for Excel, Google Sheets, and other tools.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {exports.map(({ key, icon: Icon, label, desc, count, color, soft, fields }, i) => (
          <motion.div key={key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>

            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: soft }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: soft, color }}>
                  {count} records
                </span>
              </div>
              <h3 className="text-xl font-black mb-1" style={{ color: C.text }}>{label}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: C.textSub }}>{desc}</p>
            </div>

            <div className="px-6 mt-5">
              <p className="text-xs font-black uppercase tracking-widest mb-2.5" style={{ color: C.textMuted }}>Included Columns</p>
              <div className="flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span key={f} className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: C.bg, color: C.textSub, border: `1px solid ${C.border}` }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 pt-5">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => exportData(key)}
                disabled={loading[key]}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black text-sm transition-all disabled:opacity-70"
                style={{
                  background: done[key] ? C.greenSoft : soft,
                  color: done[key] ? C.green : color,
                  border: `1px solid ${done[key] ? 'rgba(52,211,153,0.3)' : `${color}30`}`,
                }}>
                <AnimatePresence mode="wait">
                  {loading[key] ? (
                    <motion.div key="loading"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <Loader size={16} className="animate-spin" />
                    </motion.div>
                  ) : done[key] ? (
                    <motion.div key="done"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2">
                      <CheckCircle2 size={16} /> Downloaded!
                    </motion.div>
                  ) : (
                    <motion.div key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2">
                      <Download size={16} /> Export {label} CSV
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
