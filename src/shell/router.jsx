'use client';
// Links and navigation for the site's components, built on Next.js (next/link,
// next/navigation). Same names and use as the React Router pieces they replace:
//   <Link to="/shop">  <NavLink to="/dashboard" end className={({ isActive }) => …}>
//   const navigate = useNavigate(); navigate('/cart', { replace: true }); navigate(-1)
//   const { pathname, search } = useLocation();   const { id } = useParams();
//   const [params, setParams] = useSearchParams();  <Navigate to="/login" replace />
// Site addresses ('/shop') stay inside the visitor's country folder ('/fr/shop'), and
// useLocation().pathname is the address without that folder, as before.
import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { DEFAULT_SEGMENT, splitLocale } from '../i18n/locales';

// '/shop' -> '/fr/shop' on the French site; other links (https:, #, mailto:) unchanged
const useToHref = () => {
  const { href } = useLocale();
  return useCallback((to) => (typeof to === 'string' && to.startsWith('/') && !to.startsWith('//') ? href(to) : to), [href]);
};

// The page address without the country folder. (Next.js may report the internal
// /_in/… address on the server, see next.config.mjs.)
const usePagePath = () => {
  const raw = usePathname() || '/';
  const internal = `/${DEFAULT_SEGMENT}`;
  const visible = raw === internal || raw.startsWith(`${internal}/`) ? raw.slice(internal.length) || '/' : raw;
  return splitLocale(visible).path;
};

export const Link = forwardRef(function Link({ to, href, replace, state, ...rest }, ref) { // eslint-disable-line no-unused-vars
  const toHref = useToHref();
  // No prefetching: the pages are rendered per request, like before
  return <NextLink ref={ref} href={toHref(to ?? href)} replace={replace} prefetch={false} {...rest} />;
});

export const NavLink = forwardRef(function NavLink({ to, end, className, style, children, ...rest }, ref) {
  const path = usePagePath();
  const isActive = path === to || (!end && to !== '/' && path.startsWith(`${to}/`));
  const state = { isActive, isPending: false };
  return (
    <Link
      ref={ref}
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={typeof className === 'function' ? className(state) : className}
      style={typeof style === 'function' ? style(state) : style}
      {...rest}
    >
      {typeof children === 'function' ? children(state) : children}
    </Link>
  );
});

export const useNavigate = () => {
  const router = useRouter();
  const toHref = useToHref();
  return useCallback(
    (to, options = {}) => {
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      const target = toHref(to);
      if (options.replace) router.replace(target, { scroll: !options.preventScrollReset });
      else router.push(target, { scroll: !options.preventScrollReset });
    },
    [router, toHref],
  );
};

export const useLocation = () => {
  const pathname = usePagePath();
  const query = useNextSearchParams()?.toString() || '';
  return useMemo(() => {
    const search = query ? `?${query}` : '';
    return { pathname, search, hash: '', state: null, key: pathname + search };
  }, [pathname, query]);
};

// Route values from the folder names ([id], [slug]…); also includes `locale`
export const useParams = () => useNextParams() || {};

export const useSearchParams = () => {
  const params = useNextSearchParams();
  const router = useRouter();
  const setParams = useCallback(
    (next, options = {}) => {
      const current = new URLSearchParams(params?.toString() || '');
      const value = typeof next === 'function' ? next(current) : next;
      const qs = new URLSearchParams(value).toString();
      const path = window.location.pathname; // the address as shown, country folder included
      const target = qs ? `${path}?${qs}` : path;
      if (options.replace) router.replace(target, { scroll: false });
      else router.push(target, { scroll: false });
    },
    [params, router],
  );
  return [params || new URLSearchParams(), setParams];
};

export function Navigate({ to, replace }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
