import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Clock, Truck, CheckCircle2, TrendingUp,
  Plus, X, Trash2, Package, Search, DollarSign,
} from 'lucide-react';

const C = {
  bg:          '#F0F4F8',
  card:        '#FFFFFF',
  cardHover:   '#F8FAFC',
  border:      '#E2E8F0',
  borderLight: '#CBD5E1',
  accent:      '#38BDF8',
  accentSoft:  'rgba(56,189,248,0.1)',
  accentGlow:  'rgba(56,189,248,0.25)',
  purple:      '#818CF8',
  purpleSoft:  'rgba(129,140,248,0.1)',
  pink:        '#F472B6',
  amber:       '#FBBF24',
  green:       '#34D399',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
};

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring', stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, scale: 0.94, y: 24, transition: { duration: 0.2 } },
};

const STATUS = {
  Preparing: { bg: 'rgba(251,191,36,0.12)',  text: '#FBBF24', border: 'rgba(251,191,36,0.25)',  icon: Clock        },
  Shipped:   { bg: 'rgba(56,189,248,0.12)',  text: '#38BDF8', border: 'rgba(56,189,248,0.25)',  icon: Truck        },
  Delivered: { bg: 'rgba(52,211,153,0.12)',  text: '#34D399', border: 'rgba(52,211,153,0.25)',  icon: CheckCircle2 },
};

