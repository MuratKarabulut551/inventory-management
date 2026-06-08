import React, { useEffect, useState } from 'react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const C = {
  bg:          '#F0F4F8',
  card:        '#FFFFFF',
  cardHover:   '#F8FAFC',
  border:      '#E2E8F0',
  borderLight: '#CBD5E1',
  accent:      '#38BDF8',
  accentSoft:  'rgba(56,189,248,0.1)',
  purple:      '#818CF8',
  purpleSoft:  'rgba(129,140,248,0.1)',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
};

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring', stiffness: 320, damping: 26 } },
  exit:    { opacity: 0, scale: 0.94, y: 24, transition: { duration: 0.2 } },
};

const emptyForm = { name: '', description: '', quantity: '', low_stock_alert: 10, price: '' };

export default function Products() {
  const [products,  setProducts]  = useState([]);
  const [form,      setForm]      = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState('');

  const fetchProducts = async () => {
    const res = await api.get('/api/products');
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/api/products', form);
    setForm(emptyForm);
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/products/${id}`);
    fetchProducts();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Products Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    autoTable(doc, {
      startY: 40,
      head: [['Name', 'Description', 'Quantity', 'Price', 'Status']],
      body: products.map(p => [p.name, p.description || '-', p.quantity, `$${p.price}`, p.quantity <= p.low_stock_alert ? 'Low Stock' : 'In Stock']),
    });
    doc.save('products-report.pdf');
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Package size={15} style={{ color: C.accent }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: C.accent }}>Inventory</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Products</h1>
          <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-11 pr-4 py-3 text-base rounded-2xl border focus:outline-none transition-all font-medium w-56"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold border transition-colors"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textSub }}>
            <FileText size={16} /> Export PDF
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold"
            style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px rgba(56,189,248,0.3)` }}>
            <Plus size={16} /> Add Product
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Product', 'Quantity', 'Price', 'Status', ''].map(h => (
                <th key={h} className="px-7 py-4 text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.tr key={p.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group transition-colors"
                  style={{ borderTop: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: C.accentSoft }}>
                        <Package size={19} style={{ color: C.accent }} />
                      </div>
                      <div>
                        <div className="font-bold text-base" style={{ color: C.text }}>{p.name}</div>
                        <div className="text-sm mt-0.5" style={{ color: C.textMuted }}>{p.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <span className="text-lg font-black" style={{ color: C.text }}>{p.quantity}</span>
                    <span className="text-sm ml-1.5" style={{ color: C.textMuted }}>units</span>
                  </td>
                  <td className="px-7 py-5">
                    <span className="text-lg font-black" style={{ color: C.text }}>${p.price}</span>
                  </td>
                  <td className="px-7 py-5">
                    {p.quantity <= p.low_stock_alert ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <AlertTriangle size={13} /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-1.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <CheckCircle size={13} /> In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-7 py-5">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-sm font-bold px-4 py-2 rounded-xl transition-all"
                      style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6' }}>
                      Delete
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <Package size={40} className="mx-auto mb-4" style={{ color: C.textMuted }} />
                  <p className="text-base font-semibold" style={{ color: C.textMuted }}>No products found.</p>
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
              className="rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.borderLight}` }}
              onClick={e => e.stopPropagation()}>
              <div className="px-7 pt-7 pb-6" style={{ background: 'linear-gradient(135deg, #EFF8FF, #EEF2FF)', borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.3)` }}>
                      <Package size={19} style={{ color: C.accent }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black" style={{ color: C.text }}>Add New Product</h2>
                      <p className="text-sm mt-0.5" style={{ color: C.textSub }}>Fill in the product details below</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.08)', color: C.textSub }}>
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="p-7 space-y-5">
                {[
                  { label: 'Product Name', key: 'name',        type: 'text',   required: true  },
                  { label: 'Description',  key: 'description', type: 'text',   required: false },
                ].map(({ label, key, type, required }) => (
                  <div key={key}>
                    <label className="block text-sm font-black mb-2 uppercase tracking-wide" style={{ color: C.textSub }}>{label}</label>
                    <input type={type} required={required} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full rounded-2xl px-4 py-3 text-base border focus:outline-none transition-all font-medium"
                      style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e  => e.target.style.borderColor = C.border}
                      placeholder={label} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Quantity',       key: 'quantity',        required: true  },
                    { label: 'Price ($)',       key: 'price',           required: true  },
                    { label: 'Low Stock Alert', key: 'low_stock_alert', required: false },
                  ].map(({ label, key, required }) => (
                    <div key={key} className={key === 'low_stock_alert' ? 'col-span-2' : ''}>
                      <label className="block text-sm font-black mb-2 uppercase tracking-wide" style={{ color: C.textSub }}>{label}</label>
                      <input type="number" required={required} value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full rounded-2xl px-4 py-3 text-base border focus:outline-none transition-all font-medium"
                        style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
                        onFocus={e => e.target.style.borderColor = C.accent}
                        onBlur={e  => e.target.style.borderColor = C.border}
                        placeholder="0" />
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl text-base font-black"
                  style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px rgba(56,189,248,0.3)` }}>
                  Save Product
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
