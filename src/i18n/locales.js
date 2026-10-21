// Country / language versions of the site. Each lives under its own folder on the
// same domain (/fr/shop, /ja/shop…); the site without a folder is India (English, INR).
// Shared by the server (page.jsx, sitemap, proxy.js) and the browser app (spa.jsx).

export const LOCALES = {
  'en-us': { lang: 'en-US', hreflang: 'en-us', label: 'United States', short: 'US', flag: '🇺🇸', currency: 'USD', language: 'en' },
  'en-gb': { lang: 'en-GB', hreflang: 'en-gb', label: 'United Kingdom', short: 'UK', flag: '🇬🇧', currency: 'GBP', language: 'en' },
  fr: { lang: 'fr', hreflang: 'fr', label: 'France (Français)', short: 'FR', flag: '🇫🇷', currency: 'EUR', language: 'fr' },
  ja: { lang: 'ja', hreflang: 'ja', label: '日本 (日本語)', short: 'JP', flag: '🇯🇵', currency: 'JPY', language: 'ja' },
  ko: { lang: 'ko', hreflang: 'ko', label: '한국 (한국어)', short: 'KR', flag: '🇰🇷', currency: 'KRW', language: 'ko' },
  // Urdu: a language version (no country), written right to left; prices stay in INR
  ur: { lang: 'ur', hreflang: 'ur', label: 'اردو (Urdu)', short: 'اردو', flag: '🌐', currency: 'INR', language: 'ur', dir: 'rtl' },
};

// The default site (no folder)
export const DEFAULT_LOCALE = { lang: 'en-IN', hreflang: 'en-in', label: 'India (English)', short: 'IN', flag: '🇮🇳', currency: 'INR', language: 'en' };

export const LOCALE_CODES = Object.keys(LOCALES);

export const localeInfo = (code) => (code && LOCALES[code]) || DEFAULT_LOCALE;

// '/fr/shop/123' -> { locale: 'fr', path: '/shop/123' };  '/shop' -> { locale: '', path: '/shop' }
export const splitLocale = (pathname = '/') => {
  const m = String(pathname).match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)(.*)$/);
  if (m && LOCALES[m[1]]) return { locale: m[1], path: m[2] || '/' };
  return { locale: '', path: pathname || '/' };
};

// ('fr', '/shop') -> '/fr/shop';  ('fr', '/') -> '/fr';  ('', '/shop') -> '/shop'
export const localePath = (locale, path = '/') => {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!locale) return p;
  return p === '/' ? `/${locale}` : `/${locale}${p}`;
};

// hreflang alternates for one page: { 'en-in': url, 'en-us': url, …, 'x-default': url }
export const alternateUrls = (siteUrl, path) => {
  const out = { [DEFAULT_LOCALE.hreflang]: `${siteUrl}${path === '/' ? '/' : path}` };
  for (const code of LOCALE_CODES) out[LOCALES[code].hreflang] = `${siteUrl}${localePath(code, path)}`;
  out['x-default'] = out[DEFAULT_LOCALE.hreflang];
  return out;
};
