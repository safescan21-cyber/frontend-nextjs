// /llms.txt — a short Markdown guide to the site for AI assistants (https://llmstxt.org).
// Pages come from the same list as /sitemap.xml; machines and pharma APIs are read live
// from the API (demo products stay out, like the sitemap).
import { STATIC_PAGES } from '../../seo/pageSeo';
import { SITE_URL, SITE_NAME, COMPANY } from '../../components/seo/organization';

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.foodpharmamachinery.com')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const DEMO_MATCH = /\/demo-products\//;

export const revalidate = 3600;

const line = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const clip = (s, n = 160) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const link = (title, path, about) => `- [${line(title)}](${SITE_URL}${path})${about ? `: ${clip(line(about))}` : ''}`;

const getJson = async (path) => {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

const MAIN = ['/', '/pharma-machinery', '/food-machinery', '/shop', '/products', '/pharma-api', '/solutions', '/bulk-quote', '/project-cost-calculator', '/contact'];

export async function GET() {
  const [prod, apis] = await Promise.all([getJson('/api/products?limit=100'), getJson('/api/pharma-apis?limit=100')]);
  const machines = (prod?.products || []).filter((p) => !(p.images || []).some((i) => DEMO_MATCH.test(i)));
  const apiItems = apis?.items || [];

  const page = (p) => link(p.title || (p.path === '/' ? `${SITE_NAME} home page` : p.path), p.path === '/' ? '/' : p.path, p.description);
  const main = MAIN.map((path) => STATIC_PAGES.find((p) => p.path === path)).filter(Boolean);
  const solutions = STATIC_PAGES.filter((p) => p.path.startsWith('/solutions/'));
  const other = STATIC_PAGES.filter((p) => !MAIN.includes(p.path) && !p.path.startsWith('/solutions/'));

  const out = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} (${COMPANY.legalName}, ${COMPANY.addressLocality}, India) supplies pharmaceutical and food processing machinery, pharma APIs (active pharmaceutical ingredients) and spares. Machines can be bought online or quoted on request; installation, validation and support are available across India and for export.`,
    '',
    `Prices are in Indian rupees (INR). Contact: ${COMPANY.telephone}, ${COMPANY.email}. Orders containing pharma APIs need a valid drug licence number at checkout.`,
    '',
    '## Main pages',
    ...main.map(page),
    '',
    '## Solutions',
    ...solutions.map(page),
  ];
  if (machines.length) out.push('', '## Machines', ...machines.map((p) => link(p.name, `/shop/${p._id}`, p.description)));
  if (apiItems.length) {
    out.push('', '## Pharma APIs', ...apiItems.map((a) => link(a.name, `/pharma-api/${a.slug}`, [a.chemicalName, a.casNumber && `CAS ${a.casNumber}`, a.grades?.length && `Grades: ${a.grades.join(', ')}`].filter(Boolean).join('; '))));
  }
  out.push(
    '',
    '## Optional',
    ...other.map(page),
    link('Sitemap', '/sitemap.xml', 'All public pages'),
    link('Products sitemap', '/sitemap-content.xml', 'Machines, pharma APIs and press articles'),
    link('AI catalog', '/.well-known/ai-catalog.json', 'Machine-readable list of the tools this site offers to AI agents'),
    '',
  );

  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
