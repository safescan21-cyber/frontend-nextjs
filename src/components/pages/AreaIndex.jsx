'use client';
// /industrial-areas: pharma and food industrial areas in India with their own page, by state
import { MapPin } from 'lucide-react';
import { Link } from '../../shell/router';
import { INDUSTRIAL_AREAS } from '../seo/industrialAreas';
import { CITY_HUBS } from '../seo/cityHubs';

const KINDS = [['pharma', 'Pharma clusters'], ['food', 'Food processing areas'], ['both', 'Pharma & food areas']];

export default function AreaIndex() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma & food industrial areas in India</h1>
          <p className="mt-2 max-w-2xl text-orange-50">Machines for plants in India’s pharma clusters, food parks and industrial estates, built and tested at our factory in Haridwar, with installation support, AMC and spares.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="mt-8 text-xl font-bold text-slate-900">Pharma hubs</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CITY_HUBS.map((c) => (
            <Link key={c.slug} to={`/pharma-machinery-supplier/${c.slug}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-orange-400"><MapPin className="h-3.5 w-3.5 text-orange-500" /> {c.city}</Link>
          ))}
        </div>
        {KINDS.map(([kind, title]) => (
          <section key={kind}>
            <h2 className="mt-8 text-xl font-bold text-slate-900">{title}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRIAL_AREAS.filter((a) => a.kind === kind).map((a) => (
                <Link key={a.slug} to={`/industrial-areas/${a.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-900"><MapPin className="h-4 w-4 text-orange-500" /> {a.name}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase text-slate-500">{a.state}</span>
                  <span className="mt-1 block text-sm text-slate-600">{a.note}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-8 text-sm text-slate-600">
          <Link to="/machinery-supplier" className="font-semibold text-blue-600 hover:underline">Machinery by state</Link> · <Link to="/export" className="font-semibold text-blue-600 hover:underline">Export by country</Link>
        </p>
      </div>
    </div>
  );
}
