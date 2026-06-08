import React, { useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, Package, AlertCircle, CheckCircle } from 'lucide-react';

const C = {
  bg:          '#F0F4F8',
  sidebar:     '#0F172A',
  card:        '#FFFFFF',
  border:      '#E2E8F0',
  borderLight: '#CBD5E1',
  accent:      '#38BDF8',
  accentSoft:  'rgba(56,189,248,0.1)',
  accentGlow:  'rgba(56,189,248,0.25)',
  purple:      '#818CF8',
  green:       '#34D399',
  sideText:    '#E2E8F0',
  sideTextSub: '#94A3B8',
  sideTextMuted: '#4B5563',
  text:        '#0F172A',
  textSub:     '#475569',
  textMuted:   '#94A3B8',
};

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register-customer', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-12 text-center max-w-md w-full"
          style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 8px 40px rgba(15,23,42,0.1)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.4)', boxShadow: '0 0 32px rgba(52,211,153,0.2)' }}>
            <CheckCircle size={36} style={{ color: C.green }} />
          </motion.div>
          <h2 className="text-3xl font-black mb-2" style={{ color: C.text }}>Account Created!</h2>
          <p className="text-base mb-8" style={{ color: C.textSub }}>
            Your account has been successfully created. You can now sign in.
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onSwitch}
            className="w-full py-4 rounded-2xl font-black text-base"
            style={{ background: C.accent, color: '#0E1B2E', boxShadow: `0 4px 20px ${C.accentGlow}` }}>
            Sign In Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: C.bg }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: C.sidebar, borderRight: `1px solid ${C.border}` }}>
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.accentGlow}, transparent)`, filter: 'blur(60px)' }} />
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentSoft, border: `1px solid rgba(56,189,248,0.3)` }}>
            <Package size={22} style={{ color: C.accent }} />
          </div>
          <span className="text-2xl font-black" style={{ color: C.sideText }}>Dinven</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="relative z-10">
          <h2 className="text-5xl font-black leading-tight tracking-tight" style={{ color: C.sideText }}>
            Join<br /><span style={{ color: C.accent }}>Dinven</span><br />today.
          </h2>
          <p className="text-base font-medium mt-4 max-w-xs" style={{ color: C.sideTextSub }}>
            Create your customer account to track orders and manage your purchases in real time.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl relative z-10"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)' }}>
            <Package size={14} style={{ color: C.accent }} />
          </div>
          <div>
            <div className="text-sm font-black" style={{ color: C.sideText }}>Free to Join</div>
            <div className="text-xs" style={{ color: C.sideTextMuted }}>No credit card required</div>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: C.accentSoft }}>
            <Package size={20} style={{ color: C.accent }} />
          </div>
          <span className="text-2xl font-black" style={{ color: C.text }}>Dinven</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }} className="w-full max-w-md">
          <div className="rounded-3xl p-8"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 8px 40px rgba(15,23,42,0.1)' }}>
            <div className="mb-7">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: C.text }}>Create account</h1>
              <p className="text-base mt-1.5" style={{ color: C.textMuted }}>Register to track your orders</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-4 rounded-2xl mb-5 text-sm font-medium"
                  style={{ background: 'rgba(244,114,182,0.12)', color: '#F472B6', border: '1px solid rgba(244,114,182,0.25)' }}>
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name',     type: 'text',     icon: User,   required: true  },
                { label: 'Email',     key: 'email',    type: 'email',    icon: Mail,   required: true  },
                { label: 'Password (min 8 chars)',  key: 'password', type: 'password', icon: Lock,   required: true  },
                { label: 'Phone',     key: 'phone',    type: 'text',     icon: Phone,  required: false },
                { label: 'Address',   key: 'address',  type: 'text',     icon: MapPin, required: false },
              ].map(({ label, key, type, icon: Icon, required }) => (
                <div key={key}>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>{label}</label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.textMuted }} />
                    <input type={type} required={required} value={form[key]}
                      minLength={key === 'password' ? 8 : undefined}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-base font-medium focus:outline-none transition-all"
                      style={{ border: `1px solid ${C.border}`, color: C.text, background: C.bg }}
                      onFocus={e => e.target.style.borderColor = C.accent}
                      onBlur={e  => e.target.style.borderColor = C.border}
                      placeholder={label} />
                  </div>
                </div>
              ))}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base mt-2 disabled:opacity-60"
                style={{ background: C.purple, color: '#0E1B2E', boxShadow: '0 4px 20px rgba(129,140,248,0.3)' }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <> Create Account <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-sm font-medium" style={{ color: C.textMuted }}>
                Already have an account?{' '}
                <button onClick={onSwitch} className="font-black transition-colors" style={{ color: C.accent }}
                  onMouseEnter={e => e.target.style.color = '#7DD3FC'}
                  onMouseLeave={e => e.target.style.color = C.accent}>
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
