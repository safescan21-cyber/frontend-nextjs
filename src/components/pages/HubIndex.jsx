'use client';
// /pharma-machinery-supplier: list of pharma hubs with their own page
import { MapPin } from 'lucide-react';
import { Link } from '../../shell/router';

export default function HubIndex({ hubs = [] }) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma machinery for India's pharma hubs</h1>
          <p className="mt-2 max-w-2xl text-orange-50">Machines, installation support, AMC and spares for plants across India, built at our factory in Haridwar.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map((h) => (
          <Link key={h.slug} to={`/pharma-machinery-supplier/${h.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-orange-400">
            <span className="flex items-center gap-1.5 text-lg font-bold text-slate-900"><MapPin className="h-5 w-5 text-orange-500" /> {h.city}</span>
            <span className="mt-1 block text-sm text-slate-500">{h.state}</span>
            <span className="mt-2 block text-sm text-slate-600">{h.area}</span>
          </Link>
        ))}
      </div>
      <p className="mx-auto max-w-5xl px-4 text-sm text-slate-600">
        Not listed? See <Link to="/machinery-supplier" className="font-semibold text-blue-600 hover:underline">machinery for every Indian state and union territory</Link>.
      </p>
    </div>
  );
}
