// Server-side SEO for every URL: title, description, canonical, social tags,
// structured data and a short plain-HTML summary for crawlers.
// Used by src/app/[[...slug]]/page.jsx (generateMetadata + the page body).
//
// Static pages come from the same lists the Vite site used (seoPages, SOLUTIONS);
// product and press pages are looked up from the API.
import { seoPages } from '../components/pages/seoPages';
import { SOLUTIONS, RESOURCES } from '../components/seo/solutionsData';
import { PRODUCT_DATA, categoryMachines } from '../components/pages/productCategoryData';
import { youtubeId, youtubeThumb } from '../utlis/youtube';
import { SITE_URL, SITE_NAME } from '../components/seo/organization';
import { brandTitle } from '../i18n/seoText';
import { CITY_PAGES } from '../components/seo/cityHubs';
import { STATE_PAGES, indiaState, stateLines, stateFaqs } from '../components/seo/indiaStates';
import { COUNTRY_PAGES, REGIONS, exportCountry, countryFaqs, countryRoute, countrySupply } from '../components/seo/countries';
import { AREA_PAGES, industrialArea, areaFaqs } from '../components/seo/industrialAreas';
import { HUB_PAGES, MACHINERY_HUBS, realMachines } from '../components/seo/machineryHubs';

export const DEFAULT_TITLE = `${SITE_NAME} | Pharma & Food Processing Machinery`;
export const DEFAULT_DESCRIPTION = seoPages.home.description;
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.foodpharmamachinery.com')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const fullTitle = (t) => (!t ? DEFAULT_TITLE : brandTitle(t)); // brand only when the title still fits
const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const isId = (id) => /^[a-f0-9]{24}$/i.test(id || '');

