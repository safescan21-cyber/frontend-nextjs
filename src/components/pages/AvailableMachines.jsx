'use client';
// "Machines available for <place>": the shop machines on the state, industrial area and pharma hub
// pages (the page's server part picks them: machinesFor in components/seo/machineryHubs.js)
import { Link } from '../../shell/router';
import { useLocale } from '../../i18n/LocaleContext';
import MachineCards from './MachineCards';

export default function AvailableMachines({ place, machines = [] }) {
  const { t } = useLocale();
  if (!machines.length) return null;
  return (
    <>
      <h2 className="mt-10 text-xl font-bold text-slate-900">{t('Machines available for {place}', { place })}</h2>
      <p className="mt-1 text-sm text-slate-500">{t('In our shop now, delivered from Haridwar with installation support. Taxes and freight are quoted separately.')}</p>
      <MachineCards machines={machines} />
      <Link to="/products" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">{t('All products by category')} &rarr;</Link>
    </>
  );
}
