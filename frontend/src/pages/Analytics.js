import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, ArrowUpRight } from 'lucide-react';

const C = {
  bg:         '#F0F4F8',
  card:       '#FFFFFF',
  cardHover:  '#F8FAFC',
  border:     '#E2E8F0',
  accent:     '#38BDF8',
  accentSoft: 'rgba(56,189,248,0.1)',
  purple:     '#818CF8',
  purpleSoft: 'rgba(129,140,248,0.1)',
  pink:       '#F472B6',
  pinkSoft:   'rgba(244,114,182,0.1)',
  amber:      '#FBBF24',
  amberSoft:  'rgba(251,191,36,0.1)',
  green:      '#34D399',
  greenSoft:  'rgba(52,211,153,0.1)',
  text:       '#0F172A',
  textSub:    '#475569',
  textMuted:  '#94A3B8',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(15,23,42,0.12)' }}>
      <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'Revenue' ? `$${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [customers,setCustomers]= useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/orders'),
      api.get('/api/products'),
      api.get('/api/customers'),
    ]).then(([o, p, c]) => {
      setOrders(o.data);
      setProducts(p.data);
      setCustomers(c.data);
    }).catch(() => {});
  }, []);

  const monthlyData = (() => {
    const map = {};
    orders.forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: MONTHS[d.getMonth()], year: d.getFullYear(), Revenue: 0, Orders: 0 };
      map[key].Revenue += parseFloat(o.total || 0);
      map[key].Orders  += 1;
    });
    return Object.values(map)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month))
      .slice(-8);
  })();

  const statusData = [
    { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: C.green  },
    { name: 'Shipped',   value: orders.filter(o => o.status === 'Shipped').length,   color: C.accent },
    { name: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length, color: C.amber  },
  ];

  const topProducts = [...products]
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, 6)
    .map(p => ({ name: p.name.split('–')[0].trim(), price: parseFloat(p.price), qty: p.quantity }));

  const totalRevenue  = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const lowStockCount = products.filter(p => p.quantity <= (p.low_stock_alert || 10)).length;

  const kpis = [
    { label: 'Total Revenue',    value: `$${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: `${orders.length} orders`, icon: DollarSign, color: C.accent, soft: C.accentSoft },
    { label: 'Avg. Order Value', value: `$${avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: 'per order',              icon: TrendingUp,  color: C.green,  soft: C.greenSoft  },
    { label: 'Total Customers',  value: customers.length,                                                           sub: 'registered',             icon: Users,       color: C.purple, soft: C.purpleSoft },
    { label: 'Low Stock Items',  value: lowStockCount,                                                              sub: 'need attention',         icon: Package,     color: C.amber,  soft: C.amberSoft  },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>REPORTS</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Analytics</h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Performance overview and business insights</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpis.map(({ label, value, sub, icon: Icon, color, soft }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
            className="rounded-3xl p-6 cursor-default"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: soft }}>
                <Icon size={18} style={{ color }} />
              </div>
              <ArrowUpRight size={16} style={{ color: C.textMuted }} />
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: C.text }}>{value}</div>
            <div className="text-sm font-semibold" style={{ color: C.textMuted }}>{label}</div>
            <div className="text-xs font-medium mt-1" style={{ color }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-3xl p-6"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black" style={{ color: C.text }}>Monthly Revenue</h3>
              <p className="text-sm font-medium" style={{ color: C.textMuted }}>Last 8 months</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: C.accent }} />Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Revenue" name="Revenue" stroke={C.accent} strokeWidth={2.5}
                fill="url(#aGrad)" dot={{ fill: C.accent, r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: C.accent, strokeWidth: 2, fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-3xl p-6"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
          <h3 className="text-lg font-black mb-1" style={{ color: C.text }}>Order Status</h3>
          <p className="text-sm font-medium mb-6" style={{ color: C.textMuted }}>Distribution</p>
          <div className="space-y-4">
            {statusData.map(({ name, value, color }) => {
              const pct = orders.length ? Math.round((value / orders.length) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold" style={{ color: C.textSub }}>{name}</span>
                    <span className="text-sm font-black" style={{ color }}>{value} <span className="font-medium text-xs" style={{ color: C.textMuted }}>({pct}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: C.bg }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${color}50` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex justify-between">
              <span className="text-sm font-bold" style={{ color: C.textSub }}>Total Orders</span>
              <span className="text-xl font-black" style={{ color: C.text }}>{orders.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="rounded-3xl p-6"
        style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black" style={{ color: C.text }}>Top Products by Price</h3>
            <p className="text-sm font-medium" style={{ color: C.textMuted }}>Highest value items in inventory</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topProducts} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={true} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="price" name="Revenue" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {topProducts.map((_, i) => (
                <Cell key={i} fill={[C.accent, C.purple, C.pink, C.amber, C.green, C.accent][i % 6]}
                  fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
