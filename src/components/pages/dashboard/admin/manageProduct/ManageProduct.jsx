import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '../../../../../shell/router';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Package, Plus, Pencil, Trash2, ExternalLink, EyeOff, MessageSquareQuote, Search, Loader2 } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import productsApi from '../../../../store/products/productsApi';

const authHeaders = () => {
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/products${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Admin: every machine incl. hidden ones — show/hide, sell online or enquiry only, edit, delete
const ManageProduct = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    call('/admin/all')
      .then((d) => { setItems(d.products || []); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const refreshShop = () => dispatch(productsApi.util.invalidateTags(['Products']));
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((p) => [p.name, p.category].some((v) => String(v || '').toLowerCase().includes(s))) : items;
  }, [items, q]);

  const update = async (p, patch, message) => {
    setBusyId(p._id);
    try {
      await call(`/update-product/${p._id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setItems((list) => list.map((i) => (i._id === p._id ? { ...i, ...patch } : i)));
      refreshShop();
      toast.success(message);
    } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.\n\nTip: use Hide instead if you may sell it again.`)) return;
    setBusyId(p._id);
    try {
      await call(`/${p._id}`, { method: 'DELETE' });
      setItems((list) => list.filter((i) => i._id !== p._id));
      refreshShop();
      toast.success('Product deleted');
    } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };

  const visible = items.filter((p) => p.active !== false).length;
  const enquiry = items.filter((p) => p.sellOnline === false).length;

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800"><Package className="h-6 w-6 text-blue-600" />Manage products</h1>
          <p className="text-sm text-gray-500">{items.length} machines · {visible} on the website · {enquiry} enquiry only</p>
        </div>
        <Link to="/dashboard/add-product" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add product</Link>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or category…" aria-label="Search the product list" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const hidden = p.active === false;
                const online = p.sellOnline !== false;
                return (
                  <tr key={p._id} className={`border-b border-gray-100 align-middle hover:bg-gray-50 ${hidden ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || ''} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                        <span className="font-semibold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">{String(p.category || '').replace(/-/g, ' ')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">{inr(p.price)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.stock ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Toggle size="sm" tone="green" checked={!hidden} busy={busyId === p._id}
                          onChange={(v) => update(p, { active: v }, v ? 'Now visible on the website' : 'Hidden from the website')}
                          label="Visible" aria-label={`Visible on website: ${p.name}`} labelClassName="font-medium text-gray-700" />
                        <Toggle size="sm" checked={online} busy={busyId === p._id}
                          onChange={(v) => update(p, { sellOnline: v }, v ? 'Now sold online' : 'Now enquiry only (no Add to cart)')}
                          label={online ? 'Sell online' : 'Enquiry only'} aria-label={`Sell online: ${p.name}`} labelClassName="font-medium text-gray-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <a href={`/shop/${p._id}`} target="_blank" rel="noopener noreferrer" title="Open page" aria-label={`Open ${p.name}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><ExternalLink className="h-4 w-4" /></a>
                        <Link to={`/dashboard/update-product/${p._id}`} title="Edit" aria-label={`Edit ${p.name}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></Link>
                        <button type="button" disabled={busyId === p._id} onClick={() => remove(p)} title="Delete" aria-label={`Delete ${p.name}`} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">{items.length ? `No products match “${q}”.` : 'No products yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-gray-500">
        <EyeOff className="inline h-3 w-3" /> Turning <strong>Visible</strong> off removes a product from the shop, search and Google without deleting it. <MessageSquareQuote className="inline h-3 w-3" /> Turning <strong>Sell online</strong> off keeps it visible but replaces Add to cart with a quotation request.
      </p>
    </div>
  );
};

export default ManageProduct;
