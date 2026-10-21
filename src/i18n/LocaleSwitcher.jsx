'use client';
// Country / language picker. Switching loads the same page in the other version
// (/shop -> /fr/shop), so the server sends that version's title, text and hreflang.
import { useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLocale } from './LocaleContext';
import { LOCALES, DEFAULT_LOCALE, localePath } from './locales';

const OPTIONS = [['', DEFAULT_LOCALE], ...Object.entries(LOCALES)];

export default function LocaleSwitcher({ className = '', compact = false }) {
  const { locale, t } = useLocale();
  const { pathname, search } = useLocation(); // pathname is without the country folder

  const change = (e) => {
    const next = e.target.value;
    if (next === locale) return;
    window.location.assign(`${localePath(next, pathname)}${search}`);
  };

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t('Country and language')}</span>
      <select
        value={locale}
        onChange={change}
        className="cursor-pointer rounded bg-transparent py-0.5 pr-1 text-inherit focus:outline-none focus:ring-2 focus:ring-amber-400 [&>option]:text-slate-900"
      >
        {OPTIONS.map(([code, info]) => (
          <option key={code || 'in'} value={code}>
            {compact ? `${info.flag} ${info.short}` : `${info.flag} ${info.label}`}
          </option>
        ))}
      </select>
    </label>
  );
}
