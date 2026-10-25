// /api/chat — replies for the site's chat assistant (components/pages/LiveChat.jsx).
// The assistant's instructions stay on the server: the browser only sends the conversation.
// Only short chats from this site are accepted, a limited number per visitor.
//
// Every question first looks up real facts (machines, prices, FAQs, company details) in
// knowledge.js; the model may only use those for specifics. Who answers:
//   1. greetings / thanks: answered at once, no model needed
//   2. our own model (trained in llm-training/, served by llama.cpp on this server at
//      LLM_BASE_URL, e.g. http://127.0.0.1:8090/v1, LLM_MODEL=foodpharma); every reply is
//      checked (unknown prices -> facts answer; wrong phone numbers / links fixed)
//   3. model slow or down: the best matching fact is sent as the reply
import { findFacts, factsBlock, replyFromFacts, checkReply, isOffTopic, isSmallTalk, factsCoverQuestion, logMissedQuestion, quoteOffer, withPhone, hasExactAnswer } from './knowledge';

const SYSTEM = `You are "Nova", a smart, warm, and helpful support assistant for Food Pharma Machinery (PureLine Machinery Pvt. Ltd., Haridwar) – a B2B provider of pharmaceutical machinery.
Our services: pharma and food processing machines (tablet presses, capsule fillers, blister packaging, liquid and powder filling, sterile processing), spares, AMC and turnkey plants.
Rules:
- Keep replies to 2–3 sentences. Be conversational and human.
- Use the FACTS you are given for anything specific: prices, models, specifications, addresses, phone numbers, delivery and links. Never invent these. If the FACTS don't answer it, say our team will confirm and suggest WhatsApp or the quote form.
- Only quote a price when it is listed in the FACTS, and say it is ex-works (GST, freight and installation extra).
- When the FACTS list a price for the machine asked about, give it and say they can get an instant quotation (PDF) with the "Get instant quotation" button below.
- Only use links that appear in the FACTS.
- If asked to connect to WhatsApp, tell them to click the green WhatsApp button in the chat.
- Be helpful, knowledgeable, and never salesy.
- Only talk about Food Pharma Machinery, its machines, services and pharma/food manufacturing.`;

const MAX_MESSAGES = 20; // the latest turns of the chat are enough context
const MAX_CHARS = 1500; // per message
const LIMIT = 30; // requests per visitor…
const WINDOW_MS = 10 * 60 * 1000; // …per 10 minutes
const ALLOWED_ORIGINS = /^https?:\/\/((www\.|next\.)?foodpharmamachinery\.com|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/;

// Requests per visitor (in memory: one server process, reset on restart)
const hits = new Map();
const tooMany = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  return recent.length > LIMIT;
};

const cleanMessages = (list) => {
  if (!Array.isArray(list)) return null;
  const out = list
    .slice(-MAX_MESSAGES)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  return out.length && out[out.length - 1].role === 'user' ? out : null;
};

// Our model runs on the server's processor: short answers, and a generous time limit
const ask = async (url, key, model, messages) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key && { Authorization: `Bearer ${key}` }) },
    body: JSON.stringify({ model, messages, max_tokens: 200, temperature: 0.3 }),
    signal: AbortSignal.timeout(45000),
  });
  const data = await res.json().catch(() => null);
  return data?.choices?.[0]?.message?.content || null;
};

export async function POST(request) {
  const origin = request.headers.get('origin') || '';
  if (!ALLOWED_ORIGINS.test(origin)) return Response.json({ message: 'Not allowed' }, { status: 403 });

  // nginx sets X-Real-IP to the visitor's address; the first X-Forwarded-For entry could be
  // made up by the visitor, the last one is the address nginx saw
  const ip = request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',').pop().trim() || 'unknown';
  if (tooMany(ip)) return Response.json({ message: 'Too many messages. Please try again in a few minutes or use WhatsApp.' }, { status: 429 });

  const body = await request.json().catch(() => null);
  const messages = cleanMessages(body?.messages);
  if (!messages) return Response.json({ message: 'Send the chat messages, ending with the visitor’s message' }, { status: 400 });

  // Facts for this question (the last two visitor messages, so "and its price?" still works)
  const asked = messages.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join(' ');
  const facts = await findFacts(asked, 6).catch(() => []);
  const prompt = [
    { role: 'system', content: SYSTEM },
    { role: 'system', content: facts.length ? `FACTS from our website and database:\n${factsBlock(facts)}` : 'FACTS: nothing found for this question. Do not guess specifics; offer WhatsApp or the quote form.' },
    ...messages,
  ];

  // A machine with a listed price the visitor asked about: the chat shows an instant quotation form
  const quote = quoteOffer(facts, asked);

  // Nothing good to answer with: put the question on the admin's list (the latest message only)
  const latest = messages[messages.length - 1].content;
  const best = facts[0]?.score || 0;
  if (best < 2.5 && !/^\s*(hi|hello|hey|namaste|thanks|thank you|ok|okay)\b/i.test(latest)) logMissedQuestion(latest);

  // Greetings / thanks: at once. Not about us (jokes, homework…): the standard answer.
  if (isSmallTalk(latest)) return Response.json({ reply: replyFromFacts(facts, latest), source: 'facts' });
  if (isOffTopic(facts, asked)) return Response.json({ reply: replyFromFacts([], asked), source: 'facts' });
  // One of our company questions (or an admin answer): the written answer, at once
  if (hasExactAnswer(facts)) return Response.json({ reply: withPhone(replyFromFacts(facts, latest), latest), source: 'facts', quote });
  // Every AI reply is checked: unknown prices -> answer from the facts; wrong phone/links fixed
  // The chat shows the quotation form (the machine has a listed price): a reply that asks which
  // machine or says we don't know is replaced by the machine's facts, and it names the button
  const DODGES = /\?\s*$|don'?t have|do not have|not sure|guess|ask our team|will confirm|tick the box/i;
  const withQuote = (reply) => {
    if (!quote) return reply;
    const text = DODGES.test(reply) ? replyFromFacts(facts, latest) : reply;
    return /instant quotation/i.test(text) ? text : `${text}${text.includes('\n') ? '\n\n' : ' '}You can get an instant quotation (PDF) with the "Get instant quotation" button below.`;
  };
  const checked = (reply) => (reply ? withPhone(checkReply(reply, facts) || replyFromFacts(facts, latest), latest) : null);

  try {
    // Only when the facts really cover the question: a small model invents when it has none
    if (process.env.LLM_BASE_URL && factsCoverQuestion(facts)) {
      const base = process.env.LLM_BASE_URL.replace(/\/$/, '');
      const reply = await ask(`${base}/chat/completions`, process.env.LLM_API_KEY, process.env.LLM_MODEL || 'foodpharma', prompt).catch(() => null);
      if (reply) return Response.json({ reply: withQuote(checked(reply)), source: 'own', quote });
    }
  } catch {
    /* answered below */
  }
  // Model slow or down: reply with the best matching fact
  return Response.json({ reply: withQuote(withPhone(replyFromFacts(facts, latest), latest)), source: 'facts', quote });
}