// Public, indexable pages (same list scripts/prerender-meta.mjs used)
const EXISTING_ROUTES = new Set(['/pcb-repair', '/', '/shop', '/about', '/products', '/career', '/press', '/track-order', '/contact', '/projects', '/solutions', '/privacy', '/bulk-quote', '/project-cost-calculator', '/pharma-api', '/testimonials', '/spares', '/amc', '/service-request', '/factory', '/pharma-machinery', '/food-machinery', '/pharma-machinery-supplier', '/pharma-plant-checklist']);
export const STATIC_PAGES = (() => {
  const pages = Object.values(seoPages).filter((p) => EXISTING_ROUTES.has(p.path) || p.path.startsWith('/solutions/'));
  pages.push(...HUB_PAGES, ...CITY_PAGES); // /pharma-machinery, /food-machinery, /pharma-machinery-supplier/<city>
  pages.push(...STATE_PAGES); // /machinery-supplier and /machinery-supplier/<state> (India only)
  pages.push(...COUNTRY_PAGES); // /export and /export/<country> (one version each)
  pages.push(...AREA_PAGES); // /industrial-areas and /industrial-areas/<area> (India only)
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

// FAQPage (questions the admin wrote for this machine) and VideoObject (its videos),
// only when the product has them
const productExtrasLd = (p, url, text) => {
  const out = [];
  const faqs = (p.faqs || []).filter((f) => f?.q && f?.a);
  if (faqs.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  (p.videos || []).filter((v) => typeof v === 'string' && v.includes('res.cloudinary.com')).slice(0, 3).forEach((v, i) => {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${p.name}${i ? ` – video ${i + 1}` : ''} in operation`,
      description: clip(text || `${p.name} running at ${SITE_NAME}.`, 300),
      thumbnailUrl: [v.replace(/\.\w+(\?.*)?$/, '.jpg').replace('/video/upload/', '/video/upload/so_1/')],
      contentUrl: v.replace(/\.(webm|ogv|mov|mkv|avi)(\?.*)?$/i, '.mp4'),
      uploadDate: new Date(p.updatedAt || p.createdAt || Date.now()).toISOString(),
      embedUrl: url,
    });
  });
  (p.videos || []).map(youtubeId).filter(Boolean).slice(0, 3).forEach((id) => {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: `${p.name} in operation`,
      description: clip(text || `${p.name} in operation.`, 300),
      thumbnailUrl: [youtubeThumb(id)],
      embedUrl: `https://www.youtube.com/embed/${id}`,
      uploadDate: new Date(p.updatedAt || p.createdAt || Date.now()).toISOString(),
    });
  });
  return out;
};

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
      // An approved Google description (SEO Health → drafts by our model) wins
      description: p.metaDescription || clip(text || `${p.name} for pharma and food manufacturing. Price, specifications and quote from ${SITE_NAME}.`, 158),
      canonical: url,
      image: images[0],
      type: 'product',
      jsonLd: [
        // Google only accepts a Product with a price or ratings ("Product snippets" in Search Console)
        price && {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          sku: String(p._id),
          brand: { '@type': 'Brand', name: SITE_NAME },
          ...(images.length && { image: images }),
          ...(text && { description: clip(text, 500) }),
          ...(p.category && { category: categoryName }),
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'INR',
            price,
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': `${SITE_URL}/#organization` },
          },
        },
        breadcrumbLd(crumbs),
        ...productExtrasLd(p, url, text),
      ].filter(Boolean),
      summary: {
        crumbs,
        heading: p.name,
        image: images[0],
        lines: [
          price && `₹${price.toLocaleString('en-IN')}`,
          `${categoryName} · ${inStock ? 'In stock' : 'Made to order'}`,
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
          '@type': 'ChemicalSubstance',
          name: a.name,
          url,
          category: a.category,
          ...(a.images?.length && { image: a.images.slice(0, 5) }),
          description: clip(plain(a.description) || facts.join('. '), 500),
          ...(a.casNumber && { additionalProperty: [{ '@type': 'PropertyValue', name: 'CAS number', value: a.casNumber }] }),
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

  // ── Testimonials: the real quotes as readable text for crawlers (no rating markup) ──
  if (path === '/testimonials') {
    const page = STATIC_PAGES.find((p) => p.path === path);
    const { data } = await getJson('/api/testimonials?limit=50');
    const items = Array.isArray(data?.items) ? data.items : [];
    return {
      title: fullTitle(page.title),
      description: page.description,
      canonical: `${SITE_URL}/testimonials`,
      summary: {
        crumbs: [['Home', '/'], ['Testimonials', null]],
        heading: 'Customer testimonials',
        lines: [page.description],
        list: items.map((t) => `“${clip(plain(t.quote), 400)}” — ${[t.name, t.role, t.company, t.city].filter(Boolean).join(', ')}`),
        links: [['/shop', 'Shop machinery'], ['/pharma-api', 'Pharma APIs'], ['/contact', 'Contact']],
      },
    };
  }

  // ── /pharma-machinery, /food-machinery: FAQs and the machines with prices, as on the page ──
  const hub = Object.values(MACHINERY_HUBS).find((h) => h.page.path === path);
  if (hub) {
    const { data } = await getJson('/api/products/?category=&color=&minPrice=0&maxPrice=&page=1&limit=1000');
    const products = realMachines(data?.products, hub.categories, hub.notFor);
    const faqs = hub.faqs(products);
    const crumbs = [['Home', '/'], [hub.crumb, null]];
    return {
      title: fullTitle(hub.page.title),
      description: hub.page.description,
      canonical: `${SITE_URL}${path}`,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
        ...(products.length
          ? [{
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: hub.machinesTitle,
              itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/shop/${p._id}`, name: p.name })),
            }]
          : []),
      ],
      summary: {
        crumbs,
        heading: hub.page.title,
        lines: [hub.page.description],
        list: products.map((p) => [p.name, Number(p.price) > 0 && `Rs. ${Number(p.price).toLocaleString('en-IN')}`].filter(Boolean).join(' – ')),
        links: [['/shop', 'Shop machinery'], ['/products', 'Machine categories'], ['/bulk-quote', 'Request a quote']],
      },
    };
  }

  // ── State pages (/machinery-supplier/<state>): India only, with their questions as FAQ data ──
  const statePath = path.match(/^\/machinery-supplier\/([^/]+)$/);
  if (statePath) {
    const state = indiaState(statePath[1]);
    if (!state) return { notFound: true };
    const page = STATE_PAGES.find((p) => p.path === path);
    const crumbs = [['Home', '/'], ['Machinery by state', '/machinery-supplier'], [state.name, null]];
    return {
      title: fullTitle(page.title),
      description: page.description,
      canonical: `${SITE_URL}${path}`,
      indiaOnly: true,
      hiVersion: true,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: stateFaqs(state).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
      summary: {
        crumbs,
        heading: page.title,
        lines: [page.description, state.pharma, `${state.name} is known for ${state.food}.`].filter(Boolean),
        list: stateLines(state).map((l) => `${l.form}: ${l.line}`),
        links: [['/machinery-supplier', 'All states'], ['/pharma-machinery', 'Pharma machinery'], ['/food-machinery', 'Food machinery'], ['/bulk-quote', 'Request a quote']],
      },
    };
  }

  // ── Country export pages (/export/<country>): one version, with their questions as FAQ data ──
  const countryPath = path.match(/^\/export\/([^/]+)$/);
  if (countryPath) {
    const c = exportCountry(countryPath[1]);
    if (!c) return { notFound: true };
    const page = COUNTRY_PAGES.find((p) => p.path === path);
    const crumbs = [['Home', '/'], ['Export', '/export'], [c.name, null]];
    return {
      title: fullTitle(page.title),
      description: page.description,
      canonical: `${SITE_URL}${path}`,
      indiaOnly: true,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: countryFaqs(c).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
      summary: {
        crumbs,
        heading: page.title,
        lines: [page.description, `Mains supply: ${countrySupply(c)}.`, countryRoute(c), c.regulator && `Medicines regulator: ${c.regulator}.`].filter(Boolean),
        list: REGIONS[c.region].lines.map((l) => stateLines({ lines: [l] })[0]).map((l) => `${l.form}: ${l.line}`),
        links: [['/export', 'All countries'], ['/pharma-machinery', 'Pharma machinery'], ['/food-machinery', 'Food machinery'], ['/bulk-quote', 'Request a quote']],
      },
    };
  }

  // ── Industrial area pages (/industrial-areas/<area>): India only, with their questions as FAQ data ──
  const areaPath = path.match(/^\/industrial-areas\/([^/]+)$/);
  if (areaPath) {
    const a = industrialArea(areaPath[1]);
    if (!a) return { notFound: true };
    const page = AREA_PAGES.find((p) => p.path === path);
    const crumbs = [['Home', '/'], ['Industrial areas', '/industrial-areas'], [a.name, null]];
    return {
      title: fullTitle(page.title),
      description: page.description,
      canonical: `${SITE_URL}${path}`,
      indiaOnly: true,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: areaFaqs(a).map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })),
        },
      ],
      summary: {
        crumbs,
        heading: page.title,
        lines: [page.description, a.note],
        list: stateLines({ lines: a.lines }).map((l) => `${l.form}: ${l.line}`),
        links: [['/industrial-areas', 'All industrial areas'], ['/machinery-supplier', 'Machinery by state'], ['/pharma-machinery', 'Pharma machinery'], ['/food-machinery', 'Food machinery']],
      },
    };
  }

  // ── Static pages ──
  const page = STATIC_PAGES.find((p) => p.path === path);
  if (page) {
    return {
      title: fullTitle(page.title),
      description: page.description || DEFAULT_DESCRIPTION,
      canonical: `${SITE_URL}${path === '/' ? '/' : path}`,
      ...(page.indiaOnly && { indiaOnly: true }),
      ...(page.hiVersion && { hiVersion: true }),
      summary: {
        heading: path === '/' ? `${SITE_NAME} — pharma & food processing machinery` : page.title,
        lines: [page.description],
        links: [['/shop', 'Shop'], ['/solutions', 'Solutions'], ['/bulk-quote', 'Bulk quote'], ['/contact', 'Contact']],
      },
    };
  }

  // A solution page that doesn't exist
  if (/^\/solutions\/[^/]+$/.test(path)) return { notFound: true };

  // ── Machine category pages (/products/tablet-press…): their own title and canonical,
  // so Google doesn't take them for copies of the home page ──
  const category = path.match(/^\/products\/([^/]+)$/);
  if (category) {
    const c = Object.hasOwn(PRODUCT_DATA, category[1]) ? PRODUCT_DATA[category[1]] : null;
    if (!c) return { notFound: true };
    const description = `${c.description} Get specifications and a quote.`;
    const { data } = await getJson('/api/products/?category=&color=&minPrice=0&maxPrice=&page=1&limit=1000');
    return {
      title: fullTitle(c.seoTitle || c.title),
      description,
      canonical: `${SITE_URL}${path}`,
      jsonLd: [breadcrumbLd([['Home', '/'], ['Products', '/products'], [c.title, null]])],
      summary: {
        crumbs: [['Home', '/'], ['Products', '/products'], [c.title, null]],
        heading: c.title,
        lines: [description],
        list: categoryMachines(data?.products, category[1]).map((m) => m.name),
        links: [['/shop', 'Shop machinery'], ['/bulk-quote', 'Request a quote'], ['/products', 'All categories']],
      },
    };
  }

  // ── Resource pages: kept out of Google (the app marks them noindex too) ──
  const resource = path.match(/^\/resources\/([^/]+)$/);
  if (resource) {
    const r = RESOURCES.find((x) => x.slug === resource[1]);
    if (!r) return { notFound: true };
    return { title: fullTitle(r.title), description: r.description, canonical: `${SITE_URL}${path}`, noindex: true };
  }

  // ── Old template category pages (/categories/…): not part of this catalogue ──
  if (/^\/categories\/[^/]+$/.test(path)) return { title: fullTitle('Product categories'), noindex: true };

  // Other pages the app has (login, cart, dashboard…): the site defaults, no canonical
  if (APP_ROUTES.some((re) => re.test(path))) return {};

  // Anything else is a real 404 (not a "soft 404" page answering 200 OK)
  return { notFound: true };
}

// Every route in src/App.jsx (keep in sync when adding pages)
const APP_ROUTES = [
  /^\/$/, /^\/about$/, /^\/contact$/, /^\/shop$/, /^\/products$/, /^\/products\/[^/]+$/, /^\/categories\/[^/]+$/,
  /^\/press$/, /^\/projects$/, /^\/career$/, /^\/solutions$/, /^\/resources\/[^/]+$/, /^\/privacy$/, /^\/bulk-quote$/,
  /^\/track-order$/, /^\/project-cost-calculator$/, /^\/pharma-api$/, /^\/testimonials$/, /^\/search$/, /^\/login$/, /^\/register$/, /^\/forgotpassword$/, /^\/resetpassword\/[^/]+$/,
  /^\/cart$/, /^\/checkout$/, /^\/wishlist$/, /^\/dashboard(\/.*)?$/,
];
