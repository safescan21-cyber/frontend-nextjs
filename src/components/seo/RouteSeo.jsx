import React from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../Seo';
import { seoPages } from '../pages/seoPages';

// Pages that must not appear in Google
const PRIVATE = ['/login', '/register', '/forgotpassword', '/resetpassword', '/cart', '/checkout', '/wishlist', '/dashboard', '/search'];

// These pages render their own <Seo>, so the default here would only duplicate tags
const OWN_SEO_EXACT = ['/', '/shop', '/about', '/track-order', '/products', '/solutions', '/privacy', '/bulk-quote'];
const OWN_SEO_PREFIX = ['/products/', '/solutions/', '/resources/', '/shop/', '/press/', '/pharma-api/'];

const titleCase = (slug) =>
  decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

// Default title / description / canonical for every route.
// Pages that render their own <Seo> (home, shop, products, solutions…) are skipped.
const RouteSeo = () => {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';

  if (OWN_SEO_EXACT.includes(path) || OWN_SEO_PREFIX.some((p) => path.startsWith(p))) return null;

  if (PRIVATE.some((p) => path === p || path.startsWith(`${p}/`))) {
    return <Seo title={titleCase(path.split('/')[1] || 'Account')} path={path} noindex />;
  }

  const known = Object.values(seoPages).find((p) => p.path === path);
  if (known) return <Seo {...known} />;

  const [, section, slug] = path.split('/');
  if (section === 'categories' && slug) {
    return <Seo title={`${titleCase(slug)} | Products`} description={`${titleCase(slug)} products and machinery from Food Pharma Machinery.`} path={path} />;
  }
  return null; // unknown pages render <NotFound />, which sets noindex itself
};

export default RouteSeo;
