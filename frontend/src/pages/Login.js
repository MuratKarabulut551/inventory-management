import React, { useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Package, AlertCircle,
  ShieldCheck, ShoppingBag, BarChart2, Users, TrendingUp,
} from 'lucide-react';

const C = {
  bg:         '#F0F4F8',
  sidebar:    '#0F172A',
  card:       '#FFFFFF',
  cardHover:  '#F8FAFC',
  border:     '#E2E8F0',
  borderLight:'#CBD5E1',
  accent:     '#38BDF8',
  accentSoft: 'rgba(56,189,248,0.1)',
  accentGlow: 'rgba(56,189,248,0.25)',
  purple:     '#818CF8',
  purpleSoft: 'rgba(129,140,248,0.1)',
  pink:       '#F472B6',
  sideText:   '#E2E8F0',
  sideTextSub:'#94A3B8',
  sideTextMuted: '#4B5563',
  text:       '#0F172A',
  textSub:    '#475569',
  textMuted:  '#94A3B8',
};

const features = [
  { icon: BarChart2,  label: 'Live Analytics'  },
  { icon: Users,      label: 'CRM Ready'       },
  { icon: TrendingUp, label: 'Smart Reports'   },
];

function LoginForm({ role, icon: Icon, title, subtitle, accentColor, onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      const user = res.data.user;
      const isAdmin    = user.role === 'admin' || user.role === 'employee';
      const isCustomer = user.role === 'customer';
      if (role === 'staff'    && !isAdmin)    { setError('This login is for staff only.');     setLoading(false); return; }
      if (role === 'customer' && !isCustomer) { setError('This login is for customers only.'); setLoading(false); return; }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(user));
      onLogin(user);
    } catch {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: role === 'staff' ? C.accentSoft : C.purpleSoft,
                   border: `1px solid ${role === 'staff' ? 'rgba(56,189,248,0.3)' : 'rgba(129,140,248,0.3)'}` }}>
          <Icon size={18} style={{ color: role === 'staff' ? C.accent : C.purple }} />
        </div>
        <div>
          <div className="text-base font-black" style={{ color: C.text }}>{title}</div>
          <div className="text-sm" style={{ color: C.textMuted }}>{subtitle}</div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3.5 rounded-2xl mb-5 text-sm font-medium overflow-hidden"
            style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6', border: '1px solid rgba(244,114,182,0.25)' }}>
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-base font-medium focus:outline-none transition-all"
              style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e  => e.target.style.borderColor = C.border}
              placeholder="your@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-base font-medium focus:outline-none transition-all"
              style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e  => e.target.style.borderColor = C.border}
              placeholder="••••••••" />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-black mt-2 disabled:opacity-60"
          style={{
            background: role === 'staff' ? C.accent : C.purple,
            color: '#0E1B2E',
            boxShadow: role === 'staff' ? `0 4px 20px ${C.accentGlow}` : '0 4px 20px rgba(129,140,248,0.3)',
          }}>
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <> Sign In <ArrowRight size={16} /></>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default function Login({ onLogin, onRegister }) {
  const [tab, setTab] = useState('staff');

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>

      {/* ─── LEFT — Branding ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 relative overflow-hidden"
        style={{ background: C.sidebar, borderRight: `1px solid ${C.border}` }}>

        {/* Glow effects */}
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.accentGlow}, transparent)`, filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.2), transparent)', filter: 'blur(50px)' }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.3)`, boxShadow: `0 0 24px ${C.accentGlow}` }}>
            <Package size={22} style={{ color: C.accent }} />
          </div>
          <span className="text-2xl font-black" style={{ color: C.sideText }}>Dinven</span>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="relative z-10">
          <h2 className="text-5xl font-black leading-tight tracking-tight" style={{ color: C.sideText }}>
            Manage your<br />
            <span style={{ color: C.accent }}>inventory</span><br />
            with ease.
          </h2>
          <p className="text-base font-medium mt-4 max-w-xs" style={{ color: C.sideTextSub }}>
            Real-time tracking, smart analytics, and seamless order management — all in one place.
          </p>
          <div className="flex gap-5 mt-8">
            {[
              { label: 'Products', value: '∞' },
              { label: 'Orders',   value: '24/7' },
              { label: 'Reports',  value: 'Live' },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)` }}>
                <div className="text-xl font-black" style={{ color: C.accent }}>{value}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color: C.sideTextMuted }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {features.map(({ icon: Icon, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)` }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.15)' }}>
                <Icon size={13} style={{ color: C.accent }} />
              </div>
              <span className="text-sm font-bold" style={{ color: C.sideTextSub }}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT — Login form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.3)` }}>
            <Package size={20} style={{ color: C.accent }} />
          </div>
          <span className="text-2xl font-black" style={{ color: C.text }}>Dinven</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }} className="w-full max-w-md">
          <div className="rounded-3xl p-8"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 8px 40px rgba(15,23,42,0.1)' }}>
            <div className="mb-7">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: C.text }}>Welcome back</h1>
              <p className="text-base mt-1.5" style={{ color: C.textMuted }}>Sign in to your Dinven account</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1.5 rounded-2xl mb-7"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              {[
                { key: 'staff',    label: 'Staff',    icon: ShieldCheck  },
                { key: 'customer', label: 'Customer', icon: ShoppingBag },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all"
                  style={{
                    background: tab === key ? C.card : 'transparent',
                    color: tab === key ? C.text : C.textMuted,
                    border: tab === key ? `1px solid ${C.borderLight}` : '1px solid transparent',
                    boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'staff' ? (
                <LoginForm key="staff" role="staff" icon={ShieldCheck}
                  title="Staff Login" subtitle="For admins & employees"
                  accentColor={C.accent} onLogin={onLogin} />
              ) : (
                <LoginForm key="customer" role="customer" icon={ShoppingBag}
                  title="Customer Login" subtitle="Track your orders"
                  accentColor={C.purple} onLogin={onLogin} />
              )}
            </AnimatePresence>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center mt-5 text-sm font-medium" style={{ color: C.textMuted }}>
            New customer?{' '}
            <button onClick={onRegister}
              className="font-black transition-colors" style={{ color: C.accent }}
              onMouseEnter={e => e.target.style.color = '#7DD3FC'}
              onMouseLeave={e => e.target.style.color = C.accent}>
              Create an account
            </button>
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center mt-3 text-xs" style={{ color: C.textMuted }}>
            Dinven Inventory Pro &copy; {new Date().getFullYear()}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
