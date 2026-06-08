import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, ShoppingCart, LogOut,
  ShoppingBag, List, Search, Bell,
  BarChart2, Settings, HelpCircle, FileText, X,
  Clock, Truck, CheckCircle2, ArrowRight, ChevronDown, Shield,
} from 'lucide-react';
import api from './api';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Exports from './pages/Exports';
import SettingsPage from './pages/Settings';
import HelpPage from './pages/Help';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';

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
  pinkSoft:    'rgba(244,114,182,0.1)',
  amber:       '#FBBF24',
  green:       '#34D399',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
};

const S = {
  bg:      '#0F172A',
  text:    '#E2E8F0',
  sub:     '#94A3B8',
  muted:   '#4B5563',
  border:  'rgba(255,255,255,0.07)',
  card:    'rgba(255,255,255,0.05)',
  hover:   'rgba(255,255,255,0.04)',
};

const adminSections = [
  {
    label: 'MAIN',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
      { to: '/products',  icon: Package,         label: 'Products'   },
      { to: '/customers', icon: Users,           label: 'Customers'  },
      { to: '/orders',    icon: ShoppingCart,    label: 'Orders'     },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { to: '/analytics', icon: BarChart2,  label: 'Analytics' },
      { to: '/exports',   icon: FileText,   label: 'Exports'   },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/settings', icon: Settings,   label: 'Settings' },
      { to: '/help',     icon: HelpCircle, label: 'Help'     },
    ],
  },
];

const customerSections = [
  {
    label: 'MY ACCOUNT',
    items: [
      { to: '/my',        icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/my/orders', icon: List,            label: 'My Orders' },
    ],
  },
];

const STATUS_ICON = { Preparing: Clock, Shipped: Truck, Delivered: CheckCircle2 };
const STATUS_CLR  = { Preparing: '#FBBF24', Shipped: '#38BDF8', Delivered: '#34D399' };

function NavItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
        className="relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-base font-bold cursor-pointer transition-all"
        style={{ color: isActive ? C.accent : S.sub }}
      >
        {isActive && (
          <motion.div layoutId="activeNav" className="absolute inset-0 rounded-2xl"
            style={{ background: 'rgba(56,189,248,0.1)', border: `1px solid rgba(56,189,248,0.2)` }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
        )}
        {!isActive && (
          <motion.div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: S.hover }} />
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
            style={{ background: C.accent, boxShadow: `0 0 12px ${C.accentGlow}` }} />
        )}
        <Icon size={20} className="relative z-10 flex-shrink-0" />
        <span className="relative z-10 font-bold">{label}</span>
        {isActive && (
          <motion.div className="ml-auto w-2 h-2 rounded-full relative z-10"
            style={{ background: C.accent, boxShadow: `0 0 8px ${C.accentGlow}` }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }} />
        )}
      </motion.div>
    </Link>
  );
}

