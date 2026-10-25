'use client';
// /machinery-supplier: every Indian state and union territory with its own page
import { MapPin } from 'lucide-react';
import { Link } from '../../shell/router';
import { INDIA_STATES } from '../seo/indiaStates';

const Group = ({ title, list }) => (
  <>
    <h2 className="mt-8 text-xl font-bold text-slate-900">{title}</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <Link key={s.slug} to={`/machinery-supplier/${s.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-900"><MapPin className="h-4 w-4 text-orange-500" /> {s.name}</span>
          <span className="mt-1 block text-sm text-slate-600">{s.pharma ? 'Pharma and food processing' : 'Food processing'}: {s.food}</span>
        </Link>
      ))}
    </div>
  </>
);

export default function StateIndex() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma & food machinery across India</h1>
          <p className="mt-2 max-w-2xl text-orange-50">Machines for pharma and food plants in every state and union territory, built and tested at our factory in Haridwar, with installation support, AMC and spares.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <Group title="States" list={INDIA_STATES.filter((s) => s.kind === 'state')} />
        <Group title="Union territories" list={INDIA_STATES.filter((s) => s.kind !== 'state')} />
        <p className="mt-8 text-sm text-slate-600">
          Pharma hub pages: <Link to="/pharma-machinery-supplier" className="font-semibold text-blue-600 hover:underline">Baddi, Ahmedabad, Hyderabad and more</Link>
        </p>
      </div>
    </div>
  );
}
