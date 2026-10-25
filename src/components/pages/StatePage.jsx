'use client';
// /machinery-supplier/<state>: pharma and food machinery for one Indian state or union
// territory (components/seo/indiaStates.js). The installations list is real data from admin
// (clients in this state), shown when present.
import { MapPin, Truck, Wrench, ShieldCheck, FileText, Factory, Wheat, Building2, ClipboardCheck } from 'lucide-react';
import { Link } from '../../shell/router';
import { INDIA_STATES, stateLines, stateFaqs } from '../seo/indiaStates';
import { cityHub } from '../seo/cityHubs';
import QuickQuote from '../quote/QuickQuote';

export default function StatePage({ state, installations = [] }) {
  const lines = stateLines(state);
  const faqs = stateFaqs(state);
  const cities = (state.cities || []).map(cityHub).filter(Boolean);
  const others = INDIA_STATES.filter((s) => s.slug !== state.slug);
  const where = state.kind === 'state' ? `the state of ${state.name}` : `the union territory of ${state.name}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><MapPin className="h-3.5 w-3.5" /> {state.name}, India</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma & food machinery supplier in {state.name}</h1>
          <p className="mt-3 max-w-3xl text-orange-50">
            Machines for pharma and food plants in {where}, built and tested at our factory in Haridwar, with installation support, AMC and spares. {state.pharma}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Industry in {state.name}</h2>
          <ul className="mt-4 space-y-3">
            {state.pharma && (
              <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Factory className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Pharma.</strong> <span className="text-slate-600">{state.pharma}</span></span></li>
            )}
            <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Wheat className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Food processing.</strong> <span className="text-slate-600">{state.name} is known for {state.food}.</span></span></li>
            {state.corp && (
              <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Industrial estates.</strong> <span className="text-slate-600">Industrial plots and estates in {state.name} are developed by {state.corp}.</span></span></li>
            )}
          </ul>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Machine lines for {state.name}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lines.map((l) => (
              <Link key={l.key} to={l.to} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-400">
                <span className="text-xs font-semibold uppercase text-orange-700">{l.hub === 'pharma' ? 'Pharma' : 'Food'}</span>
                <span className="mt-0.5 block font-semibold text-slate-900">{l.form}</span>
                <span className="mt-1 block text-sm text-slate-600">{l.line}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            See all <Link to="/pharma-machinery" className="font-semibold text-blue-600 hover:underline">pharma machinery</Link> and <Link to="/food-machinery" className="font-semibold text-blue-600 hover:underline">food machinery</Link>, or the machines with prices in the <Link to="/shop" className="font-semibold text-blue-600 hover:underline">shop</Link>.
          </p>

          {cities.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold text-slate-900">Pharma hubs in {state.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {cities.map((c) => (
                  <Link key={c.slug} to={`/pharma-machinery-supplier/${c.slug}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-orange-400">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> {c.city}
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 text-xl font-bold text-slate-900">How we work with plants in {state.name}</h2>
          <ol className="mt-4 space-y-3">
            {[
              [FileText, 'Quotation', 'Tell us your product, output and budget. We send a written quotation with specifications, delivery time and terms.'],
              [Truck, 'Manufacturing & delivery', state.sea ? `Your machine is built and tested at our Haridwar factory, then shipped by road and sea to ${state.name}.` : `Your machine is built and tested at our Haridwar factory, then packed and sent by road to ${state.name}.`],
              [Wrench, 'Installation & training', 'Installation, commissioning and operator training at your site can be arranged with the order.'],
              [ShieldCheck, 'Service, AMC & spares', 'Service requests, annual maintenance contracts and spare parts after installation.'],
              [ClipboardCheck, 'Licences & documents', `Pharma plants in ${state.name} need a manufacturing licence from the state drugs control authority under the Drugs and Cosmetics Act, and food plants an FSSAI licence. We support GMP compliance with machine documentation and validation (IQ/OQ/PQ).`],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
              </li>
            ))}
          </ol>

          {installations.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold text-slate-900">Our installations in {state.name}</h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-white shadow-sm">
                {installations.map((c) => (
                  <li key={c._id} className="p-3 text-sm text-slate-700">{[c.machine, c.city, c.year].filter(Boolean).join(' · ') || c.title}</li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-10 text-xl font-bold text-slate-900">Questions from {state.name}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="rounded-xl bg-white p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-slate-900">{q}</summary>
                <p className="mt-2 text-sm text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <QuickQuote id="quick-quote" machine="" city={state.name} />
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase text-slate-500">Other states</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {others.map((s) => <li key={s.slug}><Link to={`/machinery-supplier/${s.slug}`} className="text-blue-600 hover:underline">{s.name}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
