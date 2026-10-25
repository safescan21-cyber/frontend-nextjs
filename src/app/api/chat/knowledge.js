// What the chat assistant knows: real facts from the website and the database, searched for
// every question (retrieval) so the AI answers from them instead of guessing.
//   const facts = await findFacts('price of rotary tablet press', 6)
// Sources: machines and pharma APIs from the API (refreshed every 5 minutes; every shop
// machine, prices included), the FAQs / machine types / lines of /pharma-machinery and /food-machinery, the
// solutions and city pages, the site's pages and company facts.
import { MACHINERY_HUBS } from '../../../components/seo/machineryHubs';
import { CITY_HUBS } from '../../../components/seo/cityHubs';
import { SOLUTIONS } from '../../../components/seo/solutionsData';
// The pages that really exist (seoPages also lists old addresses that answer 404)
import { STATIC_PAGES } from '../../../seo/pageSeo';
import { PRODUCT_DATA } from '../../../components/pages/productCategoryData';
import { COMPANY_FACTS, PHONE, EMAIL } from './companyFacts';

const SITE = 'https://www.foodpharmamachinery.com';
const API = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.foodpharmamachinery.com').replace(/\/api\/?$/, '').replace(/\/$/, '');
const REFRESH_MS = 5 * 60 * 1000; // new admin answers reach the chat within 5 minutes

