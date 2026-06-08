import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Mail, Phone, MapPin, Search, UserCheck, UserPlus } from 'lucide-react';

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

const avatarGrads = [
  `linear-gradient(135deg, #38BDF8, #818CF8)`,
  `linear-gradient(135deg, #818CF8, #F472B6)`,
  `linear-gradient(135deg, #34D399, #38BDF8)`,
  `linear-gradient(135deg, #FBBF24, #F472B6)`,
  `linear-gradient(135deg, #F472B6, #818CF8)`,
];

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');

  const fetchCustomers = async () => {
    const res = await api.get('/api/customers');
    setCustomers(res.data);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/api/customers', form);
    setForm(emptyForm);
    setShowModal(false);
    fetchCustomers();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/customers/${id}`);
    fetchCustomers();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const statChips = [
    { label: 'Total Customers', value: customers.length,                                                                    icon: Users,     iconBg: C.accentSoft,            iconColor: C.accent },
    { label: 'With Email',      value: customers.filter(c => c.email).length,                                               icon: UserCheck, iconBg: 'rgba(52,211,153,0.12)', iconColor: C.green  },
    { label: 'New This Week',   value: customers.filter(c => new Date(c.created_at) >= oneWeekAgo).length,                  icon: UserPlus,  iconBg: 'rgba(251,191,36,0.12)', iconColor: C.amber  },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} style={{ color: C.accent }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: C.accent }}>CRM</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Customers</h1>
          <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Manage your customer base</p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="pl-11 pr-4 py-3 text-base rounded-2xl border focus:outline-none transition-all font-medium w-56"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e  => e.target.style.borderColor = C.border} />
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold"
            style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px ${C.accentGlow}` }}>
            <Plus size={16} /> Add Customer
          </motion.button>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-7">
        {statChips.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3.5 px-5 py-4 rounded-2xl"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}>
              <Icon size={17} style={{ color: iconColor }} />
            </div>
            <div>
              <div className="text-2xl font-black leading-none" style={{ color: C.text }}>{value}</div>
              <div className="text-sm font-medium mt-0.5" style={{ color: C.textMuted }}>{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-7 py-4 flex items-center justify-between border-b" style={{ borderColor: C.border }}>
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
            {filtered.length} customers
          </span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Customer', 'Email', 'Phone', 'Address', ''].map(h => (
                <th key={h} className="px-7 py-4 text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((c, i) => (
                <motion.tr key={c.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group transition-colors"
                  style={{ borderTop: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-base"
                        style={{ background: avatarGrads[c.id % avatarGrads.length] }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-base" style={{ color: C.text }}>{c.name}</div>
                        <div className="text-sm mt-0.5" style={{ color: C.textMuted }}>ID #{String(c.id).padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <Mail size={13} style={{ color: C.textMuted }} className="flex-shrink-0" />
                      <span className="text-base font-medium" style={{ color: C.textSub }}>{c.email || '—'}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <Phone size={13} style={{ color: C.textMuted }} className="flex-shrink-0" />
                      <span className="text-base font-medium" style={{ color: C.textSub }}>{c.phone || '—'}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} style={{ color: C.textMuted }} className="flex-shrink-0" />
                      <span className="text-base font-medium truncate max-w-[180px]" style={{ color: C.textSub }}>{c.address || '—'}</span>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(c.id)}
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
                  <Users size={40} className="mx-auto mb-4" style={{ color: C.textMuted }} />
                  <p className="text-base font-semibold" style={{ color: C.textMuted }}>No customers found.</p>
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
                      <Users size={19} style={{ color: C.accent }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black" style={{ color: C.text }}>Add Customer</h2>
                      <p className="text-sm mt-0.5" style={{ color: C.textSub }}>Register a new customer</p>
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
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                {[
                  { label: 'Full Name',     key: 'name',    type: 'text',  required: true  },
                  { label: 'Email Address', key: 'email',   type: 'email', required: false },
                  { label: 'Phone Number',  key: 'phone',   type: 'text',  required: false },
                  { label: 'Address',       key: 'address', type: 'text',  required: false },
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
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full py-4 rounded-2xl text-base font-black"
                  style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 16px ${C.accentGlow}` }}>
                  Save Customer
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
