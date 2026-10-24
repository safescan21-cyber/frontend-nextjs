'use client';
// "Instant quotation" on machine pages with a listed price: the visitor picks a quantity,
// sees the total with GST at once, and after name + phone gets a formal quotation PDF
// (same as the admin's quotation builder). Backend: /api/bulk-quotes/instant, which takes
// the price from the database and emails the business.
//   <InstantQuote product={product} />
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Download, FileText, Loader2, Minus, Plus, X } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { whatsappLink } from '../../utlis/contact';
import { useLocale } from '../../i18n/LocaleContext';
import { getLeadOrigin } from '../../utlis/leadOrigin';
import { gaEvent } from '../../utlis/analytics';

const GST = 18; // % – same as Backend/src/quotes/bulkQuoteRoutes.js (INSTANT_GST)
const DEMO_IMAGE = /\/demo-products\//;
const rs = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

// Only machines with a real listed price (demo products are not for sale)
export const canQuoteInstantly = (p) => Number(p?.price) > 0 && !(p?.images || []).some((i) => DEMO_IMAGE.test(i));

export default function InstantQuote({ product }) {
  const { t } = useLocale();
  const user = useSelector((s) => s.auth?.user);
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', company: '', email: '', city: '', gstin: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.username || '', email: f.email || user.email || '' }));
  }, [user]);
  // "Instant quotation" link on the shop cards opens it here (#instant-quote)
  useEffect(() => {
    if (window.location.hash !== '#instant-quote') return;
    setOpen(true);
    setTimeout(() => document.getElementById('instant-quote')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  }, []);

  if (!canQuoteInstantly(product)) return null;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const subtotal = Number(product.price) * qty;
  const gst = Math.round(subtotal * GST) / 100;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) return setError(t('Please enter your name and a valid phone number.'));
    setSending(true);
    try {
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes/instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        credentials: 'include',
        body: JSON.stringify({ ...form, productId: product._id, quantity: qty, origin: getLeadOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t('Could not make the quotation. Please try WhatsApp.'));
      setDone(data);
      gaEvent('generate_lead', { form: 'instant_quote', machine: String(product.name).slice(0, 100), value: data.quotation?.total, currency: 'INR' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        id="instant-quote"
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <FileText className="h-4 w-4" aria-hidden="true" /> {t('Instant quotation (PDF)')}
      </button>
    );
  }

  if (done) {
    const message = `Hello Food Pharma Machinery, I received quotation ${done.quotation.number} for ${qty} x ${product.name} (total ${rs(done.quotation.total)}). I would like to proceed. Name: ${form.name}, phone ${form.phone}.`;
    return (
      <div id="instant-quote" className="w-full rounded-2xl border border-green-200 bg-green-50 p-5" role="status">
        <p className="flex items-center gap-2 font-bold text-green-800">
          <CheckCircle className="h-5 w-5" aria-hidden="true" /> {t('Your quotation is ready')} · {done.quotation.number}
        </p>
        <p className="mt-1 text-sm text-green-900">
          {qty} × {product.name}: <strong>{rs(done.quotation.total)}</strong> {t('incl. {gst}% GST, valid {days} days.', { gst: done.quotation.gstPercent, days: done.quotation.validityDays })}
          {done.emailed && <> {t('A copy was emailed to {email}.', { email: form.email })}</>}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={done.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Download className="h-4 w-4" aria-hidden="true" /> {t('Open the quotation (PDF)')}
          </a>
          <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            {t('Proceed on WhatsApp')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form id="instant-quote" onSubmit={submit} className="w-full scroll-mt-32 rounded-2xl border border-blue-200 bg-blue-50/60 p-5" aria-labelledby="instant-quote-title">
      <div className="flex items-start justify-between gap-2">
        <h2 id="instant-quote-title" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" /> {t('Instant quotation')}
        </h2>
        <button type="button" onClick={() => setOpen(false)} aria-label={t('Close')} className="text-slate-500 hover:text-slate-800"><X className="h-5 w-5" /></button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-slate-700">{t('Quantity')}</span>
        <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t('Fewer')} className="p-2 text-slate-600 hover:text-slate-900"><Minus className="h-4 w-4" /></button>
          <input type="number" min="1" max="50" value={qty} onChange={(e) => setQty(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))} aria-label={t('Quantity')} className="w-14 border-x border-slate-300 py-1.5 text-center text-sm" />
          <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))} aria-label={t('More')} className="p-2 text-slate-600 hover:text-slate-900"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-white p-3 text-sm">
        <dt className="text-slate-600">{qty} × {rs(product.price)}</dt><dd className="text-right">{rs(subtotal)}</dd>
        <dt className="text-slate-600">{t('GST')} {GST}%</dt><dd className="text-right">{rs(gst)}</dd>
        <dt className="font-bold text-slate-900">{t('Total')}</dt><dd className="text-right font-bold text-slate-900">{rs(subtotal + gst)}</dd>
      </dl>
      <p className="mt-1 text-xs text-slate-500">{t('Ex-works price. Freight, installation and commissioning are quoted separately.')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">{t('Your name')}<span className="text-red-500"> *</span>
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t('Phone / WhatsApp')}<span className="text-red-500"> *</span>
          <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} required type="tel" maxLength={30} autoComplete="tel" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t('Company')}
          <input value={form.company} onChange={(e) => set({ company: e.target.value })} maxLength={150} autoComplete="organization" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t('Email (to get the PDF)')}
          <input value={form.email} onChange={(e) => set({ email: e.target.value })} type="email" maxLength={150} autoComplete="email" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t('City')}
          <input value={form.city} onChange={(e) => set({ city: e.target.value })} maxLength={100} autoComplete="address-level2" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">{t('GSTIN (optional)')}
          <input value={form.gstin} onChange={(e) => set({ gstin: e.target.value.toUpperCase() })} maxLength={15} className={field} />
        </label>
        <input type="text" name="website" value={form.website} onChange={(e) => set({ website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={sending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('Get my quotation now')}
      </button>
    </form>
  );
}
