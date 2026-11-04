'use client';
// /machinery-supplier/<state>: pharma and food machinery for one Indian state or union
// territory (components/seo/indiaStates.js). The installations list is real data from admin
// (clients in this state), shown when present, and so are all the shop machines (the server
// part passes them).
import { MapPin, Truck, Wrench, ShieldCheck, FileText, Factory, Wheat, Building2, ClipboardCheck } from 'lucide-react';
import { Link } from '../../shell/router';
import { useLocale } from '../../i18n/LocaleContext';
import { INDIA_STATES, stateLines, stateFaqs } from '../seo/indiaStates';
import { cityHub } from '../seo/cityHubs';
import { CITY_NAME_HI, STATE_HI, stateCopyHi } from '../seo/indiaStatesHi';
import QuickQuote from '../quote/QuickQuote';
import AvailableMachines from './AvailableMachines';
import LocationMap from './LocationMap';
import { stateLocalNote } from '../seo/stateLanguages';

export default function StatePage({ state, installations = [], machines = [] }) {
  const { t, info } = useLocale();
  const hi = info.language === 'hi';
  const lines = stateLines(state);
  const cities = (state.cities || []).map(cityHub).filter(Boolean);
  const others = INDIA_STATES.filter((s) => s.slug !== state.slug);
  const where = state.kind === 'state' ? `the state of ${state.name}` : `the union territory of ${state.name}`;
  // All the words of the page, in English or Hindi (indiaStatesHi.js has the same fields)
  const c = hi ? stateCopyHi(state, lines.map((l) => t(l.form))) : {
    name: state.name,
    pharma: state.pharma,
    badge: `${state.name}, India`,
    h1: `Pharma & food machinery supplier in ${state.name}`,
    intro: `Machines for pharma and food plants in ${where}, built and tested at our factory in Haridwar, with installation support, AMC and spares.`,
    industry: `Industry in ${state.name}`,
    pharmaLabel: 'Pharma',
    foodLabel: 'Food processing',
    food: `${state.name} is known for ${state.food}.`,
    estatesLabel: 'Industrial estates',
    estates: `Industrial plots and estates in ${state.name} are developed by ${state.corp}.`,
    linesTitle: `Machine lines for ${state.name}`,
    lineTag: { pharma: 'Pharma', food: 'Food' },
    hubs: `Pharma hubs in ${state.name}`,
    how: `How we work with plants in ${state.name}`,
    steps: [
      ['Quotation', 'Tell us your product, output and budget. We send a written quotation with specifications, delivery time and terms.'],
      ['Manufacturing & delivery', state.sea ? `Your machine is built and tested at our Haridwar factory, then shipped by road and sea to ${state.name}.` : `Your machine is built and tested at our Haridwar factory, then packed and sent by road to ${state.name}.`],
      ['Installation & training', 'Installation, commissioning and operator training at your site can be arranged with the order.'],
      ['Service, AMC & spares', 'Service requests, annual maintenance contracts and spare parts after installation.'],
      ['Licences & documents', `Pharma plants in ${state.name} need a manufacturing licence from the state drugs control authority under the Drugs and Cosmetics Act, and food plants an FSSAI licence. We support GMP compliance with machine documentation and validation (IQ/OQ/PQ).`],
    ],
    installations: `Our installations in ${state.name}`,
    questions: `Questions from ${state.name}`,
    faqs: stateFaqs(state),
    others: 'Other states',
  };
  const stepIcons = [FileText, Truck, Wrench, ShieldCheck, ClipboardCheck];
  const local = stateLocalNote(state.slug);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><MapPin className="h-3.5 w-3.5" /> {c.badge}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{c.h1}</h1>
          <p className="mt-3 max-w-3xl text-orange-50">
            {c.intro} {c.pharma}
          </p>
          {local && <p lang={local.lang} dir={local.dir} className="mt-3 max-w-3xl rounded-lg bg-white/15 p-3 text-orange-50"><strong>{local.label}:</strong> {local.text}</p>}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">{c.industry}</h2>
          <ul className="mt-4 space-y-3">
            {c.pharma && (
              <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Factory className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">{c.pharmaLabel}.</strong> <span className="text-slate-600">{c.pharma}</span></span></li>
            )}
            <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Wheat className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">{c.foodLabel}.</strong> <span className="text-slate-600">{c.food}</span></span></li>
            {state.corp && (
              <li className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><Building2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" /><span><strong className="text-slate-900">{c.estatesLabel}.</strong> <span className="text-slate-600">{c.estates}</span></span></li>
            )}
          </ul>

          <h2 className="mt-10 text-xl font-bold text-slate-900">{c.linesTitle}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {lines.map((l) => (
              <Link key={l.key} to={l.to} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-orange-400">
                <span className="text-xs font-semibold uppercase text-orange-700">{c.lineTag[l.hub]}</span>
                <span className="mt-0.5 block font-semibold text-slate-900">{t(l.form)}</span>
                <span className="mt-1 block text-sm text-slate-600">{t(l.line)}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {hi ? (
              <>सभी <Link to="/pharma-machinery" className="font-semibold text-blue-600 hover:underline">फार्मा मशीनरी</Link> और <Link to="/food-machinery" className="font-semibold text-blue-600 hover:underline">फूड मशीनरी</Link> देखें, या <Link to="/shop" className="font-semibold text-blue-600 hover:underline">शॉप</Link> की हर मशीन।</>
            ) : (
              <>See all <Link to="/pharma-machinery" className="font-semibold text-blue-600 hover:underline">pharma machinery</Link> and <Link to="/food-machinery" className="font-semibold text-blue-600 hover:underline">food machinery</Link>, or every machine in the <Link to="/shop" className="font-semibold text-blue-600 hover:underline">shop</Link>.</>
            )}
          </p>

          <AvailableMachines place={c.name} machines={machines} />

          {state.slug === 'uttarakhand' && <LocationMap />}

          {cities.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold text-slate-900">{c.hubs}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {cities.map((hub) => (
                  <Link key={hub.slug} to={`/pharma-machinery-supplier/${hub.slug}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-orange-400">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> {hi ? CITY_NAME_HI[hub.slug] || hub.city : hub.city}
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 text-xl font-bold text-slate-900">{c.how}</h2>
          <ol className="mt-4 space-y-3">
            {c.steps.map(([title, text], i) => {
              const Icon = stepIcons[i];
              return (
              <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
              </li>
              );
            })}
          </ol>

          {installations.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-bold text-slate-900">{c.installations}</h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-xl bg-white shadow-sm">
                {installations.map((x) => (
                  <li key={x._id} className="p-3 text-sm text-slate-700">{[x.machine, x.city, x.year].filter(Boolean).join(' · ') || x.title}</li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-10 text-xl font-bold text-slate-900">{c.questions}</h2>
          <div className="mt-4 space-y-3">
            {c.faqs.map(([q, a]) => (
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
            <h2 className="text-sm font-bold uppercase text-slate-500">{c.others}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {others.map((s) => <li key={s.slug}><Link to={`/machinery-supplier/${s.slug}`} className="text-blue-600 hover:underline">{hi ? STATE_HI[s.slug].name : s.name}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
