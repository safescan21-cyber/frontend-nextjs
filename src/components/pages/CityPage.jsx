'use client';
// /pharma-machinery-supplier/<city>: machines and support for a pharma hub. The
// installations list is real data from admin (clients in this state), shown when present.
import { MapPin, Truck, Wrench, ShieldCheck, FileText } from 'lucide-react';
import { Link } from '../../shell/router';
import { PRODUCT_DATA } from './productCategoryData';
import { CITY_HUBS } from '../seo/cityHubs';
import QuickQuote from '../quote/QuickQuote';
import { useLocale } from '../../i18n/LocaleContext';

const label = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function CityPage({ hub, installations = [] }) {
  const { t } = useLocale();
  const others = CITY_HUBS.filter((c) => c.slug !== hub.slug);
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><MapPin className="h-3.5 w-3.5" /> {hub.city}, {hub.state}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma machinery supplier in {hub.city}</h1>
          <p className="mt-3 max-w-3xl text-orange-50">{hub.intro}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Machines for plants in {hub.area}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(PRODUCT_DATA).map(([slug, c]) => (
              <Link key={slug} to={`/products/${slug}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-400">
                <span className="font-semibold text-slate-900">{c.title || label(slug)}</span>
                <span className="mt-1 block text-xs text-slate-500">{c.products?.length || 0} models</span>
              </Link>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-bold text-slate-900">How we work with plants in {hub.city}</h2>
          <ol className="mt-4 space-y-3">
            {[
              [FileText, 'Quotation', 'Tell us your product, output and budget. We send a written quotation with specifications, delivery time and terms.'],
              [Truck, 'Manufacturing & dispatch', `Your machine is built and tested at our Haridwar factory, then packed and shipped to ${hub.city}.`],
              [Wrench, 'Installation & training', 'Installation, commissioning and operator training at your site can be arranged with the order.'],
              [ShieldCheck, 'Service, AMC & spares', 'Service requests, annual maintenance contracts and spare parts after installation.'],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
              </li>
            ))}
          </ol>

          {installations.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold text-slate-900">Our installations in {hub.state}</h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-white shadow-sm">
                {installations.map((c) => (
                  <li key={c._id} className="p-3 text-sm text-slate-700">{[c.machine, c.city, c.year].filter(Boolean).join(' · ') || c.title}</li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-8 text-sm text-slate-600">
            <Link to="/pharma-machinery" className="font-semibold text-blue-600 hover:underline">All pharma machinery</Link> · <Link to="/spares" className="font-semibold text-blue-600 hover:underline">Spare parts</Link> · <Link to="/amc" className="font-semibold text-blue-600 hover:underline">AMC</Link> · <Link to="/service-request" className="font-semibold text-blue-600 hover:underline">Service request</Link> · <Link to="/factory" className="font-semibold text-blue-600 hover:underline">Our factory</Link> · <Link to="/project-cost-calculator" className="font-semibold text-blue-600 hover:underline">Plant cost calculator</Link>
          </p>
        </div>

        <aside className="space-y-6">
          <QuickQuote id="quick-quote" machine="" city={hub.city} />
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase text-slate-500">{t('Other pharma hubs')}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {others.map((c) => <li key={c.slug}><Link to={`/pharma-machinery-supplier/${c.slug}`} className="text-blue-600 hover:underline">{c.city}, {c.state}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
