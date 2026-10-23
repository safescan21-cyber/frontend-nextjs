'use client';
import { formTool } from '../webmcp/webmcpTools';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from '../../shell/router';
import { useSelector } from 'react-redux';
import { Plus, Trash2, ShoppingCart, CheckCircle, Loader2, FileText, MessageCircle, Clock, BadgePercent, Truck } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { getLeadOrigin } from '../../utlis/leadOrigin';
import { selectCartItems } from '../store/cartSlice';
import Seo from '../Seo';
import { seoPages } from './seoPages';

const emptyItem = () => ({ productId: '', name: '', quantity: 1, notes: '' });
const input = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100';

const Field = ({ label, required, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

const BulkQuote = () => {
  const [params] = useSearchParams();
  const user = useSelector((s) => s.auth?.user);
  const cartItems = useSelector(selectCartItems) || [];

  const initialProduct = params.get('product');
  const [items, setItems] = useState(() =>
    initialProduct ? [{ ...emptyItem(), name: initialProduct.slice(0, 200), productId: params.get('id') || '', quantity: 10 }] : [emptyItem()]
  );
  // The saved login is read just after the page loads: fill in name and email then
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.username || '', email: f.email || user.email || '' }));
  }, [user]);
  const [form, setForm] = useState({
    name: user?.username || '',
    company: '',
    email: user?.email || '',
    phone: '',
    gstin: '',
    deliveryCity: '',
    deliveryState: '',
    requiredBy: '',
    message: '',
    website: '', // honeypot, hidden from people
  });
  const [errors, setErrors] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const source = params.get('source') || (initialProduct ? 'product' : 'navbar');
  const minDate = useMemo(() => new Date(Date.now() + 864e5).toISOString().slice(0, 10), []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setItem = (i, k) => (e) => setItems((list) => list.map((it, j) => (j === i ? { ...it, [k]: e.target.value } : it)));

  const addFromCart = () => {
    const fromCart = cartItems.map((c) => ({ productId: c._id, name: c.name, quantity: Math.max(1, c.quantity || 1), notes: '' }));
    setItems((list) => {
      const kept = list.filter((it) => it.name.trim());
      const names = new Set(kept.map((k) => k.name));
      return [...kept, ...fromCart.filter((c) => !names.has(c.name))].slice(0, 50);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors('');
    const filled = items.filter((it) => it.name.trim());
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return setErrors('Please enter your name, email and phone number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setErrors('Please enter a valid email address.');
    if (!filled.length) return setErrors('Add at least one product.');
    if (filled.some((it) => !(Number(it.quantity) >= 1))) return setErrors('Each product needs a quantity of at least 1.');

    setSending(true);
    try {
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...form, items: filled.map((it) => ({ ...it, quantity: Number(it.quantity) })), source, origin: getLeadOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send your request. Please try again.');
      setDone({ quoteNumber: data.quoteNumber, email: form.email.trim() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo {...seoPages.bulkQuote} />
      <div className="min-h-screen bg-gray-50 px-4 pb-28 pt-6">
        <div className="mx-auto max-w-5xl">
          {done ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-white p-6 text-center md:p-10" role="status">
              <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
              <h1 className="mt-3 text-2xl font-bold text-slate-800">Request sent!</h1>
              <p className="mt-2 text-slate-600">Your quote number is</p>
              <p className="mt-1 font-mono text-2xl font-bold text-amber-600">{done.quoteNumber}</p>
              <p className="mt-3 text-slate-600">
                We've emailed a copy to <strong>{done.email}</strong>. Our team will send pricing and availability, usually within 1 business day.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/shop" className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-400">Continue browsing</Link>
                <a
                  href={`https://wa.me/918700792607?text=${encodeURIComponent(`Hello, about my bulk quote ${done.quoteNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" /> Follow up on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">Bulk order & quote request</h1>
              <p className="mt-2 max-w-3xl text-slate-600">
                Buying several machines, spares or larger quantities? Tell us what you need and we'll send a custom quote with volume pricing.
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-1.5"><BadgePercent className="h-4 w-4 text-amber-500" /> Volume pricing</li>
                <li className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" /> Reply within 1 business day</li>
                <li className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-amber-500" /> Delivery across India</li>
              </ul>

              <form {...formTool('bulkQuote')} onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <section className="rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="items-h">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h2 id="items-h" className="text-lg font-bold text-slate-800">Products & quantities</h2>
                      {cartItems.length > 0 && (
                        <button type="button" onClick={addFromCart} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50">
                          <ShoppingCart className="h-4 w-4" /> Add {cartItems.length} item{cartItems.length === 1 ? '' : 's'} from my cart
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {items.map((it, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 rounded-xl bg-gray-50 p-3">
                          <div className="col-span-12 sm:col-span-6">
                            <label className="sr-only" htmlFor={`item-name-${i}`}>Product {i + 1}</label>
                            <input id={`item-name-${i}`} className={input} placeholder="Product / machine name or model" name={`item${i + 1}_name`} toolparamdescription={`Product ${i + 1}: machine or product name or model`} value={it.name} onChange={setItem(i, 'name')} maxLength={200} />
                          </div>
                          <div className="col-span-4 sm:col-span-2">
                            <label className="sr-only" htmlFor={`item-qty-${i}`}>Quantity</label>
                            <input id={`item-qty-${i}`} className={input} type="number" min="1" inputMode="numeric" placeholder="Qty" name={`item${i + 1}_quantity`} toolparamdescription={`Product ${i + 1}: quantity`} value={it.quantity} onChange={setItem(i, 'quantity')} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label className="sr-only" htmlFor={`item-notes-${i}`}>Notes</label>
                            <input id={`item-notes-${i}`} className={input} placeholder="Notes (optional)" name={`item${i + 1}_notes`} toolparamdescription={`Product ${i + 1}: notes, e.g. capacity or model (optional)`} value={it.notes} onChange={setItem(i, 'notes')} maxLength={500} />
                          </div>
                          <div className="col-span-2 flex items-center justify-end sm:col-span-1">
                            <button
                              type="button"
                              onClick={() => setItems((list) => (list.length > 1 ? list.filter((_, j) => j !== i) : [emptyItem()]))}
                              aria-label={`Remove product ${i + 1}`}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {items.length < 50 && (
                      <button type="button" onClick={() => setItems((l) => [...l, emptyItem()])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline">
                        <Plus className="h-4 w-4" /> Add another product
                      </button>
                    )}
                  </section>

                  <section className="rounded-2xl border border-gray-200 bg-white p-5" aria-labelledby="delivery-h">
                    <h2 id="delivery-h" className="mb-4 text-lg font-bold text-slate-800">Delivery & timeline</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="City"><input className={input} name="deliveryCity" value={form.deliveryCity} onChange={set('deliveryCity')} maxLength={100} /></Field>
                      <Field label="State"><input className={input} name="deliveryState" value={form.deliveryState} onChange={set('deliveryState')} maxLength={100} /></Field>
                      <Field label="Needed by"><input type="date" min={minDate} className={input} name="requiredBy" value={form.requiredBy} onChange={set('requiredBy')} /></Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Anything else we should know?" hint="Specifications, voltage, materials, installation needs…">
                        <textarea rows={4} className={input} name="message" value={form.message} onChange={set('message')} maxLength={3000} />
                      </Field>
                    </div>
                  </section>
                </div>

                <aside className="lg:col-span-1">
                  <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-28" aria-labelledby="contact-h">
                    <h2 id="contact-h" className="text-lg font-bold text-slate-800">Your details</h2>
                    <Field label="Full name" required><input className={input} name="name" required value={form.name} onChange={set('name')} autoComplete="name" maxLength={100} /></Field>
                    <Field label="Company"><input className={input} name="company" value={form.company} onChange={set('company')} autoComplete="organization" maxLength={150} /></Field>
                    <Field label="Email" required><input type="email" className={input} name="email" required value={form.email} onChange={set('email')} autoComplete="email" maxLength={150} /></Field>
                    <Field label="Phone / WhatsApp" required><input type="tel" className={input} name="phone" required value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={30} /></Field>
                    <Field label="GSTIN" hint="For a GST invoice (optional)"><input className={`${input} uppercase`} name="gstin" value={form.gstin} onChange={set('gstin')} maxLength={20} /></Field>
                    {/* Honeypot: hidden from people, bots fill it in */}
                    <input type="text" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                    {errors && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors}</p>}
                    <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-60">
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                      {sending ? 'Sending…' : 'Get my quote'}
                    </button>
                    <p className="text-center text-xs text-slate-500">No payment needed. We'll reply by email or phone.</p>
                  </section>
                </aside>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BulkQuote;
