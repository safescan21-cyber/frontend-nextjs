'use client';
// Country/language of the current page for the React app. The app runs under the
// country folder (React Router basename '/fr', '/ja'…), so <Link to="/shop"> already
// stays inside it; components only need t() for text and formatLocal() for prices.
//
//   const { t, locale, info, formatLocal } = useLocale();
//   <h2>{t('Featured products')}</h2>
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localeInfo, localePath } from './locales';
import { MESSAGES } from './messages';
import { convertFromInr, formatMoney, setRates } from './currency';

const LocaleContext = createContext(null);

export function LocaleProvider({ locale = '', children }) {
  // Today's exchange rates (country versions only); re-render prices when they arrive
  const [ratesVersion, setRatesVersion] = useState(0);
  useEffect(() => {
    if (!locale) return undefined;
    let live = true;
    fetch('/api/fx')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && d?.rates) {
          setRates(d.rates);
          setRatesVersion((v) => v + 1);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [locale]);

  const value = useMemo(() => {
    const info = localeInfo(locale);
    const dict = MESSAGES[info.language] || null;
    // Unknown strings fall back to English; {name} placeholders are filled from vars
    const t = (text, vars) => {
      let out = (dict && dict[text]) || text;
      if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
      return out;
    };
    // Approximate price in the visitor's currency (null on the India site or without rates)
    const formatLocal = (inr) => {
      if (info.currency === 'INR' || !(inr > 0)) return null;
      const v = convertFromInr(inr, info.currency);
      return v == null ? null : formatMoney(v, info.currency, info.lang);
    };
    return { locale, info, t, formatLocal, href: (path) => localePath(locale, path) };
  }, [locale, ratesVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

const FALLBACK = { locale: '', info: localeInfo(''), t: (s) => s, formatLocal: () => null, href: (p) => p };

export const useLocale = () => useContext(LocaleContext) || FALLBACK;
