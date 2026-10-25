// /sitemap.xml — the site's public pages (products and press articles are in
// /sitemap-content.xml, built live by the API).
import { STATIC_PAGES } from '../seo/pageSeo';
import { SITE_URL } from '../components/seo/organization';
import { LOCALE_CODES, localePath, alternateUrls } from '../i18n/locales';
import { getJson } from './serverData';

const priority = (p) => (p === '/' ? 1 : ['/shop', '/products', '/solutions'].includes(p) ? 0.9 : p.startsWith('/solutions/') || p === '/project-cost-calculator' ? 0.8 : 0.6);

// No lastmod: these pages don't change on every request, and a date that always
// says "now" teaches Google to ignore lastmod for the whole site.
// Each page is listed once per country version (/fr/shop, /ja/shop…), every entry
// naming all its versions (hreflang) so Google shows visitors the right one.
// Rebuilt hourly, so pages that depend on admin content come and go by themselves
export const revalidate = 3600;

export default async function sitemap() {
  // /factory says noindex until it has factory photos or client installations (admin);
  // a noindex page must not be listed here (the weekly SEO check flags it)
  const [photos, clients] = await Promise.all([getJson('/api/showcase?kind=photo', 3600), getJson('/api/showcase?kind=client', 3600)]);
  const factoryReady = Boolean(photos?.items?.length || clients?.items?.length);
  return STATIC_PAGES.filter((p) => p.path !== '/factory' || factoryReady).flatMap((p) => {
    // India-only pages (the state pages): one entry, no country versions
    if (p.indiaOnly) return [{ url: `${SITE_URL}${p.path}`, priority: 0.6 }];
    const languages = alternateUrls(SITE_URL, p.path);
    return ['', ...LOCALE_CODES].map((locale) => ({
      url: `${SITE_URL}${localePath(locale, p.path)}`,
      priority: locale ? Math.max(0.3, priority(p.path) - 0.2) : priority(p.path),
      alternates: { languages },
    }));
  });
}
