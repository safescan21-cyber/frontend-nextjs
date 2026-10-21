import { formTool } from '../../webmcp/webmcpTools';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlaskConical, Search, ExternalLink, FileText, Loader2, X } from 'lucide-react';
import CatalogSwitch from './CatalogSwitch';
import { apiBase, fetchJson, prettyFormula } from './pharmaApiShared';

const PAGE_SIZE = 24;

// Public catalogue of Active Pharmaceutical Ingredients (/pharma-api).
// Each API opens on its own page in a new window (chemical name, composition, documents).
const PharmaApiList = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const [draft, setDraft] = useState(q);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setDraft(q); }, [q]);
  useEffect(() => { fetchJson(`${apiBase()}/categories`).then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (q) qs.set('q', q);
    if (category) qs.set('category', category);
    fetchJson(`${apiBase()}?${qs}`)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category, page]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-4 py-8 text-white sm:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
            <FlaskConical className="h-3.5 w-3.5" /> Pharmaceutical APIs
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Active Pharmaceutical Ingredients (APIs)</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:text-base">
            Bulk drugs in IP, BP, USP and EP grades with chemical name, CAS number, composition and documents (COA, MSDS).
            Open any API for full details and send an enquiry for price and availability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <CatalogSwitch active="api" className="mb-5 max-w-xl" />

        <form {...formTool('pharmaApiSearch')} onSubmit={(e) => { e.preventDefault(); update({ q: draft.trim() }); }} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              name="q" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search by API name, chemical name, CAS number or formula…"
              aria-label="Search APIs"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none"
            />
            {draft && <button type="button" onClick={() => { setDraft(''); update({ q: '' }); }} aria-label="Clear search" className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </div>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
        </form>

        {categories.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button type="button" onClick={() => update({ category: '' })} aria-pressed={!category}
              className={`rounded-full border px-3 py-1 text-sm ${!category ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
              All
            </button>
            {categories.map((c) => (
              <button key={c.category} type="button" onClick={() => update({ category: c.category })} aria-pressed={category === c.category}
                className={`rounded-full border px-3 py-1 text-sm ${category === c.category ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {c.category} <span className="opacity-60">({c.count})</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load APIs: {error}</p>
        ) : data.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FlaskConical className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">{q || category ? 'No APIs match your search.' : 'API listings are coming soon.'}</p>
            <p className="mt-1 text-sm text-slate-500">
              Looking for a specific API?{' '}
              <Link to={`/bulk-quote?product=${encodeURIComponent(q || 'Pharma API')}&source=pharma-api`} className="font-semibold text-blue-600 hover:underline">Send us an enquiry →</Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">{data.total} API{data.total === 1 ? '' : 's'}{category ? ` in ${category}` : ''}{q ? ` matching “${q}”` : ''}</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((a) => (
                <li key={a._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">{a.category}</span>
                    {a.grades?.length > 0 && <span className="text-xs font-semibold text-slate-500">{a.grades.join(' · ')}</span>}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    <a href={`/pharma-api/${a.slug}`} target="_blank" rel="noopener" className="hover:text-blue-700">{a.name}</a>
                  </h2>
                  {a.chemicalName && <p className="mt-0.5 line-clamp-2 text-sm italic text-slate-600" title={a.chemicalName}>{a.chemicalName}</p>}
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                    {a.casNumber && <><dt className="text-slate-500">CAS</dt><dd className="font-medium text-slate-800">{a.casNumber}</dd></>}
                    {a.molecularFormula && <><dt className="text-slate-500">Formula</dt><dd className="font-medium text-slate-800">{prettyFormula(a.molecularFormula)}</dd></>}
                    {a.molecularWeight && <><dt className="text-slate-500">Mol. weight</dt><dd className="font-medium text-slate-800">{a.molecularWeight}</dd></>}
                    {a.moq && <><dt className="text-slate-500">MOQ</dt><dd className="font-medium text-slate-800">{a.moq}</dd></>}
                  </dl>
                  {a.composition && <p className="mt-2 line-clamp-2 text-xs text-slate-500"><span className="font-semibold text-slate-600">Composition:</span> {a.composition}</p>}
                  {a.sellOnline && a.unitPrice > 0 && (
                    <p className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                      <span className="font-bold text-slate-900">₹{Number(a.unitPrice).toLocaleString('en-IN')} <span className="font-normal text-slate-600">/ {a.unit}</span></span>
                      <span className="text-xs font-semibold text-green-800">Buy online · min {a.minOrderQty} {a.unit}</span>
                    </p>
                  )}
                  <div className="mt-auto flex gap-2 pt-4">
                    <a href={`/pharma-api/${a.slug}`} target="_blank" rel="noopener"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" /> {a.sellOnline && a.unitPrice > 0 ? 'View & buy' : 'View details'}
                    </a>
                    <Link to={`/bulk-quote?product=${encodeURIComponent(a.name)}&source=pharma-api`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <FileText className="h-4 w-4" aria-hidden="true" /> Enquire
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            {data.pages > 1 && (
              <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-slate-600">Page {page} of {data.pages}</span>
                <button type="button" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) })} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PharmaApiList;
