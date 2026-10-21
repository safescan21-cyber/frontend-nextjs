// WebMCP tool definitions (read-only catalogue lookups). Registered in the browser by
// WebMcpTools.jsx and listed for crawlers in /.well-known/ai-catalog.json.
import getBaseURL from '../../utlis/baseURL';
import { SITE_URL } from '../seo/organization';

const API = () => getBaseURL().replace(/\/api\/?$/, '').replace(/\/$/, '');
const DEMO_MATCH = /\/demo-products\//;
const READ_ONLY = { readOnlyHint: true };

const getJson = async (path) => {
  const res = await fetch(`${API()}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`The catalogue is not available right now (HTTP ${res.status}).`);
  return res.json();
};
export const text = (s, n = 300) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

const machineSummary = (p) => ({
  name: p.name,
  url: `${SITE_URL}/shop/${p._id}`,
  category: p.category,
  priceINR: p.price,
  buyOnline: p.sellOnline !== false,
  demo: (p.images || []).some((i) => DEMO_MATCH.test(i)) || undefined,
  description: text(p.description),
});

const apiSummary = (a) => ({
  name: a.name,
  url: `${SITE_URL}/pharma-api/${a.slug}`,
  chemicalName: a.chemicalName,
  casNumber: a.casNumber,
  molecularFormula: a.molecularFormula,
  category: a.category,
  grades: a.grades,
  ...(a.sellOnline && a.unitPrice && { priceINR: a.unitPrice, unit: a.unit, minOrderQty: a.minOrderQty }),
  buyOnline: Boolean(a.sellOnline && a.unitPrice),
});

export const WEBMCP_TOOLS = [
  {
    name: 'find_machines',
    queries: ['Find a tablet press under 5 lakh rupees', 'Which capsule filling machines are available?'],
    description:
      'Search the Food Pharma Machinery catalogue of pharmaceutical and food processing machines (tablet presses, capsule fillers, mixers, tanks, packaging…). Returns names, prices in INR and page links. Use get_machine for full details.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Words to look for in the machine name, category or description, e.g. "tablet press". Leave empty to list all.' },
        category: { type: 'string', description: 'Optional category, e.g. "mixing".' },
        maxPriceINR: { type: 'number', description: 'Optional highest price in Indian rupees.' },
      },
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    async execute({ query = '', category = '', maxPriceINR } = {}) {
      const data = await getJson(`/api/products?limit=200${category ? `&category=${encodeURIComponent(category)}` : ''}`);
      const words = text(query, 100).toLowerCase().split(' ').filter(Boolean);
      const found = (data?.products || [])
        .filter((p) => words.every((w) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(w)))
        .filter((p) => !(maxPriceINR > 0) || p.price <= maxPriceINR)
        .slice(0, 20)
        .map(machineSummary);
      return { count: found.length, machines: found, note: found.some((m) => m.demo) ? 'Items marked demo are sample listings, not for sale.' : undefined };
    },
  },
  {
    name: 'get_machine',
    queries: ['What is the price and warranty of this machine?', 'Show the specifications of this mixer'],
    description: 'Get full details of one machine from find_machines: description, price, stock and specifications.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'The machine id: the last part of its page link (/shop/<id>).' } },
      required: ['id'],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    async execute({ id }) {
      const clean = String(id || '').split('/').pop();
      if (!/^[a-f0-9]{24}$/i.test(clean)) return { error: 'Unknown machine id.' };
      const data = await getJson(`/api/products/${clean}`);
      const p = data?.product;
      if (!p) return { error: 'Machine not found.' };
      return { ...machineSummary(p), description: text(p.description, 3000), stock: p.stock, origin: p.origin, documents: (p.documents || []).map((d) => d.name).filter(Boolean) };
    },
  },
  {
    name: 'find_pharma_apis',
    queries: ['Do you sell paracetamol API?', 'Find the API with CAS number 103-90-2'],
    description:
      'Search the pharma API (active pharmaceutical ingredient) catalogue by name, chemical name, CAS number or formula. Returns grades, prices per unit in INR where sold online, and page links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'API name, chemical name, CAS number or formula, e.g. "paracetamol" or "103-90-2". Leave empty to list all.' },
      },
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    async execute({ query = '' } = {}) {
      const q = text(query, 100);
      const data = await getJson(`/api/pharma-apis?limit=50${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      const items = (data?.items || []).map(apiSummary);
      return { count: items.length, apis: items, note: 'Orders containing APIs need a valid drug licence number at checkout.' };
    },
  },
  {
    name: 'get_pharma_api',
    queries: ['What grades of paracetamol are available?', 'What is the minimum order for this API?'],
    description: 'Get full details of one pharma API: identity, composition/assay, grades, form, minimum order and price.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The API slug: the last part of its page link (/pharma-api/<slug>), e.g. "paracetamol".' } },
      required: ['slug'],
      additionalProperties: false,
    },
    annotations: READ_ONLY,
    async execute({ slug }) {
      const clean = String(slug || '').split('/').pop().toLowerCase();
      if (!/^[a-z0-9-]{1,120}$/.test(clean)) return { error: 'Unknown API.' };
      const data = await getJson(`/api/pharma-apis/${clean}`);
      const a = data?.item;
      if (!a?.name) return { error: 'API not found.' };
      return { ...apiSummary(a), molecularWeight: a.molecularWeight, composition: text(a.composition, 2000), form: a.form, moq: a.moq };
    },
  },
];


