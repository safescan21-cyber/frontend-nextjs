// Country versions on the server: /fr/shop gets the /shop SEO from seoForPath, then
// its translated title/description, its own canonical, hreflang links to every
// version, and summary links that stay inside the same country folder.
import { SITE_URL, SITE_NAME } from '../components/seo/organization';
import { localePath, alternateUrls } from '../i18n/locales';
import { seoText, localizedText, brandTitle, fitDescription } from '../i18n/seoText';

const BRAND_SUFFIX = ` | ${SITE_NAME}`;

export function localizeSeo(seo, locale, path) {
  if (!seo || seo.notFound) return seo;
  const out = { ...seo };

  // Every indexable page lists all its language versions (India version included)
  if (seo.canonical && !seo.noindex) out.alternates = alternateUrls(SITE_URL, path);
  if (seo.description) out.description = fitDescription(seo.description);
  if (!locale) return out;

  // Translated text, or for the US/UK versions their own variant of the English text
  const t = seoText(locale, path);
  const text = localizedText(locale, path, seo.title?.endsWith(BRAND_SUFFIX) ? seo.title.slice(0, -BRAND_SUFFIX.length) : seo.title, seo.description);
  if (text.title) out.title = brandTitle(text.title);
  if (text.description) out.description = text.description;
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
