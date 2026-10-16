import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.foodpharmamachinery.com';
const SITE_NAME = 'Food Pharma Machinery';
const DEFAULT_TITLE = `${SITE_NAME} | Industrial Pharma & Food Equipment Marketplace`;
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
  const cleanTitle = cleanText(title, 70);
  const fullTitle = !cleanTitle
    ? DEFAULT_TITLE
    : cleanTitle.toLowerCase().includes(SITE_NAME.toLowerCase())
      ? cleanTitle
      : `${cleanTitle} | ${SITE_NAME}`;

  const metaDescription = cleanText(description || DEFAULT_DESCRIPTION, 160) || DEFAULT_DESCRIPTION;
  const url = buildUrl(path);
  const ogImage = absoluteImage(image);

  // Escape "<" so structured data can never break out of the <script> tag
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {!noindex && <link rel="canonical" href={url} />}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:type" content={type === 'product' ? 'product' : type === 'article' ? 'article' : 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />
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