const plain = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);
const rs = (n) => `Rs. ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Words that say nothing about the topic
// ("sell", "offer", "provide"… and everyday Hindi words too: they never decide the answer)
const STOP = new Set(('a an the and or of to for in on at by with from is are was be do does did can could would should will i you we our your my me us it this that these those what which who how when why please hi hello hey need want looking about any some have has there their them they get give tell show know more much many also just than then so if not no yes ok thanks thank sir madam time long days ' +
  'sell sells selling sold offer offers offering provide provides providing supply supplies supplying available avail make makes kind type types list best good which one ones there here ' +
  'kya aap ap hai hain ho hum ke ki ka ko se mein me liye mujhe humko chahiye bechte bechta milega milta milti karte banate bataiye batao bhai ji').split(' '));
// Same meaning, one word (so "cost" finds "price")
const SAME = { cost: 'price', rate: 'price', rates: 'price', pricing: 'price', prices: 'price', quote: 'quotation', quotes: 'quotation', masala: 'spice', spices: 'spice', filler: 'filling', fill: 'filling', fillers: 'filling', packing: 'pack', packaging: 'pack', packer: 'pack', capsules: 'capsule', tablets: 'tablet', machines: 'machine', machinery: 'machine', equipment: 'machine', location: 'address', located: 'address', where: 'address', repair: 'service', breakdown: 'service', problem: 'service', noise: 'service', fault: 'service', amc: 'maintenance', whatsapp: 'contact', phone: 'contact', call: 'contact', number: 'contact', deliver: 'delivery', shipping: 'delivery', dispatch: 'delivery', export: 'delivery', lead: 'delivery', exports: 'delivery', abroad: 'delivery', overseas: 'delivery', international: 'delivery', ship: 'delivery', courier: 'delivery',
  mail: 'email', 'e-mail': 'email', guarantee: 'warranty', guaranty: 'warranty', cgmp: 'gmp', compliant: 'gmp', compliance: 'gmp', install: 'installation', installing: 'installation', commissioning: 'installation',
  spares: 'spare', parts: 'part', pay: 'payment', payments: 'payment', advance: 'payment', bill: 'invoice', gstin: 'gst', kitna: 'price', kitne: 'price', daam: 'price', dam: 'price', keemat: 'price', kimat: 'price', mashine: 'machine' };
// Plural to singular: presses -> press, batteries -> battery, machines -> machine
const singular = (w) => (w.length <= 3 ? w : w.endsWith('sses') ? w.slice(0, -2) : w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') ? w.slice(0, -1) : w);
const words = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/)
  .filter((w) => w.length > 1 && !STOP.has(w))
  .map((w) => SAME[w] || singular(w));

// ── Building the facts ──
const staticFacts = () => {
  // A company fact is the answer itself (no "Title: …" in front)
  const out = COMPANY_FACTS.map((f) => ({ ...f, answer: f.text, askWords: f.asks.map((a) => new Set(words(a))) }));
  for (const hub of Object.values(MACHINERY_HUBS)) {
    for (const f of hub.faqs([])) out.push({ title: f.q, text: f.a, answer: f.a, url: `${SITE}${hub.page.path}` });
    for (const t of hub.types) out.push({ title: `${t.name} (${hub.key} machinery)`, text: t.text, url: PRODUCT_DATA[t.slug] ? `${SITE}/products/${t.slug}` : `${SITE}${hub.page.path}` });
    for (const l of hub.lines) out.push({ title: `Machines needed for ${l.form}`, text: `A typical line for ${l.form.toLowerCase()}: ${l.line}. The exact list depends on the product and output.`, url: `${SITE}${l.to}` });
    for (const [t, text] of hub.tips) out.push({ title: `Buying tip (${hub.key} machinery): ${t}`, text, url: `${SITE}${hub.page.path}` });
  }
  for (const s of SOLUTIONS) out.push({ title: s.title, text: `${s.intro} Machines: ${(s.machines || []).join(', ')}. ${(s.points || []).join('. ')}`, url: `${SITE}/solutions/${s.slug}` });
  for (const c of CITY_HUBS) out.push({ title: `Pharma machinery supplier in ${c.city}, ${c.state}`, text: `${c.intro} We deliver from our Haridwar factory to ${c.area}, with installation support, AMC and spares.`, url: `${SITE}/pharma-machinery-supplier/${c.slug}` });
  for (const p of STATIC_PAGES) {
    if (p?.path && p.description && p.path !== '/') out.push({ title: p.title, text: p.description, url: `${SITE}${p.path}` });
  }
  return out;
};

const getJson = async (path) => {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

const liveFacts = async () => {
  const out = [];
  // Questions + answers written by the admin (Dashboard → Chatbot Training)
  const qa = (await getJson('/api/chat-qa'))?.items || [];
  for (const x of qa) if (x?.question && x?.answer) out.push({ title: x.question, text: x.answer, answer: x.answer, url: '', admin: true });
  const products = (await getJson('/api/products/?category=&color=&minPrice=0&maxPrice=&page=1&limit=1000'))?.products || [];
  for (const p of products) {
    if (!p?.name || p.active === false) continue;
    const specs = (p.specifications || []).filter((s) => s?.key && s?.value).slice(0, 8).map((s) => `${s.key}: ${s.value}`).join('; ');
    const facts = [
      `Category: ${PRODUCT_DATA[p.category]?.title || label(p.category)}`,
      p.modelNumber && `Model: ${p.modelNumber}`,
      p.manufacturer && `Manufacturer: ${p.manufacturer}`,
      p.origin && `Origin: ${label(p.origin)}`,
      Number(p.price) > 0 ? `Listed price: ${rs(p.price)} ex-works (GST, freight and installation extra)` : 'No listed price: contact for price on WhatsApp or ask for a quotation',
      Number(p.warranty) > 0 && `Warranty: ${p.warranty} months`,
      Number(p.stock) > 0 ? 'In stock' : 'Made to order',
      specs && `Specifications: ${specs}`,
      clip(plain(p.description), 300),
    ].filter(Boolean).join('. ');
    out.push({ title: `Machine: ${p.name}`, text: facts, url: `${SITE}/shop/${p._id}`, product: { id: String(p._id), name: p.name, price: Number(p.price) > 0 ? Number(p.price) : 0 } });
  }
  const apis = (await getJson('/api/pharma-apis?limit=500'))?.items || [];
  for (const a of apis) {
    out.push({
      title: `Pharma API: ${a.name}`,
      text: [a.chemicalName && `Chemical name: ${a.chemicalName}`, a.casNumber && `CAS: ${a.casNumber}`, a.grades?.length && `Grades: ${a.grades.join(', ')}`, a.category && `Category: ${a.category}`, 'Supplied with COA and MSDS; send an enquiry with the quantity.'].filter(Boolean).join('. '),
      url: `${SITE}/pharma-api/${a.slug}`,
    });
  }
  return out;
};

// ── Index: every fact as a bag of words, with BM25-style scoring ──
let index = null;
let builtAt = 0;
let building = null;

const build = async () => {
  const facts = [...staticFacts(), ...(await liveFacts())].map((f) => {
    const titleWords = words(f.title);
    // title words count twice; the ways customers ask it (company facts) count too
    const all = [...titleWords, ...titleWords, ...words((f.asks || []).join(' ')), ...words(f.text)];
    const tf = new Map();
    for (const w of all) tf.set(w, (tf.get(w) || 0) + 1);
    return { ...f, tf, len: all.length };
  });
  const df = new Map();
  for (const f of facts) for (const w of f.tf.keys()) df.set(w, (df.get(w) || 0) + 1);
  const avgLen = facts.reduce((s, f) => s + f.len, 0) / Math.max(1, facts.length);
  index = { facts, df, avgLen, n: facts.length };
  builtAt = Date.now();
  return index;
};

const getIndex = async () => {
  if (index && Date.now() - builtAt < REFRESH_MS) return index;
  if (!building) building = build().finally(() => { building = null; });
  // Old index while the new one builds (only the very first question waits)
  return index || building;
};

// Best facts for a question: [{ title, text, url, answer?, score }]
export const findFacts = async (question, limit = 6) => {
  const idx = await getIndex();
  const q = [...new Set(words(question))];
  // Words that appear nowhere in our data (a brand, a place we never mention…): no fact can answer those
  const missing = q.filter((w) => !idx.df.has(w));
  const unknown = missing.length;
  if (!q.length) return [];
  const k1 = 1.2;
  const b = 0.75;
  return idx.facts
    .map((f) => {
      let score = 0;
      let hits = 0; // how many of the question's words this fact contains
      let asked = 0; // how closely the question matches one of a company fact's own questions
      for (const w of q) {
        const tf = f.tf.get(w);
        if (!tf) continue;
        hits++;
        const idf = Math.log(1 + (idx.n - idx.df.get(w) + 0.5) / (idx.df.get(w) + 0.5));
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * f.len) / idx.avgLen)));
      }
      // Asked (almost) exactly like one of a company fact's questions: that fact, even when the
      // question's only word is a common one ("What machines do you sell?")
      if (f.askWords) {
        const qs = new Set(q);
        const best = Math.max(...f.askWords.map((a) => { const both = [...a].filter((w) => qs.has(w)).length; return both / (a.size + qs.size - both || 1); }));
        if (best >= 0.6) { score += 6 * best; hits = Math.max(hits, Math.round(best * q.length)); asked = best; }
      }
      // The admin's own answers win over automatic facts that match about as well, and a real
      // shop machine over a general description of its kind ("aerosol filling machine")
      if (f.admin || f.product) score *= 1.3;
      return { title: f.title, text: f.text, url: f.url, answer: f.answer, product: f.product, score, cover: hits / q.length, unknown, missing, known: q.length - unknown, asked, admin: f.admin };
    })
    .filter((f) => f.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);
};

// Facts as a block for the AI's instructions
export const factsBlock = (facts) =>
  facts.map((f, i) => `[${i + 1}] ${f.title}: ${f.text}${f.url ? ` (link: ${f.url})` : ''}`).join('\n');

// A question with no good fact goes on the admin's list (Dashboard → Chatbot Training), so
// someone can write the answer. Needs CHAT_LOG_KEY here and in the API's .env; never blocks the chat.
export const logMissedQuestion = (question) => {
  const key = process.env.CHAT_LOG_KEY;
  if (!key || !question) return;
  fetch(`${API}/api/chat-qa/missed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Chat-Log-Key': key },
    body: JSON.stringify({ question: String(question).slice(0, 300) }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {});
};

