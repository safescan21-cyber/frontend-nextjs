// /sitemap.xml — the site's public pages (products and press articles are in
// /sitemap-content.xml, built live by the API).
import { STATIC_PAGES } from '../seo/pageSeo';
import { SITE_URL } from '../components/seo/organization';
import { LOCALE_CODES, localePath, alternateUrls } from '../i18n/locales';

const priority = (p) => (p === '/' ? 1 : ['/shop', '/products', '/solutions'].includes(p) ? 0.9 : p.startsWith('/solutions/') || p === '/project-cost-calculator' ? 0.8 : 0.6);

// No lastmod: these pages don't change on every request, and a date that always
// says "now" teaches Google to ignore lastmod for the whole site.
// Each page is listed once per country version (/fr/shop, /ja/shop…), every entry
// naming all its versions (hreflang) so Google shows visitors the right one.
export default function sitemap() {
  return STATIC_PAGES.flatMap((p) => {
    const languages = alternateUrls(SITE_URL, p.path);
    return ['', ...LOCALE_CODES].map((locale) => ({
      url: `${SITE_URL}${localePath(locale, p.path)}`,
      priority: locale ? Math.max(0.3, priority(p.path) - 0.2) : priority(p.path),
      alternates: { languages },
    }));
  });
}
