'use client';
// /spares: spare parts by machine model. A part shows here when it is in the "spares"
// category or lists the machine models it fits (admin product form: "Fits machine models").
//   /spares?model=ZP-35D    /spares?q=punch
import { useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { Link, useSearchParams } from '../../shell/router';
import { useFetchAllProductsQuery } from '../store/products/productsApi';
import { sizedImage } from '../../utlis/imageUrl';
import { rankProducts } from '../../utlis/productSearch';
import QuickQuote from '../quote/QuickQuote';
import LocalPrice from '../../i18n/LocalPrice';
import { useLocale } from '../../i18n/LocaleContext';

const API_PARAMS = { page: 1, limit: 1000 }; // same list as the shop (shared cache)
const isSpare = (p) => p.category === 'spares' || (Array.isArray(p.fitsModels) && p.fitsModels.length > 0);
const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function SparesPage() {
  const { t } = useLocale();
  const [params, setParams] = useSearchParams();
  const model = params.get('model') || '';
  const [q, setQ] = useState(params.get('q') || '');
  const { data, isLoading } = useFetchAllProductsQuery(API_PARAMS);

  const spares = useMemo(() => (data?.products || []).filter(isSpare), [data]);
  const models = useMemo(() => [...new Set(spares.flatMap((p) => p.fitsModels || []))].sort((a, b) => a.localeCompare(b)), [spares]);
  const shown = useMemo(() => {
    let list = model ? spares.filter((p) => (p.fitsModels || []).some((m) => m.toLowerCase() === model.toLowerCase())) : spares;
    const term = q.trim();
    if (term) list = rankProducts(list.map((p) => ({ ...p, description: `${p.description || ''} ${(p.fitsModels || []).join(' ')}` })), term);
    return list;
  }, [spares, model, q]);

  const pickModel = (m) => {
    const next = new URLSearchParams(params);
    if (m) next.set('model', m); else next.delete('model');
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Wrench className="h-3.5 w-3.5" /> {t('Spare parts')}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('Spare parts by machine model')}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{t('Punches, dies, seals, change parts and more. Pick your machine model to see the parts that fit, or ask us for any part.')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="sm:w-64">
              <span className="sr-only">{t('Machine model')}</span>
              <select value={model} onChange={(e) => pickModel(e.target.value)} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900">
                <option value="">{t('All machine models')}</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="relative flex-1">
              <span className="sr-only">{t('Search parts')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search parts, e.g. punch, seal, feeder')} className="w-full rounded-xl border-0 bg-white py-3 pl-9 pr-4 text-slate-900" />
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <p className="text-slate-500">{t('Loading parts…')}</p>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {spares.length === 0 ? t('Spare parts are being added. Tell us your machine model and part below and we will quote it.') : t('No listed part matches. Ask us below: we supply parts for most machines.')}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <Link key={p._id} to={`/shop/${p._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="h-44 bg-slate-100">
                  {p.images?.[0] && <img src={sizedImage(p.images[0], 480)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-slate-900 group-hover:text-blue-700">{p.name}</h2>
                  {(p.fitsModels || []).length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">{t('Fits')}: {p.fitsModels.slice(0, 6).join(', ')}{p.fitsModels.length > 6 ? '…' : ''}</p>
                  )}
                  <p className="mt-2 font-semibold text-blue-700">{Number(p.price) > 0 ? inr(p.price) : t('Price on request')} <LocalPrice inr={p.price} className="text-xs font-normal text-slate-500" /></p>
                  <p className="mt-1 text-xs text-slate-500">{Number(p.stock) > 0 ? t('In stock') : t('Made to order')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mx-auto mt-10 max-w-2xl">
          <QuickQuote id="quick-quote" machine={model ? `Spare part for ${model}` : 'Spare part'} key={model} />
        </div>
      </section>
    </div>
  );
}
