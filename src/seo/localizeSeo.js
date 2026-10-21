// Country versions on the server: /fr/shop gets the /shop SEO from seoForPath, then
// its translated title/description, its own canonical, hreflang links to every
// version, and summary links that stay inside the same country folder.
import { SITE_URL, SITE_NAME } from '../components/seo/organization';
import { localePath, alternateUrls } from '../i18n/locales';
import { seoText } from '../i18n/seoText';

const withSiteName = (t) => (t.toLowerCase().includes(SITE_NAME.toLowerCase()) ? t : `${t} | ${SITE_NAME}`);

export function localizeSeo(seo, locale, path) {
  if (!seo || seo.notFound) return seo;
  const out = { ...seo };

  // Every indexable page lists all its language versions (India version included)
  if (seo.canonical && !seo.noindex) out.alternates = alternateUrls(SITE_URL, path);
  if (!locale) return out;

  const t = seoText(locale, path);
  if (t) {
    out.title = withSiteName(t.title);
    out.description = t.description;
  }
  if (seo.canonical) out.canonical = `${SITE_URL}${localePath(locale, path)}`;

  if (seo.summary) {
    const inLocale = (href) => (href && href.startsWith('/') ? localePath(locale, href) : href);
    out.summary = {
      ...seo.summary,
      ...(t && { heading: t.title.replace(/^Food Pharma Machinery \| /, ''), lines: [t.description] }),
      crumbs: seo.summary.crumbs?.map(([name, href]) => [name, inLocale(href)]),
      links: seo.summary.links?.map(([href, label]) => [inLocale(href), label]),
    };
  }
  return out;
}
