import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Mail, Phone, MessageCircle, Loader2, ChevronDown, ChevronUp, MapPin, CalendarDays, Building2, CheckCircle2, AlertTriangle, Clock, RotateCw, FileSpreadsheet, FileText } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import QuotationBuilder from './QuotationBuilder';

// Which form the request came from, and where the visitor first found the site
const FORMS = { quick: 'Quick quote (machine page)', navbar: 'Bulk quote page', cart: 'From cart', product: 'Product page', other: 'Other' };
const CHANNELS = { google: 'Google', bing: 'Bing', yahoo: 'Yahoo', whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', indiamart: 'IndiaMART', tradeindia: 'TradeIndia', email: 'Email', ads: 'Ads', referral: 'Another website', direct: 'Direct / typed', other: 'Other' };

const STATUSES = [
  ['new', 'New', 'bg-blue-100 text-blue-700'],
  ['contacted', 'Contacted', 'bg-amber-100 text-amber-800'],
  ['quoted', 'Quote sent', 'bg-purple-100 text-purple-700'],
  ['won', 'Won', 'bg-green-100 text-green-700'],
  ['lost', 'Lost', 'bg-gray-200 text-gray-600'],
];
const statusInfo = Object.fromEntries(STATUSES.map(([v, l, c]) => [v, { label: l, cls: c }]));

const request = async (path = '', options = {}) => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  const res = await fetch(`${getBaseURL()}/api/bulk-quotes${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

const when = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const QuoteCard = ({ q, onSaved }) => {
  const [open, setOpen] = useState(q.status === 'new');
  const [building, setBuilding] = useState(false);
  const [notes, setNotes] = useState(q.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const c = q.contact || {};
  const units = (q.items || []).reduce((n, i) => n + (i.quantity || 0), 0);
  const phoneDigits = String(c.phone || '').replace(/\D/g, '');
  const wa = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

  const [resending, setResending] = useState(false);
  const em = q.emails || {};
  const resend = async () => {
    setResending(true);
    try {
      const r = await request(`/${q._id}/resend-emails`, { method: 'POST' });
      toast.success(r.message);
      onSaved({ ...q, emails: { error: '' } });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setResending(false);
    }
  };

  const save = async (patch) => {
    setSaving(true);
    try {
      const { quote } = await request(`/${q._id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      onSaved(quote);
      toast.success('Saved');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left" aria-expanded={open}>
        <span className="font-mono text-sm font-bold text-slate-700">{q.quoteNumber}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusInfo[q.status]?.cls}`}>{statusInfo[q.status]?.label}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
          <strong>{c.name}</strong>{c.company ? ` · ${c.company}` : ''} — {q.items.length} product{q.items.length === 1 ? '' : 's'}, {units} unit{units === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-slate-400">{when(q.createdAt)}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {open && (
        <div className="grid gap-5 border-t border-gray-100 p-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500"><th className="pb-2">Product</th><th className="pb-2 text-right">Qty</th><th className="pb-2 pl-4">Notes</th></tr>
              </thead>
              <tbody>
                {q.items.map((i, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="py-2">
                      {i.productId && /^[a-f0-9]{24}$/i.test(i.productId) ? (
                        <a href={`/shop/${i.productId}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{i.name}</a>
                      ) : i.name}
                    </td>
                    <td className="py-2 text-right font-semibold">{i.quantity}</td>
                    <td className="py-2 pl-4 text-slate-500">{i.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {q.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-slate-700">{q.message}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              {(q.deliveryCity || q.deliveryState) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[q.deliveryCity, q.deliveryState, q.country].filter(Boolean).join(', ')}</span>}
              {q.requiredBy && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Needed by {new Date(q.requiredBy).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>}
              <span>Form: {FORMS[q.source] || q.source}</span>
              {q.origin?.channel && (
                <span title={[q.origin.source, q.origin.campaign && `campaign ${q.origin.campaign}`, q.origin.landing && `landed on ${q.origin.landing}`].filter(Boolean).join(' · ')}>
                  Found us via: <strong className="text-slate-700">{CHANNELS[q.origin.channel] || q.origin.channel}</strong>{q.origin.source && q.origin.channel === 'referral' ? ` (${q.origin.source})` : ''}
                </span>
              )}
            </div>

            {q.quotation?.number && !building && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-sm text-purple-800">
                <FileText className="h-4 w-4" /> Quotation {q.quotation.number}: ₹{Number(q.quotation.total || 0).toLocaleString('en-IN')} incl. GST
                {q.quotation.sentAt ? ` · sent ${new Date(q.quotation.sentAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : ' · not sent yet'}
              </p>
            )}
            <div className="mt-3">
              <button type="button" onClick={() => setBuilding((b) => !b)} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                <FileText className="h-4 w-4" /> {building ? 'Close quotation' : q.quotation?.number ? 'Edit / resend quotation' : 'Make quotation'}
              </button>
            </div>
            {building && <QuotationBuilder q={q} onSaved={onSaved} />}
          </div>

          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              {c.company && <p className="flex items-center gap-1.5 text-slate-700"><Building2 className="h-4 w-4" />{c.company}{c.gstin ? ` · GSTIN ${c.gstin}` : ''}</p>}
              {c.email ? (
                <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Your bulk quote ${q.quoteNumber}`)}`} className="flex items-center gap-1.5 text-blue-600 hover:underline"><Mail className="h-4 w-4" />{c.email}</a>
              ) : (
                <p className="flex items-center gap-1.5 text-slate-400"><Mail className="h-4 w-4" />No email given — call or WhatsApp</p>
              )}
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline"><Phone className="h-4 w-4" />{c.phone}</a>
              {wa && (
                <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${c.name}, about your bulk quote ${q.quoteNumber}:`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline">
                  <MessageCircle className="h-4 w-4" />WhatsApp
                </a>
              )}
            </div>
            {/* Email delivery: the customer is only confirmed after your copy is sent */}
            <div className="space-y-1 rounded-lg bg-gray-50 p-2 text-xs">
              <p className={`flex items-center gap-1.5 ${em.adminSentAt ? 'text-green-700' : 'text-slate-500'}`}>
                {em.adminSentAt ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                Your email {em.adminSentAt ? `sent ${when(em.adminSentAt)}` : 'pending'}
              </p>
              <p className={`flex items-center gap-1.5 ${em.customerSentAt ? 'text-green-700' : 'text-slate-500'}`}>
                {em.customerSentAt ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                Customer confirmation {em.customerSentAt ? `sent ${when(em.customerSentAt)}` : em.adminSentAt ? 'pending' : 'waits for your email'}
              </p>
              {em.error && (
                <p className="flex items-start gap-1.5 text-red-600"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{em.error}</p>
              )}
              {(em.error || !em.customerSentAt) && (
                <button type="button" onClick={resend} disabled={resending} className="mt-1 inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline disabled:opacity-50">
                  <RotateCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} /> Resend emails
                </button>
              )}
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</span>
              <select value={q.status} disabled={saving} onChange={(e) => save({ status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-2">
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Private notes</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2 py-2" placeholder="Prices quoted, follow-up date…" />
            </label>
            <button type="button" disabled={saving || notes === (q.adminNotes || '')} onClick={() => save({ adminNotes: notes })} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save notes
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

const ManageBulkQuotes = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    request(`?status=${status}&q=${encodeURIComponent(query)}`)
      .then((d) => { if (alive) { setData(d); setError(''); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [status, query]);

  const [exporting, setExporting] = useState(false);
  const exportCsv = async () => {
    setExporting(true);
    try {
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes/export.csv`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Could not export');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExporting(false);
    }
  };

  const counts = data?.counts || {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const replace = (quote) => setData((d) => ({
    ...d,
    quotes: d.quotes.map((x) => (x._id === quote._id ? quote : x)),
  }));

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quote requests</h1>
          <p className="mb-5 text-sm text-gray-500">From the Bulk Quote page and the “Get a quote in 2 minutes” forms. You also get each one by email, and a reminder if one waits more than a day.</p>
        </div>
        <button type="button" onClick={exportCsv} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-400 disabled:opacity-50">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-green-700" />} Export to Excel (CSV)
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[['', 'All', 'bg-slate-100 text-slate-700', total], ...STATUSES.map(([v, l, c]) => [v, l, c, counts[v] || 0])].map(([v, l, c, n]) => (
          <button
            key={v || 'all'}
            type="button"
            onClick={() => setStatus(v)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${c} ${status === v ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
          >
            {l} <span className="ml-1 font-bold">{n}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }} className="mb-5 flex max-w-xl items-center rounded-lg border border-gray-300 bg-white">
        <Search className="ml-3 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quote number, name, company, product…" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-blue-600">Search</button>
      </form>

      {error ? (
        <p className="text-red-600">Could not load requests: {error}</p>
      ) : !data ? (
        <p className="flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : data.quotes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">No quote requests yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.quotes.map((q) => <QuoteCard key={q._id} q={q} onSaved={replace} />)}
        </ul>
      )}
    </div>
  );
};

export default ManageBulkQuotes;
