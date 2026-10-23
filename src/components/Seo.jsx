import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocale } from '../i18n/LocaleContext';
import { localePath, alternateUrls } from '../i18n/locales';
import { localizedText, brandTitle, fitDescription } from '../i18n/seoText';

const SITE_URL = 'https://www.foodpharmamachinery.com';
const SITE_NAME = 'Food Pharma Machinery';
const DEFAULT_TITLE = `${SITE_NAME} | Pharma & Food Processing Machinery`; // as seo/pageSeo.js
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION =
  'Industrial pharma and food processing equipment: load cells, weighing scales, tablet presses, capsule fillers, packaging lines and genuine spares.';

// Always return a clean absolute URL (leading slash, no trailing slash except home)
const buildUrl = (path = '/') => {
  let p = String(path || '/').split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return `${SITE_URL}${p}`;
};

// Social/search images must be absolute URLs
const absoluteImage = (image) => {
  if (!image || typeof image !== 'string') return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

const cleanText = (text, max) =>
  String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/**
 * Per-page SEO.
 *
 *   <Seo
 *     title="Tablet Press Machines"
 *     description="Buy high-precision tablet press machines built to cGMP standards."
 *     path="/shop/tablet-press"
 *   />
 *
 * Private pages (cart, login, dashboard, search): add the `noindex` prop.
 * Product pages: pass type="product" and a Product object in `jsonLd`.
 */
const Seo = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}) => {
  // Country versions (/fr, /ja…): translated title/description when we have them,
  // their own address as canonical, and links to every language version
  const { locale, info } = useLocale();
  // The server already sends these tags (Next.js metadata, app/pageMeta.jsx); writing
  // them only after the page has loaded keeps them out of the server HTML twice
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const cleanPath = new URL(buildUrl(path)).pathname;
  // Same rules as the server (i18n/seoText.js), so these tags match the server's
  const text = localizedText(locale, cleanPath, cleanText(title, 200), cleanText(description, 1000));
  const fullTitle = text.title ? brandTitle(text.title) : DEFAULT_TITLE;
  const metaDescription = fitDescription(text.description || DEFAULT_DESCRIPTION);
  const url = buildUrl(localePath(locale, cleanPath));
  const languages = noindex ? null : alternateUrls(SITE_URL, cleanPath);
  const ogImage = absoluteImage(image);

  // Escape "<" so structured data can never break out of the <script> tag
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {!noindex && <link rel="canonical" href={url} />}
      {languages && Object.entries(languages).map(([lang, href]) => <link key={lang} rel="alternate" hrefLang={lang} href={href} />)}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:type" content={type === 'product' ? 'product' : type === 'article' ? 'article' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={info.lang.replace('-', '_')} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLdString && <script type="application/ld+json">{jsonLdString}</script>}
    </Helmet>
  );
};

export default Seo;