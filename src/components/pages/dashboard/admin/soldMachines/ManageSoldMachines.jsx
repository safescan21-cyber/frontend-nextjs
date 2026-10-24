// Admin: every machine sold with its serial number (made when an order is marked shipped
// or delivered, or entered here for a sale outside the website). Download the list as
// Excel or PDF; the same files go to the admin email every morning.
// Backend: /api/sold-machines (Backend/src/soldMachines/soldMachineRoutes.js)
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Download, FileSpreadsheet, Plus, Search, Mail, RefreshCw, X } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const headers = () => (token() ? { Authorization: `Bearer ${token()}` } : {});
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/sold-machines${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...headers() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const day = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const input = 'mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm';
const EMPTY_SALE = { productId: '', productName: '', modelNumber: '', quantity: 1, unitPrice: '', soldAt: '', notes: '', customer: { name: '', company: '', phone: '', email: '', city: '', state: '' } };

const SaleForm = ({ products, onDone, onClose }) => {
  const [x, setX] = useState(EMPTY_SALE);
  const [busy, setBusy] = useState(false);
  const set = (patch) => setX((v) => ({ ...v, ...patch }));
  const setC = (patch) => setX((v) => ({ ...v, customer: { ...v.customer, ...patch } }));
  const pick = (id) => {
    const p = products.find((q) => q._id === id);
    set({ productId: id, productName: p?.name || '', modelNumber: p?.modelNumber || '', unitPrice: p?.price || '' });
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await call('', { method: 'POST', body: JSON.stringify(x) });
      toast.success(`Saved: ${d.items.map((i) => i.serialNumber).join(', ')}`);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Record a sale made outside the website</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800"><X className="h-5 w-5" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Machine
          <select value={x.productId} onChange={(e) => pick(e.target.value)} className={input}>
            <option value="">Not in the shop – type the name</option>
            {products.map((p) => <option key={p._id} value={p._id}>{p.name}{p.modelNumber ? ` (${p.modelNumber})` : ''}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Machine name
          <input value={x.productName} onChange={(e) => set({ productName: e.target.value })} required maxLength={200} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Model number
          <input value={x.modelNumber} onChange={(e) => set({ modelNumber: e.target.value })} maxLength={60} placeholder="ZP-35D" className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Units
          <input type="number" min="1" max="50" value={x.quantity} onChange={(e) => set({ quantity: e.target.value })} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Price per unit (₹)
          <input type="number" min="0" value={x.unitPrice} onChange={(e) => set({ unitPrice: e.target.value })} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Sale date
          <input type="date" value={x.soldAt} onChange={(e) => set({ soldAt: e.target.value })} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Customer name<span className="text-red-500"> *</span>
          <input value={x.customer.name} onChange={(e) => setC({ name: e.target.value })} required maxLength={150} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Company
          <input value={x.customer.company} onChange={(e) => setC({ company: e.target.value })} maxLength={150} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Phone
          <input value={x.customer.phone} onChange={(e) => setC({ phone: e.target.value })} maxLength={30} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">Email
          <input type="email" value={x.customer.email} onChange={(e) => setC({ email: e.target.value })} maxLength={150} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">City
          <input value={x.customer.city} onChange={(e) => setC({ city: e.target.value })} maxLength={100} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700">State
          <input value={x.customer.state} onChange={(e) => setC({ state: e.target.value })} maxLength={100} className={input} />
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Notes
          <input value={x.notes} onChange={(e) => set({ notes: e.target.value })} maxLength={1000} className={input} />
        </label>
      </div>
      <button type="submit" disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save and make serial number(s)
      </button>
    </form>
  );
};

export default function ManageSoldMachines() {
  const [data, setData] = useState({ items: [], totals: { active: 0, cancelled: 0 }, reportTo: '' });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' });
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState('');

  const qs = () => new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  const load = async () => {
    setLoading(true);
    try { setData(await call(`?${qs()}`)); } catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch(`${getBaseURL()}/api/products/admin/all`, { credentials: 'include', headers: headers() })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setProducts((d.products || []).filter((p) => p.category !== 'spares')))
      .catch(() => {});
  }, []);

  const download = async (kind) => {
    setBusy(kind);
    try {
      const res = await fetch(`${getBaseURL()}/api/sold-machines/export.${kind}?${qs()}`, { credentials: 'include', headers: headers() });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Download failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `sold-machines-${new Date().toISOString().slice(0, 10)}.${kind}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const action = async (path, okText) => {
    setBusy(path);
    try {
      const d = await call(path, { method: 'POST' });
      toast.success(okText(d));
      load();
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const setStatus = async (item, status) => {
    if (status === 'cancelled' && !window.confirm(`Mark ${item.serialNumber} as cancelled? It stays in the history.`)) return;
    try {
      const d = await call(`/${item._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setData((v) => ({ ...v, items: v.items.map((i) => (i._id === item._id ? d.item : i)) }));
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sold Machines</h1>
          <p className="mt-1 text-sm text-gray-600">
            <strong>{data.totals.active}</strong> sold{data.totals.cancelled ? ` · ${data.totals.cancelled} cancelled` : ''}. Serial numbers are made when an order is marked <em>Shipped</em> or <em>Delivered</em>.
            {data.reportTo && <> Daily report at 9:00 to <strong>{data.reportTo}</strong>.</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => download('xlsx')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {busy === 'xlsx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />} Excel
          </button>
          <button type="button" onClick={() => download('pdf')} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} PDF
          </button>
          <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Record offline sale
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={() => action('/send-report', (d) => `Report emailed to ${d.to}`)} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {busy === '/send-report' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Email the report now
        </button>
        <button type="button" onClick={() => window.confirm('Make serial numbers for orders that were already shipped or delivered?') && action('/backfill', (d) => `${d.created} serial number(s) made from ${d.orders} order(s)`)} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:opacity-60">
          {busy === '/backfill' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Serials for past shipped orders
        </button>
      </div>

      {showForm && <div className="mt-4"><SaleForm products={products} onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} /></div>}

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-3">
        <label className="text-xs font-medium text-gray-600">Search
          <span className="relative mt-1 block"><Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Serial, machine, model, customer, order…" className="w-64 rounded-lg border border-gray-300 py-1.5 pl-8 pr-2 text-sm" /></span>
        </label>
        <label className="text-xs font-medium text-gray-600">Status
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={`${input} w-32`}>
            <option value="">All</option><option value="active">Sold</option><option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-xs font-medium text-gray-600">From
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={input} />
        </label>
        <label className="text-xs font-medium text-gray-600">To
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={input} />
        </label>
        <button type="submit" className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-900">Show</button>
        <span className="text-xs text-gray-500">Downloads use these filters.</span>
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : data.items.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-600">No sold machines yet. They appear here when an order is marked Shipped or Delivered, or when you record an offline sale.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th className="p-3">Serial number</th><th className="p-3">Machine</th><th className="p-3">Customer</th><th className="p-3">Order</th><th className="p-3">Sold on</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((r) => (
                <tr key={r._id} className={r.status === 'cancelled' ? 'text-gray-400' : 'text-gray-800'}>
                  <td className={`p-3 font-mono font-semibold ${r.status === 'cancelled' ? 'line-through' : ''}`}>{r.serialNumber}{r.status === 'cancelled' && <span className="block font-sans text-xs font-normal no-underline">Cancelled</span>}</td>
                  <td className="p-3">{r.productName}{r.modelNumber && <span className="block text-xs text-gray-500">{r.modelNumber}</span>}</td>
                  <td className="p-3">{r.customer?.name}{r.customer?.company && <span className="block text-xs text-gray-500">{r.customer.company}</span>}{r.customer?.phone && <span className="block text-xs text-gray-500">{r.customer.phone}</span>}</td>
                  <td className="p-3">{r.source === 'manual' ? 'Offline sale' : r.orderNumber}{r.notes && <span className="block text-xs text-gray-500">{r.notes}</span>}</td>
                  <td className="p-3 whitespace-nowrap">{day(r.soldAt)}</td>
                  <td className="p-3 text-right">
                    {r.status === 'cancelled'
                      ? <button type="button" onClick={() => setStatus(r, 'active')} className="text-xs font-semibold text-blue-600 hover:underline">Restore</button>
                      : <button type="button" onClick={() => setStatus(r, 'cancelled')} className="text-xs font-semibold text-red-600 hover:underline">Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
