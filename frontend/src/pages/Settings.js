import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Building2, Bell, Shield, Check } from 'lucide-react';

const C = {
  bg:         '#F0F4F8',
  card:       '#FFFFFF',
  border:     '#E2E8F0',
  borderLight:'#CBD5E1',
  accent:     '#38BDF8',
  accentSoft: 'rgba(56,189,248,0.1)',
  purple:     '#818CF8',
  purpleSoft: 'rgba(129,140,248,0.1)',
  amber:      '#FBBF24',
  amberSoft:  'rgba(251,191,36,0.1)',
  green:      '#34D399',
  greenSoft:  'rgba(52,211,153,0.1)',
  text:       '#0F172A',
  textSub:    '#475569',
  textMuted:  '#94A3B8',
};

function Toggle({ checked, onChange, color = C.accent }) {
  return (
    <motion.button onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full flex-shrink-0 transition-colors"
      style={{ background: checked ? color : C.border }}>
      <motion.div animate={{ x: checked ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
    </motion.button>
  );
}

function SaveToast({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1   }}
          exit={  { opacity: 0, y: 40, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 rounded-2xl z-50"
          style={{ background: C.green, color: '#fff', boxShadow: '0 8px 32px rgba(52,211,153,0.4)' }}>
          <Check size={18} strokeWidth={3} />
          <span className="font-black text-sm">Settings saved!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const STORAGE_KEY = 'dinven_settings';

const defaults = {
  company: {
    name:     'AluArc - Gurkan Building Elements',
    email:    'info@aluarc.com',
    phone:    '+90 212 000 00 00',
    address:  'Istanbul, Turkey',
    currency: 'USD',
    language: 'en',
  },
  notif: {
    lowStock:      true,
    newOrder:      true,
    orderDelivered:false,
    dailySummary:  false,
  },
  sec: {
    twoFactor:  false,
    sessionLog: true,
  },
};

export default function Settings() {
  const [saved,   setSaved]   = useState(false);
  const [company, setCompany] = useState(defaults.company);
  const [notif,   setNotif]   = useState(defaults.notif);
  const [sec,     setSec]     = useState(defaults.sec);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored) {
        if (stored.company) setCompany(stored.company);
        if (stored.notif)   setNotif(stored.notif);
        if (stored.sec)     setSec(stored.sec);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ company, notif, sec }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      icon: Building2, label: 'Company', color: C.accent, soft: C.accentSoft,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Company Name', key: 'name',     type: 'text'  },
            { label: 'Email',        key: 'email',    type: 'email' },
            { label: 'Phone',        key: 'phone',    type: 'text'  },
            { label: 'Address',      key: 'address',  type: 'text'  },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>{label}</label>
              <input type={type} value={company[key]}
                onChange={e => setCompany({ ...company, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e  => e.target.style.borderColor = C.border} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>Currency</label>
            <select value={company.currency} onChange={e => setCompany({ ...company, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
              style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
              <option value="TRY">₺ Turkish Lira (TRY)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.textSub }}>Language</label>
            <select value={company.language} onChange={e => setCompany({ ...company, language: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
              style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
              <option value="en">🇬🇧 English</option>
              <option value="tr">🇹🇷 Turkish</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      icon: Bell, label: 'Notifications', color: C.purple, soft: C.purpleSoft,
      content: (
        <div className="space-y-4">
          {[
            { key: 'lowStock',       label: 'Low Stock Alerts',      sub: 'Notify when products fall below threshold' },
            { key: 'newOrder',       label: 'New Order Alerts',       sub: 'Notify when a new order is placed'        },
            { key: 'orderDelivered', label: 'Order Delivered',        sub: 'Notify when an order is marked delivered' },
            { key: 'dailySummary',   label: 'Daily Summary Email',    sub: 'Receive a daily performance digest'       },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3.5 px-5 rounded-2xl"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <div>
                <div className="text-base font-bold" style={{ color: C.text }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: C.textMuted }}>{sub}</div>
              </div>
              <Toggle checked={notif[key]} onChange={v => setNotif({ ...notif, [key]: v })} color={C.purple} />
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Shield, label: 'Security', color: C.amber, soft: C.amberSoft,
      content: (
        <div className="space-y-4">
          {[
            { key: 'twoFactor',  label: 'Two-Factor Authentication', sub: 'Extra security layer for your account'  },
            { key: 'sessionLog', label: 'Session Activity Log',       sub: 'Track all login sessions and activity' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3.5 px-5 rounded-2xl"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <div>
                <div className="text-base font-bold" style={{ color: C.text }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: C.textMuted }}>{sub}</div>
              </div>
              <Toggle checked={sec[key]} onChange={v => setSec({ ...sec, [key]: v })} color={C.amber} />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SaveToast show={saved} />

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>ACCOUNT</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Settings</h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Manage your application preferences</p>
      </motion.div>

      <div className="space-y-5">
        {sections.map(({ icon: Icon, label, color, soft, content }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>

            <div className="px-7 py-5 flex items-center gap-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: soft }}>
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-lg font-black" style={{ color: C.text }}>{label}</h3>
            </div>

            <div className="p-7">{content}</div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full py-4 rounded-3xl font-black text-base flex items-center justify-center gap-2"
          style={{ background: C.accent, color: '#0F172A', boxShadow: `0 4px 24px rgba(56,189,248,0.3)` }}>
          <Check size={18} strokeWidth={3} />
          Save Settings
        </motion.button>
      </div>
    </div>
  );
}
