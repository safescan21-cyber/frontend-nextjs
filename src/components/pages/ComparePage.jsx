'use client';
// /compare: the machines picked with "Add to compare", side by side, with a PDF of the
// comparison to send on. Also opens from a shared link: /compare?ids=id1,id2,id3
import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, X, GitCompare } from 'lucide-react';
import { Link, useSearchParams } from '../../shell/router';
import { useFetchAllProductsQuery } from '../store/products/productsApi';
import { useCompare, removeFromCompare, clearCompare, toggleCompare, MAX_COMPARE } from '../../utlis/compare';
import { machineFacts, downloadComparison } from '../../utlis/specSheet';
import { sizedImage } from '../../utlis/imageUrl';
import { useLocale } from '../../i18n/LocaleContext';

const API_PARAMS = { page: 1, limit: 1000 }; // same list as the shop page (shared cache)

export default function ComparePage() {
  const { t } = useLocale();
  const picked = useCompare();
  const [params] = useSearchParams();
  const { data, isLoading } = useFetchAllProductsQuery(API_PARAMS);
  const [making, setMaking] = useState(false);

  // A shared link (?ids=…) fills the comparison on this device
  useEffect(() => {
    const shared = (params.get('ids') || '').split(',').filter((id) => /^[a-f0-9]{24}$/i.test(id)).slice(0, MAX_COMPARE);
    if (shared.length && shared.join() !== picked.join()) {
      clearCompare();
      shared.forEach((id) => toggleCompare(id));
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const products = useMemo(() => {
    const all = data?.products || [];
    return picked.map((id) => all.find((p) => p._id === id)).filter(Boolean);
  }, [data, picked]);

  const facts = products.map((p) => new Map(machineFacts(p)));
  const keys = [...new Set(facts.flatMap((m) => [...m.keys()]))];
  const shareLink = products.length ? `https://www.foodpharmamachinery.com/compare?ids=${products.map((p) => p._id).join(',')}` : '';

  const pdf = async () => {
    setMaking(true);
    try { await downloadComparison(products); } finally { setMaking(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <GitCompare className="h-7 w-7 text-orange-500" aria-hidden="true" /> {t('Compare machines')}
        </h1>

        {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>}

        {!isLoading && products.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">{t('No machines picked yet. Use “Add to compare” on up to {n} machines in the shop.', { n: MAX_COMPARE })}</p>
            <Link to="/shop" className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600">{t('Go to the shop')}</Link>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={pdf} disabled={making} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {making ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {t('Download comparison (PDF)')}
              </button>
              <button type="button" onClick={() => navigator.clipboard?.writeText(shareLink)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-400">
                {t('Copy link to this comparison')}
              </button>
              {products.length < MAX_COMPARE && (
                <Link to="/shop" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-400">{t('+ Add another machine')}</Link>
              )}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-44 bg-slate-50 p-3" />
                    {products.map((p) => (
                      <th key={p._id} className="border-l border-slate-100 p-3 text-left align-top">
                        <div className="relative">
                          <button type="button" onClick={() => removeFromCompare(p._id)} aria-label={`${t('Remove')} ${p.name}`} className="absolute right-0 top-0 rounded-full bg-white/90 p-1 text-slate-500 shadow hover:text-red-600">
                            <X className="h-4 w-4" />
                          </button>
                          {p.images?.[0] && <img src={sizedImage(p.images[0], 400)} alt={p.name} className="h-32 w-full rounded-lg bg-slate-100 object-cover" loading="lazy" />}
                          <Link to={`/shop/${p._id}`} className="mt-2 block font-bold text-slate-900 hover:text-orange-600">{p.name}</Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k} className="border-t border-slate-100">
                      <th scope="row" className="bg-slate-50 p-3 text-left font-semibold text-slate-700">{k}</th>
                      {facts.map((m, i) => <td key={products[i]._id} className="border-l border-slate-100 p-3 text-slate-800">{m.get(k) ?? '—'}</td>)}
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100">
                    <th scope="row" className="bg-slate-50 p-3" />
                    {products.map((p) => (
                      <td key={p._id} className="border-l border-slate-100 p-3">
                        <Link to={`/shop/${p._id}#quick-quote`} className="inline-block rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600">{t('Get a quote')}</Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
