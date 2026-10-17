// Server-side SEO for every URL: title, description, canonical, social tags,
// structured data and a short plain-HTML summary for crawlers.
// Used by src/app/[[...slug]]/page.jsx (generateMetadata + the page body).
//
// Static pages come from the same lists the Vite site used (seoPages, SOLUTIONS);
// product and press pages are looked up from the API.
import { seoPages } from '../components/pages/seoPages';
import { SOLUTIONS } from '../components/seo/solutionsData';
import { SITE_URL, SITE_NAME } from '../components/seo/organization';

export const DEFAULT_TITLE = `${SITE_NAME} | Industrial Pharma & Food Equipment Marketplace`;
export const DEFAULT_DESCRIPTION = seoPages.home.description;
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.foodpharmamachinery.com')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const DEMO_MATCH = /\/demo-products\//; // demo products (Backend/scripts/seed-demo-products.js) stay out of Google

const fullTitle = (t) => (!t ? DEFAULT_TITLE : t.toLowerCase().includes(SITE_NAME.toLowerCase()) ? t : `${t} | ${SITE_NAME}`);
const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const isId = (id) => /^[a-f0-9]{24}$/i.test(id || '');

// Public, indexable pages (same list scripts/prerender-meta.mjs used)
const EXISTING_ROUTES = new Set(['/', '/shop', '/about', '/products', '/career', '/press', '/track-order', '/contact', '/projects', '/solutions', '/privacy', '/bulk-quote', '/project-cost-calculator', '/pharma-api']);
export const STATIC_PAGES = (() => {
  const pages = Object.values(seoPages).filter((p) => EXISTING_ROUTES.has(p.path) || p.path.startsWith('/solutions/'));
  for (const s of SOLUTIONS) {
    if (!pages.some((p) => p.path === `/solutions/${s.slug}`)) pages.push({ path: `/solutions/${s.slug}`, title: s.title, description: s.intro });
  }
  return pages;
})();

const getJson = async (path) => {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 300 } }); // re-check every 5 minutes
    if (res.status === 404) return { notFound: true };
    if (!res.ok) return { error: true };
    return { data: await res.json() };
  } catch {
    return { error: true };
  }
};

const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(href && { item: `${SITE_URL}${href}` }) })),
});

