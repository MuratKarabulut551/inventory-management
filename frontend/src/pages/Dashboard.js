import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Package, Users, ShoppingCart, Zap, TrendingUp,
  ArrowUpRight, RefreshCw, ArrowRight, Star,
  Clock, Truck, CheckCircle2,
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
  pinkSoft:    'rgba(244,114,182,0.08)',
  amber:       '#FBBF24',
  green:       '#34D399',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
};

function AnimatedNumber({ value }) {
  const ref    = useRef(null);
  const mv     = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState(0);
  const inView = useInView(ref, { once: true });
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function Sparkline({ data, color, id }) {
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5}
          fill={`url(#sg-${id})`} dot={false} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-5 py-3.5 text-sm shadow-xl"
      style={{ background: C.card, border: `1px solid ${C.borderLight}`, color: C.text, boxShadow: '0 8px 30px rgba(15,23,42,0.12)' }}>
      <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: C.textMuted }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

const SPARKS = {
  products:     [3,5,4,7,6,8,7,9].map(v => ({ v })),
  customers:    [2,4,3,5,7,6,8,10].map(v => ({ v })),
  orders:       [1,3,2,5,4,6,5,8].map(v => ({ v })),
  activeOrders: [2,3,4,3,5,4,6,5].map(v => ({ v })),
};