// When the visitor asks about price / a quotation / buying and a machine with a listed price
// is among the best facts, the chat offers an instant quotation (PDF) for it
const QUOTE_WORDS = new Set(['price', 'quotation', 'buy', 'purchase', 'order', 'invoice', 'proforma']);
export const quoteOffer = (facts, question) => {
  // A priced machine that is clearly what they asked about ("aerosol filling machine"): offer it too
  if (facts[0]?.product?.price > 0 && facts[0].cover >= 0.6 && !facts[0].unknown) return facts[0].product;
  if (!/\bhow much\b/i.test(question) && !words(question).some((w) => QUOTE_WORDS.has(w))) return null;
  // (a price/quotation question: the best priced machine among all the facts found)
  const f = facts.find((x) => x.product && x.product.price > 0 && x.cover >= 0.5);
  return f ? f.product : null;
};

// ── Checks on every AI reply before a customer sees it ──
// Any phone-like number (10+ digits with spaces, dashes or a + in between)
const PHONE_RE = /\+?\(?\d[\d\s()-]{8,}\d/g;
const MONEY_RE = /(?:₹|\brs\.?|\binr\b|\$|€)\s?\d|\d[\d,.]*\s?(?:lakh|lac|crore|million|thousand|k\b)/i;
const SITE_URL_RE = /https?:\/\/(?:www\.)?foodpharmamachinery\.com[^\s)\]>"']*/gi;
// A number with a technical unit: "7.5 kW", "1200 cans/hour", "15 days"…
const TECH_RE = /(\d[\d,.]*)\s?(?:-\s?\d[\d,.]*\s?)?(?:kw|kilowatt|hp|horse ?power|rpm|kg|tons?|tonnes?|mm|cm|metres?|meters?|litres?|liters?|ml|l\/h|lph|kva|volts?|v\b|amps?|bar|psi|°c|stations?|tablets?\/(?:h|hour|min)|capsules?\/(?:h|hour|min)|cans?\/(?:h|hour|min)|bottles?\/(?:h|hour|min)|pcs\/(?:h|hour|min)|per (?:hour|minute)|days?|weeks?|months?)\b/gi;
const CORE_PAGES = ['/', '/shop', '/contact', '/bulk-quote', '/about', '/amc', '/spares', '/service-request', '/pharma-machinery', '/food-machinery', '/factory', '/solutions', '/pharma-api', '/track-order'];
const digits = (s) => String(s).replace(/\D/g, '');

