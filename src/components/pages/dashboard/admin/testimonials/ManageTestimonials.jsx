import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MessageSquareQuote, Check, X, Star, Pencil, Trash2, Plus, Loader2, BadgeCheck, ImagePlus, ExternalLink } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const authHeaders = () => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/testimonials${path}`, {
    credentials: 'include', ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const EMPTY = { name: '', role: '', company: '', city: '', email: '', rating: 5, quote: '', photo: '', logo: '', consent: false, featured: false };
const input = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';
const STATUS = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-gray-100 text-gray-600' };

const ImageField = ({ label, value, onChange }) => {
  const [busy, setBusy] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const res = await axios.post(`${getBaseURL()}/api/uploadImages`, fd, { withCredentials: true, headers: authHeaders() });
      onChange(res.data.urls?.[0] || '');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); } finally { setBusy(false); }
  };
  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        {value ? <img src={value} alt="" className="h-12 w-12 rounded-full border object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed text-gray-400"><ImagePlus className="h-5 w-5" /></span>}
        <label className="cursor-pointer rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
          {busy ? 'Uploading…' : value ? 'Change' : 'Upload'}
          <input type="file" accept="image/*" onChange={upload} disabled={busy} className="sr-only" aria-label={`Upload ${label}`} />
        </label>
        {value && <button type="button" onClick={() => onChange('')} className="text-xs text-red-600 hover:underline">Remove</button>}
      </div>
    </div>
  );
};

// Admin: review customer submissions, add testimonials you collected, feature the best
const ManageTestimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('pending');
  const [editing, setEditing] = useState(null); // null | 'new' | testimonial
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    call('/admin/all').then((d) => { setItems(d.items || []); setError(''); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => { if (!loading && tab === 'pending' && !items.some((i) => i.status === 'pending') && items.length) setTab('approved'); }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => items.reduce((c, i) => ({ ...c, [i.status]: (c[i.status] || 0) + 1 }), {}), [items]);
  const shown = tab === 'all' ? items : items.filter((i) => i.status === tab);

  const patch = async (t, body, msg) => {
    try {
      const { item } = await call(`/${t._id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setItems((list) => list.map((i) => (i._id === t._id ? item : i)));
      toast.success(msg);
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (t) => {
    if (!window.confirm(`Delete the testimonial from ${t.name}? This cannot be undone.`)) return;
    try { await call(`/${t._id}`, { method: 'DELETE' }); setItems((l) => l.filter((i) => i._id !== t._id)); toast.success('Deleted'); } catch (e) { toast.error(e.message); }
  };
  const openForm = (t) => { setEditing(t || 'new'); setForm(t ? { ...EMPTY, ...t } : EMPTY); };
  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.quote.trim().length < 20) { toast.error('Name and a quote of at least 20 characters are needed.'); return; }
    if (!form.consent) { toast.error('Tick that the customer agreed to be published.'); return; }
    setSaving(true);
    try {
      const body = { name: form.name, role: form.role, company: form.company, city: form.city, email: form.email, rating: form.rating, quote: form.quote, photo: form.photo, logo: form.logo, consent: form.consent, featured: form.featured };
      if (editing === 'new') {
        const { item } = await call('', { method: 'POST', body: JSON.stringify(body) });
        setItems((l) => [item, ...l]); setTab('approved'); toast.success('Testimonial added and published');
      } else {
        const { item } = await call(`/${editing._id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setItems((l) => l.map((i) => (i._id === item._id ? item : i))); toast.success('Saved');
      }
      setEditing(null);
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800"><MessageSquareQuote className="h-6 w-6 text-blue-600" />Testimonials</h1>
          <p className="text-sm text-gray-500">Real customers only. Customer submissions wait here until you approve them.</p>
        </div>
        <div className="flex gap-2">
          <a href="/testimonials" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><ExternalLink className="h-4 w-4" /> View page</a>
          <button type="button" onClick={() => openForm(null)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add testimonial</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {[['pending', 'Waiting for approval'], ['approved', 'Published'], ['rejected', 'Rejected'], ['all', 'All']].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-full border px-3 py-1 text-sm ${tab === k ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
            {label} ({k === 'all' ? items.length : counts[k] || 0})
          </button>
        ))}
      </div>

      {editing && (
        <form onSubmit={save} className="mb-6 grid gap-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:grid-cols-2">
          <h2 className="font-semibold text-gray-800 sm:col-span-2">{editing === 'new' ? 'Add a testimonial you received' : `Edit testimonial from ${editing.name}`}</h2>
          <label className="block"><span className="text-sm font-medium text-gray-700">Customer name *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} className={input} /></label>
          <label className="block"><span className="text-sm font-medium text-gray-700">Email (private)</span><input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} className={input} /></label>
          <label className="block"><span className="text-sm font-medium text-gray-700">Job title</span><input value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} maxLength={80} className={input} /></label>
          <label className="block"><span className="text-sm font-medium text-gray-700">Company</span><input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={120} className={input} /></label>
          <label className="block"><span className="text-sm font-medium text-gray-700">City</span><input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={60} className={input} /></label>
          <label className="block"><span className="text-sm font-medium text-gray-700">Rating</span>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={input}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}</select></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-gray-700">Testimonial *</span><textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} maxLength={1000} rows={4} className={input} /></label>
          <ImageField label="Customer photo (only with permission)" value={form.photo} onChange={(photo) => setForm((f) => ({ ...f, photo }))} />
          <ImageField label="Company logo (only with permission)" value={form.logo} onChange={(logo) => setForm((f) => ({ ...f, logo }))} />
          <label className="flex items-start gap-2 text-sm text-gray-700 sm:col-span-2">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 h-4 w-4 accent-blue-600" />
            The customer agreed to publish this testimonial (and the photo/logo, if added) with their name and company.
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-blue-600" /> Featured (shown first)</label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Saving…' : editing === 'new' ? 'Add & publish' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          {tab === 'pending' ? 'No testimonials waiting. Ask happy customers to use “Share your experience” on /testimonials.' : 'Nothing here yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((t) => (
            <li key={t._id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                    {t.name}
                    {t.verifiedBuyer && <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"><BadgeCheck className="h-3 w-3" /> Verified buyer</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[t.status]}`}>{t.status === 'approved' ? 'Published' : t.status === 'pending' ? 'Waiting' : 'Rejected'}</span>
                    {t.featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Featured</span>}
                    <span className="text-xs font-normal text-gray-400">{t.source === 'admin' ? 'added by admin' : 'from website'} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                  </p>
                  <p className="text-xs text-gray-500">{[t.role, t.company, t.city].filter(Boolean).join(' · ')}{t.email ? ` · ${t.email}` : ''}</p>
                  <p className="mt-1 text-amber-500" aria-label={`${t.rating} stars`}>{'★'.repeat(t.rating)}<span className="text-gray-300">{'★'.repeat(5 - t.rating)}</span></p>
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-700">“{t.quote}”</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {t.status !== 'approved' && <button type="button" onClick={() => patch(t, { status: 'approved' }, 'Published')} className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"><Check className="h-3.5 w-3.5" /> Approve</button>}
                  {t.status !== 'rejected' && <button type="button" onClick={() => patch(t, { status: 'rejected', featured: false }, t.status === 'approved' ? 'Unpublished' : 'Rejected')} className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"><X className="h-3.5 w-3.5" /> {t.status === 'approved' ? 'Unpublish' : 'Reject'}</button>}
                  {t.status === 'approved' && <button type="button" onClick={() => patch(t, { featured: !t.featured }, t.featured ? 'No longer featured' : 'Featured')} title={t.featured ? 'Unfeature' : 'Feature'} aria-label={`${t.featured ? 'Unfeature' : 'Feature'} ${t.name}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"><Star className={`h-4 w-4 ${t.featured ? 'fill-amber-400 text-amber-400' : ''}`} /></button>}
                  <button type="button" onClick={() => openForm(t)} title="Edit" aria-label={`Edit ${t.name}`} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(t)} title="Delete" aria-label={`Delete ${t.name}`} className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageTestimonials;
