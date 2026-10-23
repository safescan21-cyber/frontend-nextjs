// Customer: their service requests and AMC bookings, with the status history
import { useEffect, useState } from 'react';
import { Loader2, Wrench, Plus } from 'lucide-react';
import getBaseURL from '../../../../utlis/baseURL';
import { Link } from '../../../../shell/router';

const STATUS = {
  open: ['Received', 'bg-blue-100 text-blue-700'],
  scheduled: ['Visit scheduled', 'bg-amber-100 text-amber-800'],
  in_progress: ['Work in progress', 'bg-purple-100 text-purple-700'],
  resolved: ['Resolved', 'bg-green-100 text-green-700'],
  closed: ['Closed', 'bg-gray-200 text-gray-600'],
};
const when = (d, time = true) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', ...(time && { timeStyle: 'short' }) });

export default function UserServiceRequests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let token = null;
    try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
    fetch(`${getBaseURL()}/api/service/requests/mine`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.message || 'Could not load'); setRequests(d.requests || []); })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="px-4 pb-8 pt-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800"><Wrench className="h-6 w-6 text-orange-500" /> My service requests</h1>
        <div className="flex gap-2">
          <Link to="/service-request" className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"><Plus className="h-4 w-4" /> New service request</Link>
          <Link to="/amc" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-400">AMC plans</Link>
        </div>
      </div>

      {error ? <p className="mt-6 text-red-600">{error}</p>
        : !requests ? <p className="mt-6 flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        : requests.length === 0 ? <p className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">No service requests yet. Requests you send while logged in, or with this account's email, show up here.</p>
        : (
          <ul className="mt-6 space-y-4">
            {requests.map((r) => (
              <li key={r._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-700">{r.number}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[r.status]?.[1]}`}>{STATUS[r.status]?.[0]}</span>
                  <span className="text-sm text-slate-700">{r.type === 'amc' ? `AMC · ${r.amc?.planName || ''}` : r.machine?.name}{r.machine?.model ? ` · ${r.machine.model}` : ''}</span>
                  <span className="ml-auto text-xs text-slate-400">{when(r.createdAt)}</span>
                </div>
                {r.status === 'scheduled' && r.scheduledFor && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Visit planned: <strong>{when(r.scheduledFor)}</strong></p>}
                {r.issue && <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{r.issue}</p>}
                <ol className="mt-3 space-y-1 border-l-2 border-gray-200 pl-3 text-sm">
                  {(r.updates || []).map((u, i) => (
                    <li key={i}><span className="text-xs text-slate-400">{when(u.at)}</span> · <strong className="text-slate-700">{STATUS[u.status]?.[0] || u.status}</strong>{u.note ? ` — ${u.note}` : ''}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
