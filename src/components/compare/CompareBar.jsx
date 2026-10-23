'use client';
// Small bar at the bottom while machines are picked for comparison; hidden on the
// comparison page itself and in the dashboards.
import { GitCompare, X } from 'lucide-react';
import { Link, useLocation } from '../../shell/router';
import { useCompare, clearCompare, MAX_COMPARE } from '../../utlis/compare';
import { useLocale } from '../../i18n/LocaleContext';

export default function CompareBar() {
  const { t } = useLocale();
  const ids = useCompare();
  const { pathname } = useLocation();
  if (!ids.length || pathname === '/compare' || pathname.startsWith('/dashboard')) return null;
  return (
    // Phones: kept to the left, clear of the chat button on the right
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-start pl-4 pr-24 sm:justify-center sm:px-4 lg:bottom-6">
      <div className="flex items-center gap-2 rounded-full bg-slate-900 py-2 pl-4 pr-2 text-sm text-white shadow-2xl">
        <GitCompare className="h-4 w-4 text-orange-400" aria-hidden="true" />
        <span className="sm:hidden">{ids.length}/{MAX_COMPARE}</span>
        <span className="hidden sm:inline">{t('{n} of {max} machines picked', { n: ids.length, max: MAX_COMPARE })}</span>
        <Link to="/compare" className="rounded-full bg-orange-500 px-4 py-1.5 font-semibold hover:bg-orange-600">
          {t('Compare')}
        </Link>
        <button type="button" onClick={clearCompare} aria-label={t('Clear comparison')} className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
