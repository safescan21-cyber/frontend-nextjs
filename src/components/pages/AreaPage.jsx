'use client';
// /industrial-areas/<slug>: pharma or food machinery for one industrial area in India
// (components/seo/industrialAreas.js). General facts only; nothing claims customers there.
import { MapPin, Truck, Wrench, ShieldCheck, FileText, Factory, Building2, ClipboardCheck } from 'lucide-react';
import { Link } from '../../shell/router';
import { INDUSTRIAL_AREAS, areaFaqs } from '../seo/industrialAreas';
import { INDIA_STATES, stateLines } from '../seo/indiaStates';
import { cityHub } from '../seo/cityHubs';
import QuickQuote from '../quote/QuickQuote';
import AvailableMachines from './AvailableMachines';

export default function AreaPage({ area: a, machines = [] }) {
  const lines = stateLines({ lines: a.lines });
  const faqs = areaFaqs(a);
  const state = INDIA_STATES.find((s) => s.name === a.state);
  const hub = a.hub ? cityHub(a.hub) : null;
  const nearby = INDUSTRIAL_AREAS.filter((x) => x.state === a.state && x.slug !== a.slug);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><MapPin className="h-3.5 w-3.5" /> {a.name}, {a.state}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{a.label} machinery for {a.name}</h1>
          <p className="mt-3 max-w-3xl text-orange-50">{a.note} Machines built and tested at our factory in Haridwar, with installation support, AMC and spares.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">About {a.name}</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Factory className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Industry.</strong> <span className="text-slate-600">{a.note}</span></span></li>
            {a.developer && (
              <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Developed by.</strong> <span className="text-slate-600">{a.developer === 'APMC' ? 'The market is run by the local Agricultural Produce Market Committee (APMC).' : `Industrial plots in ${a.state} are developed by ${a.developer}.`}</span></span></li>
            )}
            <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">Location.</strong> <span className="text-slate-600">{a.name} is in {state ? <Link to={`/machinery-supplier/${state.slug}`} className="font-semibold text-blue-600 hover:underline">{a.state}</Link> : a.state}{hub && <>, part of the <Link to={`/pharma-machinery-supplier/${hub.slug}`} className="font-semibold text-blue-600 hover:underline">{hub.city} pharma hub</Link></>}.</span></span></li>
          </ul>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Machine lines for {a.name}</h2>
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
            See all <Link to="/pharma-machinery" className="font-semibold text-blue-600 hover:underline">pharma machinery</Link> and <Link to="/food-machinery" className="font-semibold text-blue-600 hover:underline">food machinery</Link>, or every machine in the <Link to="/shop" className="font-semibold text-blue-600 hover:underline">shop</Link>.
          </p>

          <AvailableMachines place={a.name} machines={machines} />

          <h2 className="mt-10 text-xl font-bold text-slate-900">How we work with plants in {a.name}</h2>
          <ol className="mt-4 space-y-3">
            {[
              [FileText, 'Quotation', 'Tell us your product, output and budget. We send a written quotation with specifications, delivery time and terms.'],
              [Truck, 'Manufacturing & delivery', `Your machine is built and tested at our Haridwar factory, then packed and sent by road to ${a.name}.`],
              [Wrench, 'Installation & training', 'Installation, commissioning and operator training at your site can be arranged with the order.'],
              [ShieldCheck, 'Service, AMC & spares', 'Service requests, annual maintenance contracts and spare parts after installation.'],
              [ClipboardCheck, 'Licences & documents', a.kind === 'food' ? 'Food plants need an FSSAI licence; machines come in food-grade stainless steel with their documentation.' : 'Pharma plants need a state drug manufacturing licence; we support GMP compliance with machine documentation and validation (IQ/OQ/PQ).'],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
              </li>
            ))}
          </ol>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Questions from {a.name}</h2>
          <div className="mt-4 space-y-3">
            {faqs.map(([q, ans]) => (
              <details key={q} className="rounded-xl bg-white p-4 shadow-sm">
                <summary className="cursor-pointer font-semibold text-slate-900">{q}</summary>
                <p className="mt-2 text-sm text-slate-600">{ans}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <QuickQuote id="quick-quote" machine="" city={a.name} />
          {nearby.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-bold uppercase text-slate-500">Other areas in {a.state}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {nearby.map((x) => <li key={x.slug}><Link to={`/industrial-areas/${x.slug}`} className="text-blue-600 hover:underline">{x.name}</Link></li>)}
              </ul>
            </div>
          )}
          <Link to="/industrial-areas" className="block text-sm font-semibold text-blue-600 hover:underline">All industrial areas</Link>
        </aside>
      </div>
    </div>
  );
}
