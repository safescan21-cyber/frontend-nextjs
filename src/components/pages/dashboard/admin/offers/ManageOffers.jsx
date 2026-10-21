import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import { OfferCard } from '../../../../offers/OfferBanner';
import { OFFER_THEMES } from '../../../../offers/offerThemes';

const request = async (path = '', options = {}) => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  const res = await fetch(`${getBaseURL()}/api/offers${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

// <input type="datetime-local"> wants local time without seconds
const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EMPTY = {
  title: '',
  subtitle: '',
  discountText: '',
  code: '',
  ctaText: 'Shop now',
  ctaLink: '/shop',
  theme: 'orange',
  startsAt: toLocalInput(new Date()),
  endsAt: toLocalInput(new Date(Date.now() + 7 * 864e5)),
  isActive: true,
  priority: 0,
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
};

const statusOf = (o) => {
  const now = Date.now();
  if (!o.isActive) return ['Off', 'bg-gray-100 text-gray-600'];
  if (o.startsAt && new Date(o.startsAt).getTime() > now) return ['Scheduled', 'bg-blue-100 text-blue-700'];
  if (o.endsAt && new Date(o.endsAt).getTime() <= now) return ['Ended', 'bg-amber-100 text-amber-700'];
  return ['Live on home page', 'bg-green-100 text-green-700'];
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
  </label>
);

const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

const ManageOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = list view
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let alive = true;
    request()
      .then((d) => alive && setOffers(d.offers || []))
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [reloadKey]);
  const load = () => setReloadKey((k) => k + 1);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const startNew = () => { setEditingId(null); setForm({ ...EMPTY }); };
  const startEdit = (o) => {
    setEditingId(o._id);
    setForm({
      ...EMPTY, ...o,
      discountType: o.discountType || '',
      discountValue: o.discountValue || '',
      minOrderAmount: o.minOrderAmount || '',
      maxDiscount: o.maxDiscount || '',
      startsAt: toLocalInput(o.startsAt),
      endsAt: toLocalInput(o.endsAt),
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please add a title');
    if (form.discountType && !form.code.trim()) {
      return toast.error('Add a coupon code so customers can use the discount at checkout, or choose "Banner only"');
    }
    if (form.discountType && !(Number(form.discountValue) > 0)) return toast.error('Enter the discount amount');
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) return toast.error('A percentage discount cannot be more than 100%');
        if (form.endsAt && form.startsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
      return toast.error('End date must be after the start date');
    }
    setSaving(true);
    const body = JSON.stringify({
      ...form,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      priority: Number(form.priority) || 0,
      discountValue: Number(form.discountValue) || 0,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      // Fill the big banner text from the discount if left empty
      discountText: form.discountText || (form.discountType && Number(form.discountValue) > 0
        ? (form.discountType === 'percent' ? `${Number(form.discountValue)}% OFF` : `₹${Number(form.discountValue).toLocaleString('en-IN')} OFF`)
        : ''),
    });
    try {
      await request(editingId ? `/${editingId}` : '', { method: editingId ? 'PUT' : 'POST', body });
      toast.success(editingId ? 'Offer updated' : 'Offer created');
      setForm(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (o) => {
    try {
      await request(`/${o._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !o.isActive }) });
      toast.success(o.isActive ? 'Offer turned off' : 'Offer turned on');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete the offer "${o.title}"? This can't be undone.`)) return;
    try {
      await request(`/${o._id}`, { method: 'DELETE' });
      toast.success('Offer deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (form) {
    return (
      <div className="px-4 pb-6 pt-6 md:px-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">{editingId ? 'Edit offer' : 'New offer'}</h1>
        <p className="mb-5 text-sm text-gray-500">The preview updates as you type.</p>

        <div className="mb-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-500"><Eye className="h-4 w-4" /> Preview</p>
          <OfferCard offer={form} preview />
        </div>

        <form onSubmit={save} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-2">
          <Field label="Title *" hint='e.g. "Diwali Mega Sale"'>
            <input className={input} value={form.title} onChange={set('title')} maxLength={80} required />
          </Field>
          <Field label="Big discount text" hint='e.g. "25% OFF" or "₹5,000 OFF"'>
            <input className={input} value={form.discountText} onChange={set('discountText')} maxLength={20} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Subtitle" hint="One short line about the offer">
              <input className={input} value={form.subtitle} onChange={set('subtitle')} maxLength={200} />
            </Field>
          </div>
          <Field label="Coupon code (optional)" hint="Shown with a copy button. Customers mention it when ordering.">
            <input className={`${input} uppercase`} value={form.code} onChange={set('code')} maxLength={30} />
          </Field>
          <Field label="Colour">
            <div className="flex flex-wrap gap-2">
              {Object.entries(OFFER_THEMES).map(([k, cls]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, theme: k }))}
                  aria-label={k}
                  aria-pressed={form.theme === k}
                  className={`h-9 w-9 rounded-full bg-gradient-to-r ${cls} ring-offset-2 ${form.theme === k ? 'ring-2 ring-blue-600' : ''}`}
                />
              ))}
            </div>
          </Field>
          <fieldset className="rounded-lg border border-gray-200 p-4 md:col-span-2">
            <legend className="px-1 text-sm font-semibold text-gray-800">Checkout discount</legend>
            <div className="mb-3 inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm">
              {[
                ['percent', '% off'],
                ['flat', '₹ off'],
                ['', 'Banner only'],
              ].map(([v, l]) => (
                <button
                  key={v || 'none'}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, discountType: v }))}
                  aria-pressed={form.discountType === v}
                  className={`px-4 py-1.5 ${form.discountType === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {form.discountType ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={form.discountType === 'percent' ? 'Discount (%) *' : 'Discount (₹) *'}>
                  <input type="number" min="0" max={form.discountType === 'percent' ? 100 : undefined} className={input} value={form.discountValue} onChange={set('discountValue')} />
                </Field>
                <Field label="Minimum order (₹)" hint="Leave empty for no minimum">
                  <input type="number" min="0" className={input} value={form.minOrderAmount} onChange={set('minOrderAmount')} />
                </Field>
                {form.discountType === 'percent' && (
                  <Field label="Maximum discount (₹)" hint="Leave empty for no cap">
                    <input type="number" min="0" className={input} value={form.maxDiscount} onChange={set('maxDiscount')} />
                  </Field>
                )}
                <p className="text-xs text-gray-500 sm:col-span-3">
                  Customers enter the coupon code at checkout and the discount is taken off automatically (card and cash on delivery).
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">The banner is shown on the home page, but the code does not change prices at checkout.</p>
            )}
          </fieldset>
          <Field label="Button text">
            <input className={input} value={form.ctaText} onChange={set('ctaText')} maxLength={30} />
          </Field>
          <Field label="Button link" hint='A page on your site like "/shop" or "/products/tablet-press"'>
            <input className={input} value={form.ctaLink} onChange={set('ctaLink')} maxLength={300} />
          </Field>
          <Field label="Starts">
            <input type="datetime-local" className={input} value={form.startsAt} onChange={set('startsAt')} />
          </Field>
          <Field label="Ends" hint="Leave empty for no end date (no countdown)">
            <input type="datetime-local" className={input} value={form.endsAt || ''} onChange={set('endsAt')} />
          </Field>
          <Field label="Priority" hint="If several offers run at once, higher shows first">
            <input type="number" className={input} value={form.priority} onChange={set('priority')} />
          </Field>
          <Toggle className="self-end pb-2" tone="green" checked={!!form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} label="Show this offer on the home page" />

          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? 'Save changes' : 'Create offer'}
            </button>
            <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Discount offers</h1>
          <p className="text-sm text-gray-500">Offers that are on and within their dates appear as a banner on the home page.</p>
        </div>
        <button type="button" onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New offer
        </button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="mb-3 text-gray-600">No offers yet.</p>
          <button type="button" onClick={startNew} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Create your first offer</button>
        </div>
      ) : (
        <ul className="space-y-3">
          {offers.map((o) => {
            const [label, cls] = statusOf(o);
            return (
              <li key={o._id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
                <span className={`h-12 w-2 shrink-0 rounded-full bg-gradient-to-b ${OFFER_THEMES[o.theme]} max-sm:hidden`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800">{o.discountText ? `${o.discountText} · ` : ''}{o.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                    {o.code && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">{o.code}</span>}
                    {o.code && o.discountType && o.discountValue > 0 && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">
                        {o.discountType === 'percent' ? `${o.discountValue}% off` : `₹${o.discountValue} off`} at checkout
                        {o.minOrderAmount ? ` · min ₹${o.minOrderAmount}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(o.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    {' → '}
                    {o.endsAt ? new Date(o.endsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'no end date'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Toggle size="sm" tone="green" checked={!!o.isActive} onChange={() => toggle(o)} label={o.isActive ? 'On' : 'Off'} aria-label={`Offer active: ${o.title || o.code || ''}`} labelClassName="font-medium text-gray-600" />
                  <button type="button" onClick={() => startEdit(o)} aria-label="Edit offer" className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(o)} aria-label="Delete offer" className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ManageOffers;
