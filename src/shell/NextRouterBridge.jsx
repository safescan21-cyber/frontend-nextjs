'use client';
// Runs React Router on top of the Next.js router. The site's components keep using
// <Link>, useNavigate, useLocation, useParams and useSearchParams from
// react-router-dom, but the address comes from Next.js and every navigation goes
// through it, so Next.js pages (app/[locale]/…) and the older pages share one history.
import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Router, createPath } from 'react-router-dom';
import { DEFAULT_SEGMENT, localePath, splitLocale } from '../i18n/locales';

// Next.js routers have no history state; navigate(to, { state }) keeps it here for the
// page it was meant for (e.g. Login's "go back to where you were")
let pending = null;

// The address as visitors see it. (Server-side Next.js may report the internal
// /_in/… address the proxy rewrote to.)
const visiblePath = (pathname, locale) => {
  const internal = `/${DEFAULT_SEGMENT}`;
  const p = pathname === internal || pathname.startsWith(`${internal}/`) ? pathname.slice(internal.length) || '/' : pathname;
  return localePath(locale, splitLocale(p).path);
};

export default function NextRouterBridge({ locale = '', children }) {
  const router = useRouter();
  const pathname = visiblePath(usePathname() || '/', locale);
  const query = useSearchParams()?.toString() || '';

  const location = useMemo(() => {
    const search = query ? `?${query}` : '';
    const href = pathname + search;
    return { pathname, search, hash: '', state: pending?.href === href ? pending.state : null, key: href };
  }, [pathname, query]);

  const navigator = useMemo(() => {
    const go = (method, to, state, opts) => {
      const href = typeof to === 'string' ? to : createPath(to);
      pending = state == null ? null : { href: href.split('#')[0], state };
      router[method](href, { scroll: !opts?.preventScrollReset });
    };
    return {
      createHref: (to) => (typeof to === 'string' ? to : createPath(to)),
      encodeLocation: (to) => {
        const url = new URL(typeof to === 'string' ? to : createPath(to), 'http://x');
        return { pathname: url.pathname, search: url.search, hash: url.hash };
      },
      go: (n) => window.history.go(n),
      push: (to, state, opts) => go('push', to, state, opts),
      replace: (to, state, opts) => go('replace', to, state, opts),
    };
  }, [router]);

  return (
    <Router basename={locale ? `/${locale}` : '/'} location={location} navigator={navigator}>
      {children}
    </Router>
  );
}
