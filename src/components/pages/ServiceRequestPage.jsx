'use client';
// /service-request: report a breakdown or book a service visit
import { Wrench, Phone } from 'lucide-react';
import ServiceForm from '../service/ServiceForm';
import { Link } from '../../shell/router';
import { useLocale } from '../../i18n/LocaleContext';

export default function ServiceRequestPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Wrench className="h-3.5 w-3.5" /> {t('Service')}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('Service request')}</h1>
          <p className="mt-2 text-orange-50">{t('Machine stopped or not running right? Tell us what happens and our service team will call you.')}</p>
          <a href="tel:+918700792607" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"><Phone className="h-4 w-4" /> {t('Urgent? Call +91 87007 92607')}</a>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <ServiceForm type="service" />
        <p className="mt-4 text-sm text-slate-600">
          {t('Want planned maintenance instead?')} <Link to="/amc" className="font-semibold text-blue-600 hover:underline">{t('See our AMC plans')}</Link> · <Link to="/spares" className="font-semibold text-blue-600 hover:underline">{t('Find spare parts')}</Link>
        </p>
      </section>
    </div>
  );
}