// Returns { title, description, canonical, image, type, noindex, notFound, jsonLd[], summary }
export async function seoForPath(segments = []) {
  const path = `/${segments.map(decodeURIComponent).join('/')}`.replace(/\/+$/, '') || '/';

  // ── Product ──
  const product = path.match(/^\/shop\/([^/]+)$/);
  if (product) {
    if (!isId(product[1])) return { notFound: true };
    const { data, notFound } = await getJson(`/api/products/${product[1]}`);
    const p = data?.product;
    if (notFound || (data && !p)) return { notFound: true };
    if (!p) return { canonical: path }; // API unreachable: still give the right canonical URL
    const url = `${SITE_URL}/shop/${p._id}`;
    const text = plain(p.description);
    const categoryName = String(p.category || '').replace(/-/g, ' ');
    const images = (p.images || []).filter((u) => typeof u === 'string' && u).slice(0, 5);
    const price = Number(p.price) > 0 ? Number(p.price) : null;
    const inStock = Number(p.stock) > 0;
    const crumbs = [['Home', '/'], ['Shop', '/shop'], [p.name, null]];
    return {
      title: fullTitle(p.name),
      description: clip(text || `${p.name} for pharma and food manufacturing. Price, specifications and quote from ${SITE_NAME}.`, 158),
      canonical: url,
      image: images[0],
      type: 'product',
      noindex: images.some((u) => DEMO_MATCH.test(u)),
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          sku: String(p._id),
          brand: { '@type': 'Brand', name: SITE_NAME },
          ...(images.length && { image: images }),
          ...(text && { description: clip(text, 500) }),
          ...(p.category && { category: categoryName }),
          ...(price && {
            offers: {
              '@type': 'Offer',
              url,
              priceCurrency: 'INR',
              price,
              availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
              seller: { '@id': `${SITE_URL}/#organization` },
            },
          }),
        },
        breadcrumbLd(crumbs),
      ],
      summary: {
        crumbs,
        heading: p.name,
        image: images[0],
        lines: [
          price && `₹${price.toLocaleString('en-IN')}`,
          `${categoryName} · ${inStock ? 'In stock' : 'Out of stock'}`,
          text,
        ].filter(Boolean),
        list: (p.specifications || []).filter((s) => s?.key && s?.value).map((s) => `${s.key}: ${s.value}`),
        links: [[`/bulk-quote?product=${encodeURIComponent(p.name)}&id=${p._id}&source=product`, 'Request a bulk quote'], ['/shop', 'Browse all machines']],
      },
    };
  }

  // ── Pharma API (active pharmaceutical ingredient) ──
  const pharma = path.match(/^\/pharma-api\/([^/]+)$/);
  if (pharma) {
    if (!/^[a-z0-9-]{1,100}$/.test(pharma[1])) return { notFound: true };
    const { data, notFound } = await getJson(`/api/pharma-apis/${pharma[1]}`);
    const a = data?.item;
    if (notFound || (data && !a)) return { notFound: true };
    if (!a) return { canonical: path };
    const url = `${SITE_URL}/pharma-api/${a.slug}`;
    const crumbs = [['Home', '/'], ['Pharma APIs', '/pharma-api'], [a.name, null]];
    const facts = [
      a.chemicalName && `Chemical name: ${a.chemicalName}`,
      a.casNumber && `CAS number: ${a.casNumber}`,
      a.molecularFormula && `Molecular formula: ${a.molecularFormula}`,
      a.molecularWeight && `Molecular weight: ${a.molecularWeight}`,
      a.composition && `Composition: ${a.composition}`,
      a.grades?.length && `Grades: ${a.grades.join(', ')}`,
    ].filter(Boolean);
    return {
      title: fullTitle(`${a.name}${a.casNumber ? ` (CAS ${a.casNumber})` : ''} – API Supplier`),
      description: clip([a.name, a.chemicalName && `(${a.chemicalName})`, a.casNumber && `CAS ${a.casNumber}`, a.grades?.length && `${a.grades.join(', ')} grade`, a.category].filter(Boolean).join(' · ') + '. Composition, specifications, COA/MSDS and price on request.', 158),
      canonical: url,
      image: a.images?.[0],
      noindex: a.active === false,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: a.name,
          url,
          category: a.category,
          ...(a.images?.length && { image: a.images.slice(0, 5) }),
          description: clip(plain(a.description) || facts.join('. '), 500),
          ...(a.casNumber && { additionalProperty: [{ '@type': 'PropertyValue', name: 'CAS number', value: a.casNumber }] }),
          brand: { '@id': `${SITE_URL}/#organization` },
        },
        breadcrumbLd(crumbs),
      ],
      summary: {
        crumbs,
        heading: a.name,
        image: a.images?.[0],
        lines: [a.category, ...facts, plain(a.description)].filter(Boolean),
        list: (a.specifications || []).filter((s) => s?.key && s?.value).map((s) => `${s.key}: ${s.value}`),
        links: [[`/bulk-quote?product=${encodeURIComponent(a.name)}&source=pharma-api`, 'Request a quotation'], ['/pharma-api', 'All pharma APIs']],
      },
    };
  }

  // ── Press article ──
  const press = path.match(/^\/press\/([^/]+)$/);
  if (press) {
    if (!isId(press[1])) return { notFound: true };
    const { data, notFound } = await getJson(`/api/press/${press[1]}`);
    const a = data?.pressRelease || data?.data || data?.press || (data?._id ? data : null);
    if (notFound || (data && !a) || (a && a.isActive === false)) return { notFound: true };
    if (!a) return { canonical: path };
    const url = `${SITE_URL}/press/${a._id}`;
    const text = plain(a.content);
    const image = (a.media || []).find((m) => m?.type === 'image' && m.url)?.url;
    const crumbs = [['Home', '/'], ['Press', '/press'], [a.title, null]];
    return {
      title: fullTitle(a.title),
      description: clip(plain(a.summary) || text || a.title, 158),
      canonical: url,
      image,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: clip(a.title, 110),
          ...(image && { image: [image] }),
          datePublished: new Date(a.publishedDate || Date.now()).toISOString(),
          dateModified: new Date(a.updatedAt || a.publishedDate || Date.now()).toISOString(),
          mainEntityOfPage: url,
          author: { '@id': `${SITE_URL}/#organization` },
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
        breadcrumbLd(crumbs),
      ],
      summary: { crumbs, heading: a.title, image, lines: [clip(text, 2000)], links: [['/press', 'More news']] },
    };
  }

  // ── Static pages ──
  const page = STATIC_PAGES.find((p) => p.path === path);
  if (page) {
    return {
      title: fullTitle(page.title),
      description: page.description || DEFAULT_DESCRIPTION,
      canonical: `${SITE_URL}${path === '/' ? '/' : path}`,
      summary: {
        heading: path === '/' ? `${SITE_NAME} — pharma & food processing machinery` : page.title,
        lines: [page.description],
        links: [['/shop', 'Shop'], ['/solutions', 'Solutions'], ['/bulk-quote', 'Bulk quote'], ['/contact', 'Contact']],
      },
    };
  }

  // A solution page that doesn't exist
  if (/^\/solutions\/[^/]+$/.test(path)) return { notFound: true };

  // Other pages the app has (login, cart, dashboard…): the site defaults, no canonical
  if (APP_ROUTES.some((re) => re.test(path))) return {};

  // Anything else is a real 404 (not a "soft 404" page answering 200 OK)
  return { notFound: true };
}

// Every route in src/App.jsx (keep in sync when adding pages)
const APP_ROUTES = [
  /^\/$/, /^\/about$/, /^\/contact$/, /^\/shop$/, /^\/products$/, /^\/products\/[^/]+$/, /^\/categories\/[^/]+$/,
  /^\/press$/, /^\/projects$/, /^\/career$/, /^\/solutions$/, /^\/resources\/[^/]+$/, /^\/privacy$/, /^\/bulk-quote$/,
  /^\/track-order$/, /^\/project-cost-calculator$/, /^\/pharma-api$/, /^\/search$/, /^\/login$/, /^\/register$/, /^\/forgotpassword$/, /^\/resetpassword\/[^/]+$/,
  /^\/cart$/, /^\/checkout$/, /^\/wishlist$/, /^\/dashboard(\/.*)?$/,
];