// Forms that are WebMCP tools (toolname/tooldescription on the <form>). Spread onto the
// form: <form {...formTool('contact')}>. Search forms submit themselves when an agent
// uses them; the others are only filled in – the visitor checks and presses the button.
export const FORM_TOOLS = {
  search: {
    name: 'search_site',
    queries: ['Search for blister packing machines', 'Search the site for a lyophilizer'],
    description: 'Search the machine catalogue by name, category or model and open the results page.',
    page: '/',
    autoSubmit: true,
  },
  searchPage: {
    name: 'search_products',
    queries: ['Filter machines by category', 'Show stainless steel mixers'],
    description: 'Filter the machine list on the search page by name, category or colour.',
    page: '/search',
    autoSubmit: true,
  },
  pharmaApiSearch: {
    name: 'search_pharma_api_catalog',
    queries: ['Search APIs for ibuprofen', 'Find an API by formula C8H9NO2'],
    description: 'Search the pharma API list by API name, chemical name, CAS number or formula.',
    page: '/pharma-api',
    autoSubmit: true,
  },
  trackOrder: {
    name: 'track_order',
    queries: ['Where is my order?', 'Track order ORD-1760000000000-123'],
    description: 'Look up the delivery status of an order by its order ID (starts with ORD-).',
    page: '/track-order',
    autoSubmit: true,
  },
  contact: {
    name: 'send_contact_message',
    queries: ['Send a message to the sales team', 'Ask about installation support'],
    description: 'Fill in the contact form to send a message to the Food Pharma Machinery sales team. The visitor reviews it and presses Send.',
    page: '/contact',
  },
  bulkQuote: {
    name: 'request_bulk_quote',
    queries: ['Get a quote for 3 tablet presses', 'Request bulk pricing for machine spares'],
    description: 'Fill in a bulk quotation request: products and quantities, delivery place and date, and the buyer\'s contact details. The visitor reviews it and presses Submit.',
    page: '/bulk-quote',
  },
  newsletter: {
    name: 'subscribe_newsletter',
    queries: ['Subscribe me to new machine updates', 'Sign up for offers by email'],
    description: 'Fill in an email address to subscribe to new machine and offer updates. The visitor presses Subscribe.',
    page: '/',
  },
  testimonial: {
    name: 'submit_testimonial',
    queries: ['Write a testimonial about my capsule filler', 'Leave feedback for Food Pharma Machinery'],
    description: 'Fill in a customer testimonial about a machine or API bought from Food Pharma Machinery. The customer must tick the consent box and press Submit themselves.',
    page: '/testimonials',
  },
  review: {
    name: 'write_product_review',
    queries: ['Review this machine', 'Rate this product 5 stars'],
    description: 'Fill in a review of this product (needs a logged-in customer). The customer chooses the star rating and presses Submit.',
    page: '/shop/<id>',
  },
};

export const formTool = (key) => {
  const t = FORM_TOOLS[key];
  return { toolname: t.name, tooldescription: t.description, ...(t.autoSubmit && { toolautosubmit: '' }) };
};
