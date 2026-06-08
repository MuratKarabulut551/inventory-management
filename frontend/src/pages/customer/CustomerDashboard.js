import React, { useEffect, useState } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, Truck, CheckCircle2, Package } from 'lucide-react';

const C = {
  bg:       '#F0F4F8',
  card:     '#FFFFFF',
  cardHover:'#F8FAFC',
  border:   '#E2E8F0',
  accent:   '#38BDF8',
  accentSoft:'rgba(56,189,248,0.1)',
  purple:   '#818CF8',
  amber:    '#FBBF24',
  green:    '#34D399',
  text:     '#0F172A',
  textSub:  '#475569',
  textMuted:'#94A3B8',
};

const STATUS_CFG = {
  Preparing: { icon: Clock,        color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  gradient: 'linear-gradient(135deg, #FEF9C3, #FEF08A)' },
  Shipped:   { icon: Truck,        color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  gradient: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)' },
  Delivered: { icon: CheckCircle2, color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  gradient: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function CustomerDashboard({ user }) {
  const [orders,  setOrders]  = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/api/customer-portal/orders').then(r => setOrders(r.data)).catch(() => {});
    api.get('/api/customer-portal/profile').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Orders', value: orders.length,                                       icon: ShoppingBag, iconBg: C.accentSoft,              iconColor: C.accent  },
    { label: 'Preparing',    value: orders.filter(o => o.status === 'Preparing').length, icon: Clock,       iconBg: 'rgba(251,191,36,0.1)',     iconColor: C.amber   },
    { label: 'Shipped',      value: orders.filter(o => o.status === 'Shipped').length,   icon: Truck,       iconBg: 'rgba(56,189,248,0.1)',     iconColor: C.accent  },
    { label: 'Delivered',    value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2,iconBg: 'rgba(52,211,153,0.1)',     iconColor: C.green   },
  ];

  return (
    <div>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Package size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>My Account</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>
          Hello, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Track your orders and manage your account</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
          <motion.div
            key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -4 }}
            className="rounded-3xl p-6 cursor-default"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: iconBg }}>
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <div className="text-4xl font-black mb-1" style={{ color: C.text }}>{value}</div>
            <div className="text-sm font-semibold" style={{ color: C.textMuted }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-black mb-4" style={{ color: C.text }}>Recent Orders</h2>
        <div className="rounded-3xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: C.textMuted }} />
              <p className="text-base font-semibold" style={{ color: C.textMuted }}>No orders yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                  {['Order', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-7 py-4 text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o, i) => {
                  const cfg = STATUS_CFG[o.status] || STATUS_CFG.Preparing;
                  const Icon = cfg.icon;
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      style={{ borderTop: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      className="transition-colors"
                    >
                      <td className="px-7 py-5">
                        <span className="font-black text-base" style={{ color: C.text }}>#{String(o.id).padStart(4, '0')}</span>
                      </td>
                      <td className="px-7 py-5">
                        <span className="font-black text-lg" style={{ color: C.text }}>${o.total}</span>
                      </td>
                      <td className="px-7 py-5">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
                          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          <Icon size={12} /> {o.status}
                        </span>
                      </td>
                      <td className="px-7 py-5 text-base font-medium" style={{ color: C.textMuted }}>
                        {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
