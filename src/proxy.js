// Tells the root layout the page's language (<html lang dir>), from the country folder
// in the address: /fr/… -> fr, /ja/… -> ja, no folder -> en-IN. See i18n/locales.js.
// (Addresses without a folder are served from app/[locale] as /_in/… by the rewrite
// in next.config.mjs. Not here: behind nginx a rewrite to an absolute URL can name
// another host than the one Next.js listens on, and Next.js then proxies it as an
// outside site.)
import { NextResponse } from 'next/server';
import { splitLocale, localeInfo, DEFAULT_SEGMENT } from './i18n/locales';

const redirectTo = (request, pathname) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 301);
};

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const { locale, path } = splitLocale(pathname);

  // The search page used to link to /Search (capital S): old and shared links still work
  if (path === '/Search') return redirectTo(request, pathname.replace(/Search$/, 'search'));
  // The internal India folder is never a visible address
  const internal = `/${DEFAULT_SEGMENT}`;
  if (pathname === internal || pathname.startsWith(`${internal}/`)) return redirectTo(request, pathname.slice(internal.length) || '/');

  const info = localeInfo(locale);
  const headers = new Headers(request.headers);
  headers.set('x-site-lang', info.lang);
  headers.set('x-site-dir', info.dir || 'ltr');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only: not Next's own files, API routes or files with an extension (images, sitemap.xml…)
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