// Is the question about us at all? (greetings are fine)
export const isOffTopic = (facts, question) =>
  !/^\s*(hi|hello|hey|namaste|good (morning|afternoon|evening)|thanks|thank you)\b/i.test(question) && (!facts[0] || facts[0].score < 2);

// Returns the reply with wrong phone numbers and unknown links fixed, or null when it
// quotes a price the facts don't have (the caller then answers from the facts instead)
// The small model sometimes talks about its instructions or dodges: those replies are not used
// (only used when the facts do cover the question, so a dodge means the facts answer is better)
const BAD_REPLY = /\bFACTS\b|\bthe facts?\b|rather not guess|that's your call|my database|where on the website|found it\?|as an ai\b|I don'?t have (that|the|exact|any)|team (can|will) confirm|suggest WhatsApp or the quote form|need (a bit )?more (details|information)|is that right\?/i;
export const checkReply = (reply, facts) => {
  if (!reply || BAD_REPLY.test(reply)) return null;
  // A broken WhatsApp link ("wa.me/+91 87007 92607"): the right one
  reply = reply.replace(/https?:\/\/(?:api\.)?wa\.me\/[+\d\s-]*\d/gi, 'https://wa.me/918700792607');
  const known = facts.map((f) => f.text).join(' ');
  if (MONEY_RE.test(reply)) {
    const amounts = (reply.match(/\d[\d,.]{3,}/g) || []).map(digits).filter((d) => d.length >= 4);
    const knownAmounts = new Set((known.match(/\d[\d,.]{3,}/g) || []).map(digits));
    if (!/Listed price/.test(known) || !amounts.length || amounts.some((a) => !knownAmounts.has(a))) return null;
  }
  // Technical figures (power, speed, sizes, capacities, delivery days…) must come from the facts
  const knownNumbers = new Set((known.match(/\d[\d,.]*/g) || []).map(digits));
  for (const m of reply.matchAll(TECH_RE)) if (!knownNumbers.has(digits(m[1]))) return null;
  // A link the facts don't have means the model made something up: answer from the facts
  const allowed = new Set([...facts.map((f) => f.url), ...CORE_PAGES.map((p) => `${SITE}${p === '/' ? '' : p}`)].map((u) => u.toLowerCase().replace(/\/$/, '')));
  for (const u of reply.match(SITE_URL_RE) || []) {
    const clean = u.replace(/[.,;:!?]+$/, '').toLowerCase().replace(/\/$/, '').replace('://foodpharmamachinery', '://www.foodpharmamachinery');
    if (!allowed.has(clean)) return null;
  }
  if ((reply.match(/https?:\/\/[^\s)]+/gi) || []).some((u) => !/^https?:\/\/(www\.)?foodpharmamachinery\.com|^https?:\/\/wa\.me\//i.test(u))) return null;
  return reply
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, EMAIL) // an email the model made up ("sales@…"): ours
    .replace(PHONE_RE, (m) => (digits(m).length < 10 || digits(m).endsWith('8700792607') ? m : PHONE));
};

