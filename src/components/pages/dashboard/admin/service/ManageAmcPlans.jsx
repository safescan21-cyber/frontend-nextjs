// Admin: the AMC plans shown on /amc (name, visits, price text, what is covered)
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import Toggle from '../../../../ui/Toggle';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/service${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const input = 'mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const EMPTY = { name: '', summary: '', visitsPerYear: 4, priceText: 'Price on request', features: '', highlight: false, active: true, order: 0 };

const PlanEditor = ({ plan, onSaved, onDeleted }) => {
  const [p, setP] = useState({ ...EMPTY, ...plan, features: (plan.features || []).join('\n') });
  const [busy, setBusy] = useState(false);
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const save = async () => {
    setBusy(true);
    try {
      const d = plan._id ? await call(`/amc-plans/${plan._id}`, { method: 'PATCH', body: JSON.stringify(p) }) : await call('/amc-plans', { method: 'POST', body: JSON.stringify(p) });
      onSaved(d.plan, plan._id);
      toast.success('Plan saved');
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!plan._id) return onDeleted(plan);
    if (!window.confirm(`Delete the plan "${plan.name}"?`)) return;
    try { await call(`/amc-plans/${plan._id}`, { method: 'DELETE' }); onDeleted(plan); toast.success('Plan deleted'); } catch (e) { toast.error(e.message); }
  };
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase text-slate-500">Plan name<input value={p.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} placeholder="e.g. Standard AMC" className={`${input} normal-case`} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500">Price text<input value={p.priceText} onChange={(e) => set({ priceText: e.target.value })} maxLength={120} placeholder="e.g. ₹45,000 per machine per year" className={`${input} normal-case`} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-2">Short description<input value={p.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={300} className={`${input} normal-case`} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500">Preventive visits per year<input type="number" min="0" max="52" value={p.visitsPerYear} onChange={(e) => set({ visitsPerYear: e.target.value })} className={input} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500">Order on the page<input type="number" value={p.order} onChange={(e) => set({ order: e.target.value })} className={input} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-2">What is covered (one per line)<textarea rows={4} value={p.features} onChange={(e) => set({ features: e.target.value })} placeholder={'Quarterly preventive maintenance visit\nPriority breakdown support\nGenuine spare parts at contract price'} className={`${input} normal-case`} /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Toggle checked={p.active} onChange={(v) => set({ active: v })} label="Shown on /amc" size="sm" />
        <Toggle checked={p.highlight} onChange={(v) => set({ highlight: v })} label="“Most chosen” badge" size="sm" tone="amber" />
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={remove} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:border-red-400"><Trash2 className="h-4 w-4" /> Delete</button>
          <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
        </div>
      </div>
    </li>
  );
};

export default function ManageAmcPlans() {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { call('/amc-plans/all').then((d) => setPlans(d.plans)).catch((e) => setError(e.message)); }, []);
  const add = () => setPlans((list) => [...list, { ...EMPTY, _key: Date.now() }]);
  const saved = (plan, oldId) => setPlans((list) => list.map((x) => ((oldId ? x._id === oldId : !x._id && x._key) ? plan : x)));
  const deleted = (plan) => setPlans((list) => list.filter((x) => x !== plan && (!plan._id || x._id !== plan._id)));
  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AMC plans</h1>
          <p className="text-sm text-gray-500">Plans shown on the <a href="/amc" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">AMC page</a>. Without any plan, the page shows a general AMC enquiry form.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"><Plus className="h-4 w-4" /> Add plan</button>
      </div>
      {error ? <p className="mt-6 text-red-600">{error}</p>
        : !plans ? <p className="mt-6 flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        : plans.length === 0 ? <p className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">No plans yet. Add your first AMC plan.</p>
        : <ul className="mt-6 space-y-4">{plans.map((p) => <PlanEditor key={p._id || p._key} plan={p} onSaved={saved} onDeleted={deleted} />)}</ul>}
    </div>
  );
}