export default function Orders() {
  const [orders,     setOrders]     = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [products,   setProducts]   = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items,      setItems]      = useState([{ product_id: '', quantity: 1, price: 0, name: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');

  const fetchOrders = async () => {
    const res = await api.get('/api/orders');
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
    api.get('/api/customers').then(r => setCustomers(r.data));
    api.get('/api/products').then(r  => setProducts(r.data));
  }, []);

  const handleStatusChange = async (id, status) => {
    await api.put(`/api/orders/${id}`, { status });
    fetchOrders();
  };

  const handleProductSelect = (idx, productId) => {
    const p = products.find(p => String(p.id) === String(productId));
    const next = [...items];
    next[idx] = { ...next[idx], product_id: productId, price: p ? parseFloat(p.price) : 0, name: p?.name || '' };
    setItems(next);
  };

  const handleQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx] = { ...next[idx], quantity: parseInt(qty) || 1 };
    setItems(next);
  };

  const addItem    = () => setItems([...items, { product_id: '', quantity: 1, price: 0, name: '' }]);
  const removeItem = i  => setItems(items.filter((_, j) => j !== i));
  const total      = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerId) return setError('Please select a customer.');
    if (items.some(i => !i.product_id)) return setError('Please select a product for each item.');
    setSubmitting(true);
    try {
      await api.post('/api/orders', { customer_id: customerId, items });
      setShowModal(false);
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1, price: 0, name: '' }]);
      fetchOrders();
      api.get('/api/products').then(r => setProducts(r.data));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order.');
    }
    setSubmitting(false);
  };

  const openModal = () => { setError(''); setShowModal(true); };

  const revenue  = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const filtered = orders.filter(o =>
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  );

  const statusSummary = Object.entries(STATUS).map(([label, cfg]) => ({
    label, cfg, count: orders.filter(o => o.status === label).length,
  }));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} style={{ color: C.accent }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: C.accent }}>Logistics</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Orders</h1>
          <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Track and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="pl-11 pr-4 py-3 text-base rounded-2xl border focus:outline-none transition-all font-medium w-52"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold"
            style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            <Plus size={16} /> New Order
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        {statusSummary.map(({ label, cfg, count }, i) => {
          const Icon = cfg.icon;
          return (
            <motion.div key={label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg }}>
                <Icon size={17} style={{ color: cfg.text }} />
              </div>
              <div>
                <div className="text-2xl font-black leading-none" style={{ color: C.text }}>{count}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: cfg.text }}>{label}</div>
              </div>
            </motion.div>
          );
        })}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
          whileHover={{ y: -2 }}
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: C.accentSoft }}>
            <DollarSign size={17} style={{ color: C.accent }} />
          </div>
          <div>
            <div className="text-2xl font-black leading-none" style={{ color: C.text }}>${revenue.toFixed(0)}</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: C.accent }}>Revenue</div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-7 py-4 border-b flex items-center" style={{ borderColor: C.border }}>
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{filtered.length} orders</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Order', 'Customer', 'Total', 'Status', 'Date', 'Update Status'].map(h => (
                <th key={h} className="px-7 py-4 text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((o, i) => {
                const cfg  = STATUS[o.status] || STATUS.Preparing;
                const Icon = cfg.icon;
                return (
                  <motion.tr key={o.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="transition-colors"
                    style={{ borderTop: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: C.accentSoft }}>
                          <ShoppingCart size={15} style={{ color: C.accent }} />
                        </div>
                        <span className="font-black text-base" style={{ color: C.text }}>#{String(o.id).padStart(4, '0')}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, color: '#0E1B2E' }}>
                          {(o.customer_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-base font-semibold" style={{ color: C.text }}>{o.customer_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <span className="text-lg font-black" style={{ color: C.text }}>${parseFloat(o.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-7 py-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                        <Icon size={12} /> {o.status}
                      </span>
                    </td>
                    <td className="px-7 py-5 text-base font-medium" style={{ color: C.textMuted }}>
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-7 py-5">
                      <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="rounded-xl px-3 py-2 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                        style={{ border: `1px solid ${C.border}`, background: C.bg, color: C.text }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e  => e.target.style.borderColor = C.border}>
                        <option>Preparing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <ShoppingCart size={40} className="mx-auto mb-4" style={{ color: C.textMuted }} />
                  <p className="text-base font-semibold" style={{ color: C.textMuted }}>No orders found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.borderLight}` }}
              onClick={e => e.stopPropagation()}>
              <div className="px-7 pt-7 pb-6" style={{ background: 'linear-gradient(135deg, #EFF8FF, #EEF2FF)', borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.3)` }}>
                      <ShoppingCart size={19} style={{ color: C.accent }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black" style={{ color: C.text }}>New Order</h2>
                      <p className="text-sm mt-0.5" style={{ color: C.textSub }}>Select customer and add products</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.08)', color: C.textSub }}>
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="p-7 max-h-[70vh] overflow-y-auto space-y-5">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3.5 rounded-2xl text-sm font-semibold"
                      style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6', border: '1px solid rgba(244,114,182,0.25)' }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide" style={{ color: C.textSub }}>Customer</label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-base font-medium focus:outline-none transition-all"
                    style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e  => e.target.style.borderColor = C.border}>
                    <option value="">Select a customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-black uppercase tracking-wide" style={{ color: C.textSub }}>Order Items</label>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      type="button" onClick={addItem}
                      className="flex items-center gap-1.5 text-sm font-black px-3.5 py-2 rounded-xl"
                      style={{ background: C.accentSoft, color: C.accent }}>
                      <Plus size={13} /> Add Item
                    </motion.button>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 items-center p-3.5 rounded-2xl"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: C.accentSoft }}>
                          <Package size={13} style={{ color: C.accent }} />
                        </div>
                        <select value={item.product_id} onChange={e => handleProductSelect(i, e.target.value)}
                          className="flex-1 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none transition-all"
                          style={{ border: `1px solid ${C.border}`, color: C.text, background: C.card }}
                          onFocus={e => e.target.style.borderColor = C.accent}
                          onBlur={e  => e.target.style.borderColor = C.border}>
                          <option value="">Select product…</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} — ${p.price} (stock: {p.quantity})</option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs font-bold" style={{ color: C.textMuted }}>Qty</span>
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => handleQtyChange(i, e.target.value)}
                            className="w-14 rounded-xl px-2 py-2 text-sm text-center font-bold focus:outline-none transition-all"
                            style={{ border: `1px solid ${C.border}`, color: C.text, background: C.card }}
                            onFocus={e => e.target.style.borderColor = C.accent}
                            onBlur={e  => e.target.style.borderColor = C.border} />
                        </div>
                        <div className="text-sm font-black w-16 text-right flex-shrink-0" style={{ color: C.text }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {items.length > 1 && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            type="button" onClick={() => removeItem(i)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0"
                            style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6' }}>
                            <Trash2 size={13} />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.2)` }}>
                  <span className="text-base font-black" style={{ color: C.accent }}>Order Total</span>
                  <span className="text-2xl font-black" style={{ color: C.text }}>${total.toFixed(2)}</span>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={submitting}
                  className="w-full py-4 rounded-2xl text-base font-black disabled:opacity-60"
                  style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px ${C.accentGlow}` }}>
                  {submitting ? 'Creating…' : 'Create Order'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
