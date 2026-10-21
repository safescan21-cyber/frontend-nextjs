import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FlaskConical, Plus, Pencil, Trash2, ExternalLink, Search, Loader2, FileText } from 'lucide-react';
import { apiBase, fetchJson } from '../../../pharmaApi/pharmaApiShared';

// Admin: all Pharma APIs (incl. hidden) with edit, show/hide and delete
const ManagePharmaApis = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    fetchJson(`${apiBase()}/admin/all`)
      .then((d) => { setItems(d.items || []); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => [i.name, i.chemicalName, i.casNumber, i.category].some((v) => String(v || '').toLowerCase().includes(s)));
  }, [items, q]);

  const toggle = async (item) => {
    setBusyId(item._id);
    try {
      await fetchJson(`${apiBase()}/${item._id}`, { method: 'PATCH', body: JSON.stringify({ active: !item.active }) });
      setItems((list) => list.map((i) => (i._id === item._id ? { ...i, active: !i.active } : i)));
      toast.success(item.active ? 'Hidden from the website' : 'Now visible on the website');
    } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.\n\nTip: untick "Show on website" instead if you may need it again.`)) return;
    setBusyId(item._id);
    try {
      await fetchJson(`${apiBase()}/${item._id}`, { method: 'DELETE' });
      setItems((list) => list.filter((i) => i._id !== item._id));
      toast.success('Deleted');
    } catch (e) { toast.error(e.message); } finally { setBusyId(null); }
  };

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800"><FlaskConical className="h-6 w-6 text-blue-600" />Pharma APIs</h1>
          <p className="text-sm text-gray-500">{items.length} APIs · {items.filter((i) => i.active).length} visible on the website</p>
        </div>
        <div className="flex gap-2">
          <a href="/pharma-api" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><ExternalLink className="h-4 w-4" /> View page</a>
          <Link to="/dashboard/pharma-apis/new" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add API</Link>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, chemical name, CAS, category…" aria-label="Search APIs" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <FlaskConical className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-700">No APIs yet</p>
          <p className="mb-4 text-sm text-gray-500">Add your first active pharmaceutical ingredient.</p>
          <Link to="/dashboard/pharma-apis/new" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add API</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">API</th>
                <th className="px-4 py-3 font-medium">CAS / formula</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Grades</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i._id} className="border-b border-gray-100 align-top hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{i.name}</p>
                    {i.chemicalName && <p className="max-w-xs truncate text-xs text-gray-500" title={i.chemicalName}>{i.chemicalName}</p>}
                    {i.documents?.length > 0 && <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600"><FileText className="h-3 w-3" />{i.documents.length} document{i.documents.length > 1 ? 's' : ''}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{i.casNumber || '—'}<span className="block text-xs text-gray-500">{i.molecularFormula}</span></td>
                  <td className="px-4 py-3 text-gray-700">{i.category}</td>
                  <td className="px-4 py-3 text-gray-700">{i.grades?.join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <Toggle size="sm" tone="green" checked={!!i.active} busy={busyId === i._id} onChange={() => toggle(i)} label={i.active ? 'Visible' : 'Hidden'} aria-label={`Visible on website: ${i.name}`} labelClassName="font-medium text-gray-700" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <a href={`/pharma-api/${i.slug}`} target="_blank" rel="noopener noreferrer" title="Open page" aria-label={`Open ${i.name}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><ExternalLink className="h-4 w-4" /></a>
                      <Link to={`/dashboard/pharma-apis/${i._id}/edit`} title="Edit" aria-label={`Edit ${i.name}`} className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" onClick={() => remove(i)} disabled={busyId === i._id} title="Delete" aria-label={`Delete ${i.name}`} className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No APIs match “{q}”.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePharmaApis;
