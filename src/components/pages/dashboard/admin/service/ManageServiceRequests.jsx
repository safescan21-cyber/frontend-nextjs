// Admin: service requests and AMC bookings. Changing the status or writing a note to
// the customer emails them (when they gave an email); private notes stay here.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Search, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const STATUSES = [
  ['open', 'Received', 'bg-blue-100 text-blue-700'],
  ['scheduled', 'Visit scheduled', 'bg-amber-100 text-amber-800'],
  ['in_progress', 'Work in progress', 'bg-purple-100 text-purple-700'],
  ['resolved', 'Resolved', 'bg-green-100 text-green-700'],
  ['closed', 'Closed', 'bg-gray-200 text-gray-600'],
];
const info = Object.fromEntries(STATUSES.map(([v, l, c]) => [v, { label: l, cls: c }]));
const URGENCY = { normal: 'Normal', urgent: 'Urgent', machine_down: 'Machine stopped' };
const when = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/service${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
// datetime-local value in India time for an ISO date
const localInput = (d) => (d ? new Date(new Date(d).getTime() + 330 * 60000).toISOString().slice(0, 16) : '');

const RequestCard = ({ r, onSaved }) => {
  const [open, setOpen] = useState(r.status === 'open');
  const [status, setStatus] = useState(r.status);
  const [scheduledFor, setScheduledFor] = useState(localInput(r.scheduledFor));
  const [note, setNote] = useState('');
  const [adminNotes, setAdminNotes] = useState(r.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const c = r.contact || {};
  const digits = String(c.phone || '').replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;

  const save = async () => {
    setSaving(true);
    try {
      const body = { status, note, adminNotes, scheduledFor: scheduledFor ? `${scheduledFor}:00+05:30` : '' };
      const d = await call(`/requests/${r._id}`, { method: 'PATCH', body: JSON.stringify(body) });
      onSaved(d.request);
      setNote('');
      toast.success(d.emailed ? 'Saved and emailed to the customer' : 'Saved');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-2 p-4 text-left">
        <span className="font-mono text-sm font-bold text-slate-700">{r.number}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${info[r.status]?.cls}`}>{info[r.status]?.label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{r.type === 'amc' ? 'AMC' : 'Service'}</span>
        {r.urgency === 'machine_down' && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"><AlertTriangle className="h-3 w-3" /> Machine stopped</span>}
        <span className="min-w-0 flex-1 truncate text-sm text-slate-700"><strong>{c.name}</strong>{c.company ? ` · ${c.company}` : ''} — {r.type === 'amc' ? (r.amc?.planName || 'AMC') : r.machine?.name}</span>
        <span className="text-xs text-slate-400">{when(r.createdAt)}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="grid gap-5 border-t border-gray-100 p-4 md:grid-cols-3">
          <div className="space-y-2 text-sm md:col-span-2">
            <p className="text-slate-700">
              {[r.machine?.name, r.machine?.model && `model ${r.machine.model}`, r.machine?.serialNumber && `s/n ${r.machine.serialNumber}`, r.machine?.installedYear && `installed ${r.machine.installedYear}`].filter(Boolean).join(' · ')}
            </p>
            {r.type === 'amc' && <p className="text-slate-700">Plan: <strong>{r.amc?.planName}</strong> · {r.amc?.machines || 1} machine(s)</p>}
            {r.type !== 'amc' && <p className="text-slate-500">Urgency: {URGENCY[r.urgency]}</p>}
            {r.issue && <p className="whitespace-pre-line rounded-lg bg-gray-50 p-3 text-slate-700">{r.issue}</p>}
            {r.photos?.length > 0 && (
              <div className="flex flex-wrap gap-2">{r.photos.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="Customer photo" className="h-20 w-20 rounded-lg object-cover" /></a>)}</div>
            )}
            {(r.city || r.state) && <p className="text-xs text-slate-500">{[r.city, r.state].filter(Boolean).join(', ')}</p>}
            <ol className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3 text-xs text-slate-600">
              {(r.updates || []).map((u, i) => <li key={i}>{when(u.at)} · <strong>{info[u.status]?.label || u.status}</strong>{u.note ? ` — ${u.note}` : ''}</li>)}
            </ol>
          </div>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline"><Phone className="h-4 w-4" />{c.phone}</a>
              {c.email && <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Your request ${r.number}`)}`} className="flex items-center gap-1.5 text-blue-600 hover:underline"><Mail className="h-4 w-4" />{c.email}</a>}
              {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${c.name}, about your request ${r.number}:`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline"><MessageCircle className="h-4 w-4" />WhatsApp</a>}
            </div>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2 py-2">{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Visit date & time</span>
              <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2 py-2" />
            </label>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Note to the customer</span>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="e.g. Engineer Amit will visit on Monday" className="w-full rounded-lg border border-gray-300 px-2 py-2" />
            </label>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Private notes</span>
              <textarea rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} maxLength={3000} className="w-full rounded-lg border border-gray-300 px-2 py-2" />
            </label>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save{c.email && (status !== r.status || note) ? ' & email customer' : ''}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default function ManageServiceRequests() {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    call(`/requests?status=${status}&type=${type}&q=${encodeURIComponent(query)}`)
      .then((d) => { if (alive) { setData(d); setError(''); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [status, type, query]);

  const counts = data?.counts || {};
  const replace = (r) => setData((d) => ({ ...d, requests: d.requests.map((x) => (x._id === r._id ? r : x)) }));

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <h1 className="text-2xl font-bold text-gray-800">Service requests & AMC</h1>
      <p className="mb-5 text-sm text-gray-500">Breakdown and visit requests from /service-request and AMC bookings from /amc. You get each one by email.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {[['', 'All', 'bg-slate-100 text-slate-700', Object.values(counts).reduce((a, b) => a + b, 0)], ...STATUSES.map(([v, l, c]) => [v, l, c, counts[v] || 0])].map(([v, l, c, n]) => (
          <button key={v || 'all'} type="button" onClick={() => setStatus(v)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${c} ${status === v ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}>{l} <span className="ml-1 font-bold">{n}</span></button>
        ))}
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type" className="rounded-full border border-gray-300 px-3 py-1.5 text-sm">
          <option value="">Service + AMC</option><option value="service">Service only</option><option value="amc">AMC only</option>
        </select>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); }} className="mb-5 flex max-w-xl items-center rounded-lg border border-gray-300 bg-white">
        <Search className="ml-3 h-4 w-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, name, phone, machine, serial no…" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
        <button type="submit" className="px-4 py-2 text-sm font-medium text-blue-600">Search</button>
      </form>
      {error ? <p className="text-red-600">Could not load requests: {error}</p>
        : !data ? <p className="flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        : data.requests.length === 0 ? <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">No requests yet.</p>
        : <ul className="space-y-3">{data.requests.map((r) => <RequestCard key={r._id} r={r} onSaved={replace} />)}</ul>}
    </div>
  );
}
