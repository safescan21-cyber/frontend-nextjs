'use client';
// /export/<country>: pharma and food machinery exported from India to one country
// (components/seo/countries.js). General facts only; nothing claims customers there.
import { Globe, Truck, Wrench, ShieldCheck, FileText, Zap, Coins, Ship, ClipboardCheck } from 'lucide-react';
import { Link } from '../../shell/router';
import { COUNTRIES, REGIONS, countryRoute, countrySupply, countryFaqs } from '../seo/countries';
import { stateLines } from '../seo/indiaStates';
import QuickQuote from '../quote/QuickQuote';

export default function CountryPage({ country: c }) {
  const region = REGIONS[c.region];
  const lines = stateLines({ lines: region.lines });
  const faqs = countryFaqs(c);
  const neighbours = COUNTRIES.filter((x) => x.region === c.region && x.slug !== c.slug);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Globe className="h-3.5 w-3.5" /> {c.name} · {region.name}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma & food machinery exporter from India to {c.name}</h1>
          <p className="mt-3 max-w-3xl text-orange-50">
            Machines for pharma and food plants in {c.name}, built and tested at our factory in Haridwar, India, packed for export and supplied with documents, installation support and spares.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Supplying machines to {c.name}</h2>
          <ul className="mt-4 space-y-3">
            {[
              [Zap, 'Power supply', `Mains supply in ${c.name} is generally ${countrySupply(c)}. Motors and controls are built for your plant’s supply, confirmed before manufacturing.`],
              [c.landlocked || c.road ? Truck : Ship, 'Shipping', countryRoute(c)],
              [Coins, 'Currency', `Quotations in INR or USD${c.currency === 'USD' ? ` (${c.name} uses the US dollar)` : `; the local currency is ${c.currency}`}.`],
              ...(c.regulator ? [[ClipboardCheck, 'Medicines regulator', `Medicine manufacturing in ${c.name} is regulated by ${c.regulator}. We provide machine documentation and validation support (IQ/OQ/PQ) for GMP plants.`]] : []),
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span></li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Machine lines for {c.name}</h2>
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

          <h2 className="mt-10 text-xl font-bold text-slate-900">How an export order works</h2>
          <ol className="mt-4 space-y-3">
            {[
              [FileText, 'Quotation', 'Tell us your product, output and power supply. We send a written quotation with specifications, delivery time, freight and payment terms.'],
              [Wrench, 'Manufacturing & testing', 'Your machine is built and tested at our Haridwar factory; you can attend the factory acceptance test (FAT) in person or by video.'],
              [Truck, 'Export packing & documents', `Seaworthy packing with the export documents (commercial invoice, packing list, certificate of origin) for customs in ${c.name}.`],
              [ShieldCheck, 'Installation, service & spares', 'Installation and operator training on site or remotely, then service support and spare parts.'],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
              </li>
            ))}
          </ol>

          <h2 className="mt-10 text-xl font-bold text-slate-900">Questions from {c.name}</h2>
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
          <QuickQuote id="quick-quote" machine="" city={c.name} />
          {neighbours.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-bold uppercase text-slate-500">Other countries in {region.name}</h2>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                {neighbours.map((x) => <li key={x.slug}><Link to={`/export/${x.slug}`} className="text-blue-600 hover:underline">{x.name}</Link></li>)}
              </ul>
            </div>
          )}
          <Link to="/export" className="block text-sm font-semibold text-blue-600 hover:underline">All countries</Link>
        </aside>
      </div>
    </div>
  );
}
