// Every page lives under app/[locale]/…: /fr/shop is served as it is, and addresses
// without a country folder (India) are passed on as /_in/… (never visible to
// visitors). Also tells the root layout the page's language (<html lang dir>).
// See i18n/locales.js.
import { NextResponse } from 'next/server';
import { splitLocale, localeInfo, DEFAULT_SEGMENT } from './i18n/locales';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);

  // The search page used to link to /Search (capital S): old and shared links still work
  if (path === '/Search') {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/Search$/, 'search');
    return NextResponse.redirect(url, 301);
  }
  const info = localeInfo(locale);
  const headers = new Headers(request.headers);
  headers.set('x-site-lang', info.lang);
  headers.set('x-site-dir', info.dir || 'ltr');
  if (locale) return NextResponse.next({ request: { headers } });

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_SEGMENT}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Pages only: not Next's own files, API routes or files with an extension (images, sitemap.xml…)
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
