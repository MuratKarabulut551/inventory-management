import React, { useEffect, useState } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Truck, CheckCircle2, ChevronDown, ChevronUp, Package } from 'lucide-react';

const C = {
  bg:        '#F0F4F8',
  card:      '#FFFFFF',
  cardHover: '#F8FAFC',
  border:    '#E2E8F0',
  accent:    '#38BDF8',
  accentSoft:'rgba(56,189,248,0.1)',
  purple:    '#818CF8',
  amber:     '#FBBF24',
  green:     '#34D399',
  text:      '#0F172A',
  textSub:   '#475569',
  textMuted: '#94A3B8',
};

const statusConfig = {
  Preparing: { icon: Clock,        color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  Shipped:   { icon: Truck,        color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)'  },
  Delivered: { icon: CheckCircle2, color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
};

const steps = ['Preparing', 'Shipped', 'Delivered'];

function ProgressBar({ status }) {
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-2 mt-5">
      {steps.map((s, i) => {
        const done = i <= idx;
        const cfg = statusConfig[s];
        const Icon = cfg.icon;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{ background: done ? cfg.color : C.border }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ boxShadow: done ? `0 0 12px ${cfg.color}40` : 'none' }}
              >
                <Icon size={15} color={done ? '#fff' : C.textMuted} />
              </motion.div>
              <span className="text-xs font-bold" style={{ color: done ? cfg.color : C.textMuted }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.div
                className="flex-1 h-0.5 rounded-full mb-5"
                initial={false}
                animate={{ background: i < idx ? cfg.color : C.border }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function CustomerOrders() {
  const [orders,   setOrders]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [detail,   setDetail]   = useState({});

  useEffect(() => {
    api.get('/api/customer-portal/orders').then(r => setOrders(r.data)).catch(() => {});
  }, []);

  const toggleOrder = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!detail[id]) {
      const res = await api.get(`/api/customer-portal/orders/${id}`);
      setDetail(prev => ({ ...prev, [id]: res.data }));
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>My Orders</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Order History</h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>{orders.length} orders total</p>
      </motion.div>

      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="rounded-3xl text-center py-20"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <ShoppingBag size={40} className="mx-auto mb-4" style={{ color: C.textMuted }} />
            <p className="text-base font-semibold" style={{ color: C.textMuted }}>No orders yet.</p>
          </div>
        )}
        {orders.map((o, i) => {
          const cfg  = statusConfig[o.status] || statusConfig.Preparing;
          const Icon = cfg.icon;
          const isOpen = expanded === o.id;
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}
            >
              {/* Order header */}
              <button className="w-full px-7 py-5 flex items-center gap-4 transition-colors text-left"
                onClick={() => toggleOrder(o.id)}
                onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.accentSoft }}>
                  <Package size={18} style={{ color: C.accent }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-base" style={{ color: C.text }}>Order #{String(o.id).padStart(4, '0')}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <Icon size={11} /> {o.status}
                    </span>
                  </div>
                  <div className="text-sm mt-0.5 font-medium" style={{ color: C.textMuted }}>
                    {new Date(o.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-lg" style={{ color: C.text }}>${o.total}</div>
                </div>
                <div className="ml-2 flex-shrink-0" style={{ color: C.textMuted }}>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="px-7 pb-7 pt-0" style={{ borderTop: `1px solid ${C.border}` }}>
                      {/* Progress bar */}
                      <ProgressBar status={o.status} />

                      {/* Items */}
                      {detail[o.id] && (
                        <div className="mt-6">
                          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: C.textMuted }}>Order Items</p>
                          <div className="space-y-2">
                            {detail[o.id].items?.map(item => (
                              <div key={item.id} className="flex items-center justify-between py-3 px-5 rounded-2xl"
                                style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: C.accentSoft }}>
                                    <Package size={14} style={{ color: C.accent }} />
                                  </div>
                                  <div>
                                    <div className="text-base font-bold" style={{ color: C.text }}>{item.product_name}</div>
                                    <div className="text-sm" style={{ color: C.textMuted }}>Qty: {item.quantity}</div>
                                  </div>
                                </div>
                                <div className="font-black text-base" style={{ color: C.text }}>${item.price}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-5 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
                            <span className="text-base font-bold" style={{ color: C.textSub }}>Total</span>
                            <span className="text-2xl font-black" style={{ color: C.text }}>${o.total}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