function PageTransition({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="p-8">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function GlobalSearch() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState({ products: [], customers: [], orders: [] });
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref      = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults({ products: [], customers: [], orders: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [p, c, o] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/customers'),
          api.get('/api/orders'),
        ]);
        const q = query.toLowerCase();
        setResults({
          products:  p.data.filter(x => x.name?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q)).slice(0, 3),
          customers: c.data.filter(x => x.name?.toLowerCase().includes(q) || x.email?.toLowerCase().includes(q)).slice(0, 3),
          orders:    o.data.filter(x => String(x.id).includes(q) || x.customer_name?.toLowerCase().includes(q)).slice(0, 3),
        });
      } catch {}
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const total = results.products.length + results.customers.length + results.orders.length;
  const go = path => { navigate(path); setOpen(false); setQuery(''); };

  return (
    <div ref={ref} className="relative hidden md:block" style={{ width: 260 }}>
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ color: C.textMuted }} />
        <input value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, customers…"
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-2xl focus:outline-none transition-all font-medium"
          style={{
            background: C.card,
            border: `1.5px solid ${open ? C.accent : C.border}`,
            color: C.text,
            boxShadow: open ? `0 0 0 3px ${C.accentSoft}` : '0 1px 4px rgba(0,0,0,0.06)',
          }} />
        {query
          ? <button onClick={() => { setQuery(''); setResults({ products:[], customers:[], orders:[] }); }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }}>
              <X size={14} />
            </button>
          : <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded"
              style={{ color: C.textMuted, background: C.bg, border: `1px solid ${C.border}`, lineHeight: '1.4' }}>⌘K</kbd>
        }
      </div>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 rounded-3xl overflow-hidden z-50"
            style={{ width: 360, background: C.card, boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: `1px solid ${C.borderLight}` }}>

            {loading && (
              <div className="px-5 py-5 flex items-center gap-3" style={{ color: C.textSub }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 rounded-full border-t-transparent"
                  style={{ borderColor: `${C.accent} transparent ${C.accent} ${C.accent}` }} />
                <span className="text-base font-medium">Searching…</span>
              </div>
            )}

            {!loading && total === 0 && (
              <div className="px-5 py-8 text-center">
                <Search size={28} className="mx-auto mb-3" style={{ color: C.textMuted }} />
                <p className="text-base font-semibold" style={{ color: C.textSub }}>No results for "<strong>{query}</strong>"</p>
              </div>
            )}

            {!loading && results.products.length > 0 && (
              <div>
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.textMuted }}>Products</span>
                  <button onClick={() => go('/products')} className="text-sm font-bold flex items-center gap-1" style={{ color: C.accent }}>
                    All <ArrowRight size={12} />
                  </button>
                </div>
                {results.products.map(p => (
                  <button key={p.id} onClick={() => go('/products')}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                    style={{ borderTop: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: C.accentSoft }}>
                      <Package size={15} style={{ color: C.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold truncate" style={{ color: C.text }}>{p.name}</div>
                      <div className="text-sm" style={{ color: C.textMuted }}>{p.quantity} units · ${p.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && results.customers.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.textMuted }}>Customers</span>
                  <button onClick={() => go('/customers')} className="text-sm font-bold flex items-center gap-1" style={{ color: C.accent }}>
                    All <ArrowRight size={12} />
                  </button>
                </div>
                {results.customers.map(c => (
                  <button key={c.id} onClick={() => go('/customers')}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                    style={{ borderTop: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                      style={{ background: C.purple }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold truncate" style={{ color: C.text }}>{c.name}</div>
                      <div className="text-sm truncate" style={{ color: C.textMuted }}>{c.email || 'No email'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && results.orders.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.textMuted }}>Orders</span>
                  <button onClick={() => go('/orders')} className="text-sm font-bold flex items-center gap-1" style={{ color: C.accent }}>
                    All <ArrowRight size={12} />
                  </button>
                </div>
                {results.orders.map(o => {
                  const Icon = STATUS_ICON[o.status] || Clock;
                  return (
                    <button key={o.id} onClick={() => go('/orders')}
                      className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left"
                      style={{ borderTop: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: C.accentSoft }}>
                        <Icon size={15} style={{ color: STATUS_CLR[o.status] || C.textMuted }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold" style={{ color: C.text }}>Order #{String(o.id).padStart(4,'0')}</div>
                        <div className="text-sm" style={{ color: C.textMuted }}>{o.customer_name} · ${parseFloat(o.total||0).toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="px-5 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
              <p className="text-sm text-center font-medium" style={{ color: C.textMuted }}>
                {total > 0 ? `${total} result${total !== 1 ? 's' : ''} found` : 'Start typing to search'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationBell() {
  const [open,   setOpen]   = useState(false);
  const [orders, setOrders] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const ref      = useRef(null);

  useEffect(() => {
    api.get('/api/orders').then(r => {
      const recent = r.data.slice(0, 6);
      setOrders(recent);
      const lastSeen = parseInt(localStorage.getItem('notif_last_seen') || '0', 10);
      const newOrders = r.data.filter(o => new Date(o.created_at).getTime() > lastSeen);
      setUnread(newOrders.length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleBellClick = () => {
    setOpen(o => !o);
    setUnread(0);
    localStorage.setItem('notif_last_seen', Date.now().toString());
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
        onClick={handleBellClick}
        className="relative w-11 h-11 flex items-center justify-center rounded-2xl transition-colors"
        style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textSub, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Bell size={19} />
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
            style={{ background: C.accent, boxShadow: `0 2px 8px ${C.accentGlow}` }}>
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 rounded-3xl overflow-hidden z-50"
            style={{ width: 360, background: C.card, boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: `1px solid ${C.borderLight}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h3 className="text-lg font-black" style={{ color: C.text }}>Notifications</h3>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
                {orders.length} recent
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell size={32} className="mx-auto mb-3" style={{ color: C.textMuted }} />
                <p className="text-base" style={{ color: C.textSub }}>No recent orders</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {orders.map((o, i) => {
                  const Icon = STATUS_ICON[o.status] || Clock;
                  const clr  = STATUS_CLR[o.status] || C.textMuted;
                  return (
                    <motion.button key={o.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => { navigate('/orders'); setOpen(false); }}
                      className="w-full flex items-start gap-4 px-6 py-4 transition-colors text-left"
                      style={{ borderTop: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${clr}18` }}>
                        <Icon size={17} style={{ color: clr }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold" style={{ color: C.text }}>
                          Order #{String(o.id).padStart(4,'0')}
                          <span className="ml-2 text-sm font-bold" style={{ color: clr }}>{o.status}</span>
                        </div>
                        <div className="text-sm mt-0.5 truncate" style={{ color: C.textMuted }}>{o.customer_name} · ${parseFloat(o.total||0).toFixed(2)}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="px-6 py-4" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => { navigate('/orders'); setOpen(false); }}
                className="w-full text-base font-bold flex items-center justify-center gap-2 transition-colors"
                style={{ color: C.accent }}>
                View all orders <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({ user, handleLogout, sections }) {
  return (
    <motion.aside initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-72 flex flex-col fixed h-full z-20"
      style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}>

      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(56,189,248,0.06), transparent)' }} />

      <div className="px-6 pt-7 pb-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(56,189,248,0.12)', border: `1px solid rgba(56,189,248,0.25)`, boxShadow: `0 0 20px rgba(56,189,248,0.2)` }}>
            <Package size={21} style={{ color: C.accent }} />
          </div>
          <div>
            <div className="font-black text-xl tracking-tight" style={{ color: S.text }}>Dinven</div>
            <div className="text-sm font-semibold" style={{ color: S.muted }}>
              {user.role === 'customer' ? 'Customer Portal' : 'Inventory Pro'}
            </div>
          </div>
        </div>
        <div className="mt-5 h-px" style={{ background: S.border }} />
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-5 pb-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs font-black uppercase tracking-[0.14em] px-4 mb-2.5" style={{ color: S.muted }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => <NavItem key={item.to} {...item} />)}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="h-px mb-4" style={{ background: S.border }} />
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: S.card, border: `1px solid ${S.border}` }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.purple})` }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate" style={{ color: S.text }}>{user.name}</div>
            <div className="text-sm font-semibold capitalize" style={{ color: C.accent }}>{user.role}</div>
          </div>
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
            style={{ background: 'rgba(244,114,182,0.15)', color: C.pink }}>
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}

function ProfileButton({ user, handleLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all"
        style={{
          background: open ? C.bg : C.card,
          border: `1.5px solid ${open ? C.accent : C.border}`,
          boxShadow: open ? `0 0 0 3px ${C.accentSoft}` : '0 1px 4px rgba(0,0,0,0.06)',
        }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.purple})` }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-black leading-none" style={{ color: C.text }}>{user.name.split(' ')[0]}</div>
          <div className="text-xs font-bold capitalize mt-0.5" style={{ color: C.accent }}>{user.role}</div>
        </div>
        <ChevronDown size={14} style={{ color: C.textMuted }} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 rounded-3xl overflow-hidden z-50"
            style={{ width: 240, background: C.card, boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: `1px solid ${C.borderLight}` }}>

            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base"
                  style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.purple})` }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-black" style={{ color: C.text }}>{user.name}</div>
                  <div className="text-sm font-semibold capitalize flex items-center gap-1.5" style={{ color: C.accent }}>
                    <Shield size={11} /> {user.role}
                  </div>
                </div>
              </div>
            </div>

            {user.email && (
              <div className="px-5 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: C.textMuted }}>Email</p>
                <p className="text-sm font-medium truncate" style={{ color: C.textSub }}>{user.email}</p>
              </div>
            )}

            <div className="p-3">
              <button onClick={() => { setOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-colors"
                style={{ color: C.pink, background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,114,182,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Topbar({ user, handleLogout }) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="sticky top-0 z-10 px-8 py-4 flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>

      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-black" style={{ color: C.text }}>
          {greeting}, {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm font-medium mt-0.5" style={{ color: C.textMuted }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <GlobalSearch />
      <NotificationBell />
      <ProfileButton user={user} handleLogout={handleLogout} />
    </motion.header>
  );
}

function AdminLayout({ user, handleLogout }) {
  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      <Sidebar user={user} handleLogout={handleLogout} sections={adminSections} />
      <main className="flex-1 ml-72">
        <Topbar user={user} handleLogout={handleLogout} />
        <Routes>
          <Route path="/"           element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/products"   element={<PageTransition><Products /></PageTransition>} />
          <Route path="/customers"  element={<PageTransition><Customers /></PageTransition>} />
          <Route path="/orders"     element={<PageTransition><Orders /></PageTransition>} />
          <Route path="/analytics"  element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="/exports"    element={<PageTransition><Exports /></PageTransition>} />
          <Route path="/settings"   element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="/help"       element={<PageTransition><HelpPage /></PageTransition>} />
        </Routes>
      </main>
    </div>
  );
}

function CustomerLayout({ user, handleLogout }) {
  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      <Sidebar user={user} handleLogout={handleLogout} sections={customerSections} />
      <main className="flex-1 ml-72">
        <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 8px rgba(15,23,42,0.06)' }}>
          <div>
            <h2 className="text-lg font-black" style={{ color: C.text }}>Customer Portal</h2>
            <p className="text-sm font-medium mt-0.5" style={{ color: C.textMuted }}>Track your orders in real-time</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: C.accentSoft, color: C.accent, border: `1px solid rgba(56,189,248,0.2)` }}>
            <ShoppingBag size={14} /> Customer
          </div>
        </motion.header>
        <Routes>
          <Route path="/my"        element={<PageTransition><CustomerDashboard user={user} /></PageTransition>} />
          <Route path="/my/orders" element={<PageTransition><CustomerOrders /></PageTransition>} />
          <Route path="*"          element={<PageTransition><CustomerDashboard user={user} /></PageTransition>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser]               = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin  = u => { setUser(u); setShowRegister(false); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  if (!user) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} onRegister={() => setShowRegister(true)} />;
  }

  return (
    <Router>
      {user.role === 'customer'
        ? <CustomerLayout user={user} handleLogout={handleLogout} />
        : <AdminLayout    user={user} handleLogout={handleLogout} />
      }
    </Router>
  );
}

export default App;
