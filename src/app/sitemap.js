// /sitemap.xml — the site's public pages (products and press articles are in
// /sitemap-content.xml, built live by the API).
import { STATIC_PAGES } from '../seo/pageSeo';
import { SITE_URL } from '../components/seo/organization';

const priority = (p) => (p === '/' ? 1 : ['/shop', '/products', '/solutions'].includes(p) ? 0.9 : p.startsWith('/solutions/') ? 0.8 : 0.6);

// No lastmod: these pages don't change on every request, and a date that always
// says "now" teaches Google to ignore lastmod for the whole site.
export default function sitemap() {
  return STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path === '/' ? '/' : p.path}`,
    priority: priority(p.path),
  }));
}
