// Admin (SEO Health): Google descriptions for machines drafted by our own model every Monday.
// Nothing goes live until approved here; approved text becomes the machine's meta description.
// Backend: /api/seo/drafts (Backend/src/seo/metaDrafts.js)
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Check, X } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const api = async (path, method = 'GET', body) => {
  const res = await fetch(`${getBaseURL()}/api/seo${path}`, {
    method,
    credentials: 'include',
    headers: { ...(token() && { Authorization: `Bearer ${token()}` }), ...(body && { 'Content-Type': 'application/json' }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

function Draft({ d, onDone }) {
  const [text, setText] = useState(d.draft);
  const [busy, setBusy] = useState('');
  const act = async (what) => {
    setBusy(what);
    try {
      await api(`/drafts/${d._id}/${what}`, 'POST', what === 'approve' ? { text } : undefined);
      toast.success(what === 'approve' ? 'Live: Google gets the new description' : 'Draft rejected');
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  };
  const n = text.trim().length;
  return (
    <li className="p-4 text-sm">
      <a href={`/shop/${d.product}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">{d.name}</a>
      <span className="ml-2 text-xs text-amber-700">{d.reason}</span>
      <p className="mt-2 text-xs uppercase text-gray-500">Google gets now</p>
      <p className="text-gray-600">{d.current || '—'}</p>
      <p className="mt-2 text-xs uppercase text-gray-500">Draft by our model (you can edit it)</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={170} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={`text-xs ${n < 70 || n > 160 ? 'text-red-600' : 'text-gray-500'}`}>{n}/160 characters</span>
        <button type="button" onClick={() => act('approve')} disabled={!!busy} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60">
          {busy === 'approve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
        </button>
        <button type="button" onClick={() => act('reject')} disabled={!!busy} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {busy === 'reject' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Reject
        </button>
      </div>
    </li>
  );
}

export default function MetaDrafts() {
  const [data, setData] = useState(null);
  const [running, setRunning] = useState(false);
  const load = () => api('/drafts').then(setData).catch((e) => setData({ pending: [], decided: [], error: e.message }));
  useEffect(() => { load(); }, []);

  const run = async () => {
    setRunning(true);
    try {
      const r = await api('/drafts/run', 'POST');
      toast.success(r.drafted ? `${r.drafted} new draft(s)` : 'No machine needs a new description');
      if (r.skipped?.length) toast(`${r.skipped.length} skipped: the model's drafts failed the checks`, { icon: 'ℹ️' });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Machine descriptions for Google (drafted by our model)</h2>
          <p className="max-w-3xl text-sm text-gray-600">
            Every Monday our own model drafts a Google description for machines whose description is missing, cut off, too short or copied.
            Drafts only use the machine's own data and are checked (length, no invented numbers, no links or claims). Nothing goes live until you approve it.
          </p>
        </div>
        <button type="button" onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {running ? 'Writing drafts… (a minute or two)' : 'Write drafts now'}
        </button>
      </div>
      {!data ? (
        <p className="mt-3 text-sm text-gray-500">Loading…</p>
      ) : data.error ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load the drafts: {data.error}</p>
      ) : data.pending.length === 0 ? (
        <p className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">No drafts waiting.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {data.pending.map((d) => <Draft key={d._id} d={d} onDone={load} />)}
        </ul>
      )}
      {data?.decided?.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-600">Recently decided ({data.decided.length})</summary>
          <ul className="mt-2 space-y-1">
            {data.decided.map((d) => <li key={d._id} className="text-gray-600"><span className={d.status === 'approved' ? 'text-green-700' : 'text-gray-400'}>{d.status}</span> · {d.name}: {d.draft}</li>)}
          </ul>
        </details>
      )}
    </section>
  );
}
