// Unit tests for the chat assistant (src/app/api/chat): it must never invent prices, phone
// numbers, emails or links, and must offer the right quotation. Run: npm test
// The shop API is replaced by the machine below, so no network or own model is needed.
import test from 'node:test';
import assert from 'node:assert/strict';

const MACHINE = {
  _id: '6ad20d0d5d94effd760752d6', name: 'Rotary Tablet Press – 16 Station (D Tooling)', category: 'tablet-press', price: 850000,
  warranty: 24, stock: 2, origin: 'germany', specifications: [{ key: 'Stations', value: '16 (D tooling)' }, { key: 'Output', value: 'Up to 28,800 tablets/hour' }],
  description: 'High-speed rotary press for production batches.', images: [],
};
globalThis.fetch = async (url) => {
  const body = String(url).includes('/api/products') ? { products: [MACHINE] } : { items: [] };
  return { ok: true, json: async () => body };
};
delete process.env.LLM_BASE_URL; // the route answers from the facts only

const k = await import('../src/app/api/chat/knowledge.js');
const { POST } = await import('../src/app/api/chat/route.js');
const facts = (q) => k.findFacts(q, 6);
const SITE = 'https://www.foodpharmamachinery.com';

test('reply check: a price the facts do not list is refused', async () => {
  const f = await facts('rotary tablet press price');
  assert.equal(k.checkReply('It costs Rs. 7,00,000 ex-works.', f), null);
  assert.ok(k.checkReply('It is listed at Rs. 8,50,000 ex-works.', f));
});

test('reply check: technical figures must come from the facts', async () => {
  const f = await facts('rotary tablet press output');
  assert.equal(k.checkReply('It makes 50,000 tablets/hour.', f), null);
  assert.ok(k.checkReply('It has 16 stations.', f));
});

test('reply check: wrong phone, made-up email and broken WhatsApp link are corrected', async () => {
  const f = await facts('contact');
  const out = k.checkReply('Call 98765 43210, mail sales@foodpharmamachinery.com or https://wa.me/+91 87007 92607', f);
  assert.match(out, /\+91 87007 92607/);
  assert.match(out, /safescan21@gmail\.com/);
  assert.doesNotMatch(out, /sales@|98765/);
  assert.match(out, /https:\/\/wa\.me\/918700792607/);
});

test('reply check: invented pages, outside links and dodges are refused', async () => {
  const f = await facts('spare parts');
  assert.equal(k.checkReply(`See ${SITE}/quote for details.`, f), null);
  assert.equal(k.checkReply('Buy it at https://example.com/press', f), null);
  assert.equal(k.checkReply('The FACTS do not list that.', f), null);
  assert.ok(k.checkReply(`Yes, see ${SITE}/spares.`, f));
});

test('phone and email questions always get our real details', () => {
  assert.match(k.withPhone('Please use the contact form.', 'What is your phone number?'), /\+91 87007 92607/);
  assert.match(k.withPhone('Please use the contact form.', 'What is your email?'), /safescan21@gmail\.com/);
  assert.equal(k.withPhone('It is the NJP 1200.', 'What is the model number?'), 'It is the NJP 1200.');
});

test('company questions get the written answer; unknown words are named, not guessed', async () => {
  const gst = await facts('Do you give GST invoice?');
  assert.ok(k.hasExactAnswer(gst));
  assert.match(k.replyFromFacts(gst, 'Do you give GST invoice?'), /GSTIN/);
  assert.equal(k.quoteOffer(gst, 'Do you give GST invoice?'), null); // was a machine card (bug, 25 Oct 2026)
  const q = 'Do you sell paracetamol API?';
  assert.match(k.replyFromFacts(await facts(q), q), /couldn't find "paracetamol"/);
  const off = await facts('What is the weather today?');
  assert.ok(k.isOffTopic(off, 'What is the weather today?'));
});

test('quotation: offered for a priced machine, not for other questions', async () => {
  assert.equal(k.quoteOffer(await facts('rotary tablet press'), 'rotary tablet press')?.price, 850000);
  assert.equal(k.quoteOffer(await facts('Do you sell spare parts?'), 'Do you sell spare parts?'), null);
});

const ask = (content, origin = SITE, ip = String(Math.random())) => POST(new Request(`${SITE}/api/chat`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'X-Real-IP': ip }, body: JSON.stringify({ messages: [{ role: 'user', content }] }),
}));

test('chat API: other websites are refused, empty chats rejected', async () => {
  assert.equal((await ask('hi', 'https://evil.example')).status, 403);
  const res = await POST(new Request(`${SITE}/api/chat`, { method: 'POST', headers: { Origin: SITE }, body: '{}' }));
  assert.equal(res.status, 400);
});

test('chat API: a machine price question gets its card, the price and the quotation form', async () => {
  const body = await (await ask('What is the price of the rotary tablet press?')).json();
  assert.match(body.reply, /Rs\. 8,50,000 ex-works \(GST, freight and installation extra\)/);
  assert.match(body.reply, /Get instant quotation/);
  assert.equal(body.quote?.price, 850000);
});

test('chat API: one visitor is limited to 30 messages per 10 minutes', async () => {
  let last;
  for (let i = 0; i < 31; i++) last = await ask('hello', SITE, 'same-visitor');
  assert.equal(last.status, 429);
});
