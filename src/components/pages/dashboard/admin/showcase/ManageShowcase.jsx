// Admin: factory photos and client installations for /factory and the city pages.
// Client logos are shown only when "Customer agreed to show their logo" is on.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Save, Upload } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import Toggle from '../../../../ui/Toggle';
import { SECTION_LABELS } from '../../../FactoryPage';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/showcase${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const upload = async (file) => {
  const body = new FormData();
  body.append('images', file);
  const res = await fetch(`${getBaseURL()}/api/uploadImages`, { method: 'POST', body, credentials: 'include', headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.urls[0];
};
const input = 'mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm';

const ItemEditor = ({ item, onSaved, onDeleted }) => {
  const [x, setX] = useState(item);
  const [busy, setBusy] = useState('');
  const set = (patch) => setX((v) => ({ ...v, ...patch }));
  const isClient = x.kind === 'client';

  const pickImage = async (file) => {
    if (!file) return;
    setBusy('upload');
    try { set({ imageUrl: await upload(file) }); } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const save = async () => {
    setBusy('save');
    try {
      const d = x._id ? await call(`/${x._id}`, { method: 'PATCH', body: JSON.stringify(x) }) : await call('', { method: 'POST', body: JSON.stringify(x) });
      onSaved(d.item, item);
      toast.success('Saved');
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const remove = async () => {
    if (x._id && !window.confirm('Delete this item?')) return;
    try { if (x._id) await call(`/${x._id}`, { method: 'DELETE' }); onDeleted(item); } catch (e) { toast.error(e.message); }
  };

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row">
      <label className="relative flex h-28 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 sm:w-36">
        {x.imageUrl ? <img src={x.imageUrl} alt="" className="h-full w-full object-contain" /> : <span className="flex flex-col items-center text-xs text-gray-500">{busy === 'upload' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}{isClient ? 'Logo (optional)' : 'Upload photo'}</span>}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
      </label>
      <div className="grid flex-1 gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-2">{isClient ? 'Client name' : 'Caption'}<input value={x.title} onChange={(e) => set({ title: e.target.value })} maxLength={150} className={`${input} normal-case`} /></label>
        {isClient ? (
          <>
            <label className="text-xs font-semibold uppercase text-slate-500">Machine installed<input value={x.machine} onChange={(e) => set({ machine: e.target.value })} maxLength={200} className={`${input} normal-case`} /></label>
            <label className="text-xs font-semibold uppercase text-slate-500">Year<input type="number" min="1950" max="2100" value={x.year || ''} onChange={(e) => set({ year: e.target.value })} className={input} /></label>
            <label className="text-xs font-semibold uppercase text-slate-500">City<input value={x.city} onChange={(e) => set({ city: e.target.value })} maxLength={100} className={`${input} normal-case`} /></label>
            <label className="text-xs font-semibold uppercase text-slate-500">State<input value={x.state} onChange={(e) => set({ state: e.target.value })} maxLength={100} placeholder="e.g. Himachal Pradesh" className={`${input} normal-case`} /></label>
          </>
        ) : (
          <label className="text-xs font-semibold uppercase text-slate-500">Section
            <select value={x.section} onChange={(e) => set({ section: e.target.value })} className={input}>{Object.entries(SECTION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        )}
        <label className="text-xs font-semibold uppercase text-slate-500">Order<input type="number" value={x.order} onChange={(e) => set({ order: e.target.value })} className={input} /></label>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <Toggle checked={x.active} onChange={(v) => set({ active: v })} label="Shown on the website" size="sm" />
          {isClient && <Toggle checked={x.showLogo} onChange={(v) => set({ showLogo: v })} label="Customer agreed to show their logo" size="sm" tone="green" />}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={remove} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-red-600 hover:border-red-400"><Trash2 className="h-4 w-4" /> Delete</button>
            <button type="button" onClick={save} disabled={!!busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function ManageShowcase() {
  const [tab, setTab] = useState('photo');
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { call('/all').then((d) => setItems(d.items)).catch((e) => setError(e.message)); }, []);
  const list = (items || []).filter((i) => i.kind === tab);
  const add = () => setItems((l) => [{ _key: Date.now(), kind: tab, title: '', section: 'workshop', imageUrl: '', city: '', state: '', machine: '', year: '', showLogo: false, active: true, order: 0 }, ...l]);
  const saved = (item, old) => setItems((l) => l.map((x) => (x === old ? item : x)));
  const deleted = (old) => setItems((l) => l.filter((x) => x !== old));
  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Factory & clients</h1>
          <p className="text-sm text-gray-500">Real photos and installations for the <a href="/factory" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">factory page</a> and the city pages. Only add clients you really supplied; show a logo only with their permission.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"><Plus className="h-4 w-4" /> {tab === 'photo' ? 'Add photo' : 'Add client / installation'}</button>
      </div>
      <div className="mt-4 inline-flex overflow-hidden rounded-lg border border-gray-300 text-sm">
        {[['photo', 'Factory photos'], ['client', 'Clients & installations']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`px-4 py-2 ${tab === k ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{l} ({(items || []).filter((i) => i.kind === k).length})</button>
        ))}
      </div>
      {error ? <p className="mt-6 text-red-600">{error}</p>
        : !items ? <p className="mt-6 flex items-center gap-2 text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        : list.length === 0 ? <p className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">Nothing yet.</p>
        : <ul className="mt-6 space-y-3">{list.map((i) => <ItemEditor key={i._id || i._key} item={i} onSaved={saved} onDeleted={deleted} />)}</ul>}
    </div>
  );
}
