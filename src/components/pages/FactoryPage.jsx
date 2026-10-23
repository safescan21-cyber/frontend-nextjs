'use client';
// /factory: real photos of the workshop, team, testing and dispatch, client logos
// (only with permission) and installations by state. Everything comes from
// Dashboard → Factory & clients.
import { useState } from 'react';
import { Factory, MapPin, X } from 'lucide-react';
import { sizedImage } from '../../utlis/imageUrl';
import { Link } from '../../shell/router';
import { useLocale } from '../../i18n/LocaleContext';

export const SECTION_LABELS = {
  workshop: 'Workshop & manufacturing',
  testing: 'Machine testing (FAT)',
  quality: 'Quality checks',
  team: 'Our team',
  dispatch: 'Packing & dispatch',
  installation: 'Installation at customer sites',
};

// Installations grouped by state: { state, items[] }, most first
export const byState = (clients) => {
  const map = new Map();
  for (const c of clients) {
    const key = c.state || 'Other';
    map.set(key, [...(map.get(key) || []), c]);
  }
  return [...map.entries()].map(([state, items]) => ({ state, items })).sort((a, b) => b.items.length - a.items.length);
};

export default function FactoryPage({ photos = [], clients = [] }) {
  const { t } = useLocale();
  const [zoom, setZoom] = useState(null);
  const sections = Object.keys(SECTION_LABELS).map((k) => [k, photos.filter((p) => p.section === k)]).filter(([, list]) => list.length);
  const other = photos.filter((p) => !SECTION_LABELS[p.section]);
  const logos = clients.filter((c) => c.imageUrl);
  const states = byState(clients);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Factory className="h-3.5 w-3.5" /> {t('Our factory')}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('Our factory, team and installations')}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{t('PureLine Machinery, Haridwar (Uttarakhand). See where your machine is built and tested, and where our machines are running.')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {!photos.length && !clients.length && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t('Photos are being added. To visit the factory or see a machine running on video, contact us.')} <Link to="/contact" className="font-semibold text-blue-600 hover:underline">{t('Contact')}</Link></p>
        )}

        {[...sections, ...(other.length ? [['other', other]] : [])].map(([key, list]) => (
          <section key={key} className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t(SECTION_LABELS[key] || 'More photos')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <button key={p._id} type="button" onClick={() => setZoom(p)} className="group overflow-hidden rounded-xl bg-white text-left shadow-sm">
                  <img src={sizedImage(p.imageUrl, 480)} alt={p.title || t(SECTION_LABELS[key] || 'Factory photo')} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                  {p.title && <span className="block p-2 text-xs text-slate-600">{p.title}</span>}
                </button>
              ))}
            </div>
          </section>
        ))}

        {logos.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t('Some of our customers')}</h2>
            <div className="grid grid-cols-3 items-center gap-4 rounded-2xl bg-white p-6 sm:grid-cols-4 lg:grid-cols-6">
              {logos.map((c) => <img key={c._id} src={sizedImage(c.imageUrl, 240)} alt={c.title} title={c.title} loading="lazy" className="mx-auto max-h-14 w-auto object-contain grayscale transition hover:grayscale-0" />)}
            </div>
          </section>
        )}

        {states.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-1 text-xl font-bold text-slate-900">{t('Installations across India')}</h2>
            <p className="mb-4 text-sm text-slate-600">{clients.length} {t('installations listed in')} {states.length} {states.length === 1 ? t('state') : t('states')}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {states.map(({ state, items }) => (
                <div key={state} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="flex items-center gap-1.5 font-bold text-slate-900"><MapPin className="h-4 w-4 text-orange-500" /> {state} <span className="ml-auto rounded-full bg-orange-100 px-2 text-xs font-semibold text-orange-700">{items.length}</span></h3>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {items.slice(0, 8).map((c) => <li key={c._id}>{[c.machine, c.city, c.year].filter(Boolean).join(' · ') || c.title}</li>)}
                    {items.length > 8 && <li className="text-xs text-slate-400">+ {items.length - 8} {t('more')}</li>}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={zoom.title || 'Photo'} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setZoom(null)}>
          <button type="button" aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X className="h-6 w-6" /></button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={sizedImage(zoom.imageUrl, 1280)} alt={zoom.title || ''} className="max-h-[80vh] w-auto rounded-lg" />
            {zoom.title && <figcaption className="mt-2 text-center text-sm text-white">{zoom.title}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}
