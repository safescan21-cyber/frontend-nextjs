// /api/chat — replies for the site's chat assistant (components/pages/LiveChat.jsx).
// The DeepSeek key stays on the server (DEEPSEEK_API_KEY, never NEXT_PUBLIC_…), and so
// does the assistant's instructions: the browser only sends the conversation. To keep
// the key from being used as a free AI service, only short chats from this site are
// accepted, a limited number per visitor.
// Optional fallback when DeepSeek fails: OPENROUTER_API_KEY (free models).
//
// Every question first looks up real facts (machines, prices, FAQs, company details) in
// knowledge.js; the AI may only use those for specifics. Order of AI services:
//   1. our own model, when LLM_BASE_URL (+ LLM_MODEL, optional LLM_API_KEY) is set —
//      any OpenAI-compatible server, e.g. Ollama: LLM_BASE_URL=https://<host>/v1
//   2. DeepSeek (DEEPSEEK_API_KEY)   3. OpenRouter (OPENROUTER_API_KEY)
//   4. none answering: the best matching fact is sent as the reply
import { findFacts, factsBlock, replyFromFacts, checkReply, isOffTopic, logMissedQuestion } from './knowledge';

const SYSTEM = `You are "Nova", a smart, warm, and helpful support assistant for Food Pharma Machinery (PureLine Machinery Pvt. Ltd., Haridwar) – a B2B provider of pharmaceutical machinery.
Our services: pharma and food processing machines (tablet presses, capsule fillers, blister packaging, liquid and powder filling, sterile processing), spares, AMC and turnkey plants.
Rules:
- Keep replies to 2–3 sentences. Be conversational and human.
- Use the FACTS you are given for anything specific: prices, models, specifications, addresses, phone numbers, delivery and links. Never invent these. If the FACTS don't answer it, say our team will confirm and suggest WhatsApp or the quote form.
- Only quote a price when it is listed in the FACTS, and say it is ex-works (GST, freight and installation extra).
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

const ask = async (url, key, model, messages, extraHeaders = {}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key && { Authorization: `Bearer ${key}` }), ...extraHeaders },
    body: JSON.stringify({ model, messages, max_tokens: 500, temperature: 0.4 }),
    signal: AbortSignal.timeout(25000),
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

  // Nothing good to answer with: put the question on the admin's list (the latest message only)
  const latest = messages[messages.length - 1].content;
  const best = facts[0]?.score || 0;
  if (best < 2.5 && !/^\s*(hi|hello|hey|namaste|thanks|thank you|ok|okay)\b/i.test(latest)) logMissedQuestion(latest);

  // Not about us (jokes, homework…): the standard answer, no AI needed
  if (isOffTopic(facts, asked)) return Response.json({ reply: replyFromFacts([], asked), source: 'facts' });
  // Every AI reply is checked: unknown prices -> answer from the facts; wrong phone/links fixed
  const checked = (reply) => (reply ? checkReply(reply, facts) || replyFromFacts(facts, asked) : null);

  try {
    if (process.env.LLM_BASE_URL) {
      const base = process.env.LLM_BASE_URL.replace(/\/$/, '');
      const reply = await ask(`${base}/chat/completions`, process.env.LLM_API_KEY, process.env.LLM_MODEL || 'foodpharma', prompt).catch(() => null);
      if (reply) return Response.json({ reply: checked(reply), source: 'own' });
    }
    if (process.env.DEEPSEEK_API_KEY) {
      const reply = await ask('https://api.deepseek.com/v1/chat/completions', process.env.DEEPSEEK_API_KEY, 'deepseek-chat', prompt).catch(() => null);
      if (reply) return Response.json({ reply: checked(reply), source: 'deepseek' });
    }
    if (process.env.OPENROUTER_API_KEY) {
      for (const model of ['meta-llama/llama-3.2-3b-instruct', 'mistralai/mistral-7b-instruct', 'microsoft/phi-3-mini-4k-instruct']) {
        const reply = await ask('https://openrouter.ai/api/v1/chat/completions', process.env.OPENROUTER_API_KEY, model, prompt, {
          'HTTP-Referer': 'https://www.foodpharmamachinery.com',
          'X-Title': 'Food Pharma Machinery Chat',
        }).catch(() => null);
        if (reply) return Response.json({ reply: checked(reply), source: 'openrouter' });
      }
    }
  } catch {
    /* answered below */
  }
  // No AI service answered: reply with the best matching fact
  return Response.json({ reply: replyFromFacts(facts, asked), source: 'facts' });
}