// Asked for our number and the reply leaves it out (the small model sometimes does): say it
const ASKS_NUMBER = /\b(phone|mobile|contact (no|number|details)|call you|whatsapp (no|number)|helpline)\b|\b(your|contact) (no|number)\b/i;
// …and the same for our email
const ASKS_EMAIL = /\b(e-?mail|mail id|email id|email address)\b/i;
export const withPhone = (reply, question) => {
  if (!reply) return reply;
  if (ASKS_EMAIL.test(question) && !reply.includes(EMAIL)) return `You can email us at ${EMAIL}, or call/WhatsApp ${PHONE}. You can also click the green WhatsApp button in this chat.`;
  if (ASKS_NUMBER.test(question) && !digits(reply).includes('8700792607')) return `You can call or WhatsApp us on ${PHONE}, use the contact form, or click the green WhatsApp button in this chat.`;
  return reply;
};

// A reply without any AI (when no AI service answers): the best fact, if it fits well enough
const GREETING = /^\s*(hi+|hello|hey|hii|namaste|namaskar|good (morning|afternoon|evening)|hola)\b[\s!.,]*$/i;
const THANKS = /^\s*(thanks?|thank you|thx|ok(ay)?|great|nice|cool)\b[\s!.,]*$/i;
// First sentences up to about n characters
const sentences = (text, n = 300) => {
  // (a dot inside an email or a link does not end the sentence)
  const parts = String(text).match(/(?:[^.!?]|[.!?](?=\S))+[.!?]+(\s|$)/g) || [String(text)];
  let out = '';
  for (const p of parts) {
    if (out && (out + p).length > n) break;
    out += p;
  }
  return clip(out.trim(), n + 40);
};

// Facts good enough to let the model answer; otherwise the honest facts-only reply is safer
export const factsCoverQuestion = (facts) => Boolean(facts[0] && facts[0].score >= 4 && facts[0].cover >= 0.5 && !facts[0].unknown);

export const isSmallTalk = (q) => GREETING.test(q) || THANKS.test(q);

// Asked like one of our company questions, or the admin wrote this exact answer: that answer
// as written is better than the model's retelling (it can't drop or add anything)
export const hasExactAnswer = (facts) => Boolean(facts[0]?.answer && !facts[0].unknown && (facts[0].asked >= 0.6 || (facts[0].admin && facts[0].cover >= 0.8)));

export const replyFromFacts = (facts, question = '') => {
  if (GREETING.test(question)) return "Hello! 👋 I'm Nova from Food Pharma Machinery. Ask me about our machines, prices, an instant quotation, spare parts or service – how can I help?";
  if (THANKS.test(question)) return "You're welcome! If you need anything else – a machine, a quotation or service – just ask, or tap the green WhatsApp button to talk to our team.";
  const asksPrice = words(question).includes('price') || /\bhow much\b/i.test(question);
  // Price asked: the priced shop machine among the best facts answers (the chat also shows its
  // quotation form), not a general description without a price
  const asksQuote = asksPrice || words(question).some((w) => QUOTE_WORDS.has(w));
  const priced = asksQuote && !facts[0]?.product?.price ? facts.find((f) => f.product?.price > 0 && f.cover >= 0.5) : null;
  const best = priced ? { ...priced, unknown: facts[0].unknown, missing: facts[0].missing, known: facts[0].known, score: Math.max(priced.score, facts[0].score) } : facts[0];
  // A fact only counts as the answer when it matches enough of the question; words we have
  // nothing about (a brand, a drug, a country…) may be at most half of the question
  if (!best || best.unknown > best.known || best.score < 2.5 || (best.cover < 0.5 && best.score < 6)) {
    return `I don't want to guess on that one. Our team will confirm it for you – tap the green WhatsApp button or call ${PHONE}. You can also ask for a quotation on any machine page.`;
  }
  // Say plainly what we found nothing about, then the closest fact
  const notFound = best.unknown ? `I couldn't find "${best.missing.join(' ')}" on our website, so our team will confirm that part. The closest I have:\n\n` : '';
  const name = best.title.replace(/^Machine: /, '');
  // (a shop machine gets room for its price and full specifications)
  const body = best.answer ? sentences(best.answer, 320) : `${name}: ${sentences(best.text, best.product ? 560 : 280)}`;
  // Price asked but the best fact has no listed price: say how to get one
  const priceNote = asksPrice && !/Listed price|Rs\. \d/.test(body)
    ? '\n\nFor the price, share your requirement on WhatsApp or the quote form and we will send it.'
    : '';
  return `${notFound}${body}${best.url ? `\n\nDetails: ${best.url}` : ''}${priceNote}`;
};
