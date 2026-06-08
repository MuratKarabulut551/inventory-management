import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Package, ShoppingCart, Users, BarChart2, Mail, BookOpen } from 'lucide-react';

const C = {
  bg:         '#F0F4F8',
  card:       '#FFFFFF',
  border:     '#E2E8F0',
  accent:     '#38BDF8',
  accentSoft: 'rgba(56,189,248,0.1)',
  purple:     '#818CF8',
  purpleSoft: 'rgba(129,140,248,0.1)',
  green:      '#34D399',
  greenSoft:  'rgba(52,211,153,0.1)',
  amber:      '#FBBF24',
  amberSoft:  'rgba(251,191,36,0.1)',
  text:       '#0F172A',
  textSub:    '#475569',
  textMuted:  '#94A3B8',
};

const faqs = [
  {
    category: 'Products',
    icon: Package,
    color: C.accent,
    soft: C.accentSoft,
    items: [
      { q: 'How do I add a new product?',           a: 'Go to Products page and click the "+ New Product" button in the top right. Fill in the name, description, price and quantity, then save.' },
      { q: 'What is Low Stock Alert?',              a: 'Low Stock Alert is the minimum quantity threshold. When stock drops to or below this number, the product will appear as low stock on the Dashboard.' },
      { q: 'Can I edit or delete a product?',       a: 'Yes. Click the edit (pencil) or delete (trash) icon on any product row. Deleting a product that has existing order items is not recommended.' },
      { q: 'How is stock updated automatically?',   a: 'When a new order is created and confirmed, the ordered quantity is automatically deducted from the product\'s stock level.' },
    ],
  },
  {
    category: 'Orders',
    icon: ShoppingCart,
    color: C.purple,
    soft: C.purpleSoft,
    items: [
      { q: 'How do I create a new order?',               a: 'Go to Orders page and click "+ New Order". Select a customer, add products and quantities. The total is calculated automatically.' },
      { q: 'What are the order statuses?',               a: 'Orders have three statuses: Preparing (being prepared), Shipped (dispatched), and Delivered (received by customer). You can update status at any time.' },
      { q: 'Can I add multiple products to one order?',  a: 'Yes. When creating or editing an order, click "+ Add Item" to include additional products with different quantities.' },
    ],
  },
  {
    category: 'Customers',
    icon: Users,
    color: C.green,
    soft: C.greenSoft,
    items: [
      { q: 'How do customers log in?',        a: 'Customers register at the login screen using the Customer tab. After registration they can track their own orders via the Customer Portal.' },
      { q: 'Can I add customers manually?',   a: 'Yes. Go to Customers page and click "+ New Customer". Admins can add customers directly without requiring self-registration.' },
      { q: 'What can customers see?',         a: 'Customers see only their own orders in the Customer Portal. They cannot access admin pages, inventory, or other customers\' data.' },
    ],
  },
  {
    category: 'Analytics & Exports',
    icon: BarChart2,
    color: C.amber,
    soft: C.amberSoft,
    items: [
      { q: 'What does the Analytics page show?',  a: 'Analytics shows monthly revenue trends, order status distribution, top products by price, and key KPIs like total revenue and average order value.' },
      { q: 'How do I export data?',               a: 'Go to Exports page and click the export button for Products, Customers, or Orders. A CSV file will download automatically, ready for Excel or Google Sheets.' },
      { q: 'Is exported data real-time?',         a: 'Yes. Exports fetch the latest data at the time of download, so they always reflect the current state of your database.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${C.border}` }}>
      <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
        onClick={() => setOpen(o => !o)}
        style={{ background: open ? C.bg : C.card }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#F8FAFC'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = C.card; }}>
        <span className="text-base font-bold pr-2" style={{ color: C.text }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} style={{ color: C.textMuted }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}>
            <div className="px-5 pb-4 pt-1" style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
              <p className="text-base font-medium leading-relaxed" style={{ color: C.textSub }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Help() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle size={14} style={{ color: C.accent }} />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: C.accent }}>ACCOUNT</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: C.text }}>Help Center</h1>
        <p className="text-base font-medium mt-1.5" style={{ color: C.textSub }}>Find answers and learn how to use Dinven</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Documentation', sub: 'Full feature guide', color: C.accent, soft: C.accentSoft, href: null },
          { icon: Mail,     label: 'Email Support', sub: 'info@aluarc.com',    color: C.green,  soft: C.greenSoft,  href: 'mailto:info@aluarc.com' },
        ].map(({ icon: Icon, label, sub, color, soft, href }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
            className={`rounded-3xl p-5 ${href ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => href && window.open(href)}
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: soft }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="font-black text-base" style={{ color: C.text }}>{label}</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: C.textMuted }}>{sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="space-y-6">
        {faqs.map(({ category, icon: Icon, color, soft, items }, i) => (
          <motion.div key={category}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>

            <div className="px-7 py-5 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: soft }}>
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-lg font-black" style={{ color: C.text }}>{category}</h3>
            </div>

            <div className="p-5 space-y-2">
              {items.map((item, j) => (
                <motion.div key={j} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 + j * 0.04 }}>
                  <FAQItem {...item} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