const STATUS_CFG = {
  Preparing: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  Shipped:   { color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)'  },
  Delivered: { color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)'  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,      setStats]      = useState({ products: 0, customers: 0, orders: 0, activeOrders: 0, revenue: 0, preparing: 0, shipped: 0, delivered: 0 });
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [p, c, o] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/customers'),
        api.get('/api/orders'),
      ]);
      const revenue      = o.data.reduce((s, r) => s + parseFloat(r.total || 0), 0);
      const preparing    = o.data.filter(x => x.status === 'Preparing').length;
      const shipped      = o.data.filter(x => x.status === 'Shipped').length;
      const delivered    = o.data.filter(x => x.status === 'Delivered').length;
      const activeOrders = preparing + shipped;
      setStats({ products: p.data.length, customers: c.data.length, orders: o.data.length, activeOrders, revenue, preparing, shipped, delivered });
      setProducts(p.data.slice(0, 5));
      setOrders(o.data.slice(0, 5));
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(false); }, [fetchAll]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = (() => {
    const map = {};
    orders.forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: MONTHS[d.getMonth()], year: d.getFullYear(), orders: 0, revenue: 0 };
      map[key].orders  += 1;
      map[key].revenue += parseFloat(o.total || 0);
    });
    return Object.values(map)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month))
      .slice(-6)
      .map(d => ({ ...d, revenue: Math.round(d.revenue) }));
  })();

  const statCards = [
    { key: 'products',     label: 'Total Products', sub: 'In inventory', dest: '/products',  icon: Package,      color: C.accent,  iconBg: C.accentSoft,           iconColor: C.accent  },
    { key: 'customers',    label: 'Customers',      sub: 'Registered',   dest: '/customers', icon: Users,        color: C.purple,  iconBg: C.purpleSoft,           iconColor: C.purple  },
    { key: 'orders',       label: 'Total Orders',   sub: 'All time',     dest: '/orders',    icon: ShoppingCart, color: C.pink,    iconBg: C.pinkSoft,             iconColor: C.pink    },
    { key: 'activeOrders', label: 'Active Orders',  sub: 'In Progress',  dest: '/orders',    icon: Zap,          color: C.amber,   iconBg: 'rgba(251,191,36,0.1)', iconColor: C.amber   },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 rounded-2xl w-64" style={{ background: C.border }} />
        <div className="grid grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-44 rounded-3xl" style={{ background: C.border }} />)}
        </div>
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3 h-80 rounded-3xl" style={{ background: C.border }} />
          <div className="col-span-2 space-y-5">
            <div className="h-36 rounded-3xl" style={{ background: C.border }} />
            <div className="h-36 rounded-3xl" style={{ background: C.border }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} style={{ color: C.accent }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: C.accent }}>Overview</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Dashboard</h1>
          <p className="text-base font-medium mt-2" style={{ color: C.textSub }}>
            Key indicators, trends and analytics at a glance
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-base font-bold transition-colors disabled:opacity-60"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textSub, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : {}}>
              <RefreshCw size={16} />
            </motion.div>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-base font-bold"
            style={{ background: C.accent, color: '#0F172A', boxShadow: `0 4px 20px ${C.accentGlow}` }}>
            <ShoppingCart size={16} /> New Order
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-3xl p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EFF8FF 0%, #E0F2FE 50%, #EEF2FF 100%)', border: `1px solid rgba(56,189,248,0.2)`, boxShadow: '0 4px 24px rgba(56,189,248,0.08)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(56,189,248,0.15), transparent)`, filter: 'blur(40px)' }} />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(129,140,248,0.1), transparent)`, filter: 'blur(30px)' }} />

        <div className="flex items-center justify-between relative">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.25)` }}>
                <Zap size={15} style={{ color: C.accent }} />
              </div>
              <span className="text-sm font-black uppercase tracking-wider" style={{ color: C.textSub }}>Performance Overview</span>
            </div>
            <h2 className="text-3xl font-black leading-tight" style={{ color: C.text }}>Explore your</h2>
            <h2 className="text-3xl font-black italic leading-tight mb-3" style={{ color: C.accent }}>performance</h2>
            <p className="text-base font-medium" style={{ color: C.textSub }}>Dive into trends and product insights</p>
          </div>
          <div className="flex items-center gap-4 ml-8">
            {[
              { label: 'Revenue',   value: `$${Math.round(stats.revenue).toLocaleString()}` },
              { label: 'Orders',    value: stats.orders },
              { label: 'Customers', value: stats.customers },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className="text-center px-6 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, backdropFilter: 'blur(10px)' }}>
                <div className="text-3xl font-black" style={{ color: C.text }}>{item.value}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: C.textSub }}>{item.label}</div>
              </motion.div>
            ))}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold"
              style={{ background: C.accent, color: '#0F172A', boxShadow: `0 4px 20px ${C.accentGlow}` }}>
              View Details <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        {statCards.map(({ key, label, sub, dest, icon: Icon, color, iconBg, iconColor }, i) => (
          <motion.div key={key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
            whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(15,23,42,0.1)` }}
            onClick={() => navigate(dest)}
            className="rounded-3xl p-6 overflow-hidden cursor-pointer"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: iconBg }}>
                <Icon size={21} style={{ color: iconColor }} />
              </div>
              <div className="text-sm font-bold" style={{ color: C.textMuted }}>
                {sub}
              </div>
            </div>
            <div className="text-4xl font-black mb-1 leading-none" style={{ color: C.text }}>
              <AnimatedNumber value={stats[key]} />
            </div>
            <div className="text-base font-semibold mb-3" style={{ color: C.textSub }}>{label}</div>
            <Sparkline data={SPARKS[key]} color={color} id={key} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="col-span-3 rounded-3xl p-7"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-black" style={{ color: C.text }}>Revenue Trends</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl font-black" style={{ color: C.text }}>
                  $<AnimatedNumber value={Math.round(stats.revenue)} />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: C.textMuted }}>
              <div className="flex items-center gap-2 font-semibold">
                <div className="w-3 h-3 rounded-full" style={{ background: C.accent }} /> Orders
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <div className="w-3 h-3 rounded-full" style={{ background: C.purple }} /> Revenue
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.purple} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 13, fill: C.textMuted, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="orders"  stroke={C.accent}  strokeWidth={2.5} fill="url(#areaGrad1)" name="Orders"    dot={{ fill: C.accent,  r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="revenue" stroke={C.purple}  strokeWidth={2.5} fill="url(#areaGrad2)" name="Revenue $" dot={{ fill: C.purple,  r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="col-span-2 flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="rounded-3xl p-6 flex-1"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: C.text }}>Order Status</h3>
              <span className="text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: C.accentSoft, color: C.accent }}>Total: {stats.orders}</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Preparing', value: stats.preparing, color: C.amber,  bg: 'rgba(251,191,36,0.1)', icon: Clock        },
                { label: 'Shipped',   value: stats.shipped,   color: C.accent, bg: C.accentSoft,           icon: Truck        },
                { label: 'Delivered', value: stats.delivered, color: C.green,  bg: 'rgba(52,211,153,0.1)', icon: CheckCircle2 },
              ].map(({ label, value, color, bg, icon: Icon }) => {
                const pct = stats.orders > 0 ? Math.round((value / stats.orders) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                          <Icon size={13} style={{ color }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: C.textSub }}>{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black" style={{ color }}>{value}</span>
                        <span className="text-xs font-bold" style={{ color: C.textMuted }}>({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: C.border }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
            onClick={() => navigate('/orders')}
            className="rounded-3xl p-6 relative overflow-hidden cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #EFF8FF, #EEF2FF)', border: `1px solid rgba(56,189,248,0.2)`, boxShadow: '0 4px 20px rgba(56,189,248,0.1)' }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, rgba(56,189,248,0.15), transparent)`, filter: 'blur(20px)' }} />
            <div className="flex items-start justify-between mb-4 relative">
              <div className="flex items-center gap-1.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.25)` }}>
                  <Package size={15} style={{ color: C.accent }} />
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center -ml-2"
                  style={{ background: C.purpleSoft, border: `1px solid rgba(129,140,248,0.25)` }}>
                  <Star size={15} style={{ color: C.purple }} />
                </div>
              </div>
              <ArrowUpRight size={18} style={{ color: C.accent, opacity: 0.6 }} />
            </div>
            <div className="text-lg font-semibold mb-1 relative" style={{ color: C.textSub }}>You have sold</div>
            <div className="text-4xl font-black leading-tight relative" style={{ color: C.text }}>
              {stats.orders} <span style={{ color: C.accent }}>orders</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="col-span-3 rounded-3xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="px-7 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <h3 className="text-lg font-black" style={{ color: C.text }}>Recent Orders</h3>
              <p className="text-base font-medium mt-0.5" style={{ color: C.textMuted }}>{orders.length} latest transactions</p>
            </div>
            <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/orders')}
              className="text-base font-bold flex items-center gap-1.5" style={{ color: C.accent }}>
              View all <ArrowRight size={15} />
            </motion.button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                {['Order', 'Customer', 'Total', 'Status'].map(h => (
                  <th key={h} className="px-7 py-4 text-sm font-black uppercase tracking-wider" style={{ color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-14 text-base font-medium" style={{ color: C.textMuted }}>No orders yet.</td></tr>
              ) : orders.map((o, i) => {
                const cfg = STATUS_CFG[o.status] || STATUS_CFG.Preparing;
                return (
                  <motion.tr key={o.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.04 }}
                    onClick={() => navigate('/orders')}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-7 py-4">
                      <span className="font-black text-lg" style={{ color: C.text }}>#{String(o.id).padStart(4,'0')}</span>
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                          style={{ background: `linear-gradient(135deg, #38BDF8, #818CF8)` }}>
                          {(o.customer_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-base font-semibold truncate max-w-[110px]" style={{ color: C.text }}>
                          {o.customer_name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-4">
                      <span className="font-black text-lg" style={{ color: C.text }}>${parseFloat(o.total || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-7 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-bold px-3.5 py-1.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {o.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="col-span-2 rounded-3xl overflow-hidden"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <h3 className="text-lg font-black" style={{ color: C.text }}>Top Products</h3>
              <p className="text-base font-medium mt-0.5" style={{ color: C.textMuted }}>Product catalog</p>
            </div>
            <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/products')}
              className="text-base font-bold flex items-center gap-1.5" style={{ color: C.accent }}>
              View all <ArrowRight size={15} />
            </motion.button>
          </div>
          <div className="p-4 space-y-1">
            {products.length === 0 ? (
              <div className="text-center py-14 text-base font-medium" style={{ color: C.textMuted }}>No products yet.</div>
            ) : products.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                onClick={() => navigate('/products')}
                className="flex items-center gap-4 p-3.5 rounded-2xl transition-colors cursor-pointer"
                onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: C.accentSoft }}>
                  <Package size={17} style={{ color: C.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold truncate" style={{ color: C.text }}>{p.name}</div>
                  <div className="text-sm font-medium" style={{ color: C.textMuted }}>{p.quantity} units</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black" style={{ color: C.text }}>${parseFloat(p.price).toLocaleString()}</div>
                  {Number(p.quantity) <= Number(p.low_stock_alert)
                    ? <span className="text-xs font-bold" style={{ color: C.amber }}>Low Stock</span>
                    : <span className="text-xs font-bold" style={{ color: C.green }}>In Stock</span>
                  }
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
