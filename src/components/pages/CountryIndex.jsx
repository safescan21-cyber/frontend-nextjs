'use client';
// /export: every country with its own export page, grouped by region
import { Globe } from 'lucide-react';
import { Link } from '../../shell/router';
import { COUNTRIES, REGIONS } from '../seo/countries';

export default function CountryIndex() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma & food machinery exporter from India</h1>
          <p className="mt-2 max-w-2xl text-orange-50">Machines built and tested at our factory in Haridwar, packed for export and supplied with documents, installation support and spares. Choose your country.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-8">
        {Object.entries(REGIONS).map(([key, region]) => {
          const list = COUNTRIES.filter((c) => c.region === key);
          if (!list.length) return null;
          return (
            <section key={key}>
              <h2 className="mt-8 flex items-center gap-2 text-xl font-bold text-slate-900"><Globe className="h-5 w-5 text-orange-500" aria-hidden="true" /> {region.name.replace(/^the /, '').replace(/^./, (s) => s.toUpperCase())}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3 lg:grid-cols-4">
                {list.map((c) => <li key={c.slug}><Link to={`/export/${c.slug}`} className="text-blue-600 hover:underline">{c.name}</Link></li>)}
              </ul>
            </section>
          );
        })}
        <p className="mt-8 text-sm text-slate-600">
          In India: <Link to="/machinery-supplier" className="font-semibold text-blue-600 hover:underline">machinery for every state and union territory</Link>
        </p>
      </div>
    </div>
  );
}
