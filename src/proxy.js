// Tells the root layout which language the page is in (<html lang>), from the country
// folder in the address: /fr/… -> fr, /ja/… -> ja, no folder -> en-IN. See i18n/locales.js.
import { NextResponse } from 'next/server';
import { splitLocale, localeInfo } from './i18n/locales';

export function proxy(request) {
  const headers = new Headers(request.headers);
  const info = localeInfo(splitLocale(request.nextUrl.pathname).locale);
  headers.set('x-site-lang', info.lang);
  headers.set('x-site-dir', info.dir || 'ltr');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only: not Next's own files, API routes or files with an extension (images, sitemap.xml…)
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
