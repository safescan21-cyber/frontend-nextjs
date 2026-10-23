'use client';
// /amc: annual maintenance contracts. The plans are written by the admin
// (Dashboard → AMC plans); until there are any, the page offers a general AMC enquiry.
import { useState } from 'react';
import { ShieldCheck, Check, CalendarClock } from 'lucide-react';
import ServiceForm from '../service/ServiceForm';
import { useLocale } from '../../i18n/LocaleContext';

export default function AmcPage({ plans = [] }) {
  const { t } = useLocale();
  const [chosen, setChosen] = useState(plans.find((p) => p.highlight)?._id || plans[0]?._id || '');

  const pick = (id) => {
    setChosen(id);
    document.getElementById('amc-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><ShieldCheck className="h-3.5 w-3.5" /> AMC</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('Annual maintenance contract (AMC)')}</h1>
          <p className="mt-2 max-w-2xl text-blue-100">{t('Planned preventive maintenance and priority breakdown support for your machines, so production keeps running and audits go smoothly.')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {plans.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p._id} className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${p.highlight ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'}`}>
                {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">{t('Most chosen')}</span>}
                <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
                {p.summary && <p className="mt-1 text-sm text-slate-600">{p.summary}</p>}
                <p className="mt-3 text-lg font-bold text-blue-700">{p.priceText}</p>
                {p.visitsPerYear > 0 && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600"><CalendarClock className="h-4 w-4" /> {p.visitsPerYear} {t('preventive visits per year')}</p>
                )}
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />{f}</li>)}
                </ul>
                <button type="button" onClick={() => pick(p._id)} className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold ${chosen === p._id ? 'bg-blue-600 text-white' : 'border border-blue-600 text-blue-700 hover:bg-blue-50'}`}>
                  {chosen === p._id ? t('Selected') : t('Choose this plan')}
                </button>
              </div>
            ))}
          </div>
        )}

        <div id="amc-form" className="mx-auto mt-10 max-w-3xl scroll-mt-32">
          <h2 className="mb-3 text-xl font-bold text-slate-900">{plans.length ? t('Request your AMC') : t('Ask for an AMC quotation')}</h2>
          <ServiceForm type="amc" plans={plans} planId={chosen} />
        </div>
      </section>
    </div>
  );
}
