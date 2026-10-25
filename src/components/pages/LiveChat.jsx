import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { BotMessageSquare } from "lucide-react";
import getBaseURL from "../../utlis/baseURL";
import { getLeadOrigin } from "../../utlis/leadOrigin";
import { gaEvent } from "../../utlis/analytics";
import { LOCALE_CODES } from "../../i18n/locales";

// ─── CONFIG ──────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "918700792607"; // +91 87007 92607
const WHATSAPP_DEFAULT_MSG = "Hi! I'm interested in your pharmaceutical machinery.";

// The assistant's instructions and the AI key live on the server (app/api/chat/route.js)

const QUICK_REPLIES = [
  { icon: "💊", text: "What machines do you offer?" },
  { icon: "💰", text: "How do I get a quote?" },
  { icon: "⚡", text: "What's your lead time?" },
  { icon: "📞", text: "Connect me to WhatsApp" },
];

const INIT_MSG = {
  role: "assistant",
  content: "Hey there! 👋 I'm Nova, your Food Pharma Machinery assistant. Ask me about our equipment, or jump to WhatsApp to speak with a real expert.",
  isNew: false,
};

// ─── SOUNDS (made with Web Audio, no sound files) ───────────────
// Browsers only allow sound after the visitor has clicked, tapped or typed on the page.
// A chime asked for before that waits and plays on their first click/tap (if still wanted).
// Visitors can switch sounds off in the chat header (remembered in this browser).
const SOUND_OFF_KEY = "chatSoundOff";
let audioCtx = null;
let pendingSound = null;

const soundOff = () => { try { return localStorage.getItem(SOUND_OFF_KEY) === "1"; } catch { return false; } };
const hasUserGesture = () => (typeof navigator !== "undefined" && navigator.userActivation ? navigator.userActivation.hasBeenActive : true);
const getAudio = () => {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
};

// One soft sine tone with a quick fade in/out
const tone = (ctx, freq, start, dur, vol) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.05);
};

const SOUNDS = {
  chime: (ctx) => { tone(ctx, 784, 0, 0.35, 0.18); tone(ctx, 1175, 0.16, 0.55, 0.15); }, // two-tone "ding-dong" when the chat greets
  message: (ctx) => { tone(ctx, 988, 0, 0.16, 0.11); tone(ctx, 1319, 0.08, 0.22, 0.09); }, // a reply from Nova
  send: (ctx) => tone(ctx, 660, 0, 0.1, 0.06), // the visitor's message going out
};

function playSound(name, { wait = false } = {}) {
  if (typeof window === "undefined" || soundOff()) return;
  const play = () => {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const go = () => { try { SOUNDS[name](ctx); } catch { /* no sound: fine */ } };
      if (ctx.state === "running") go();
      else ctx.resume().then(go).catch(() => {});
    } catch { /* no sound: fine */ }
  };
  if (hasUserGesture()) play();
  else if (wait) pendingSound = play;
}
const cancelPendingSound = () => { pendingSound = null; };

if (typeof window !== "undefined") {
  const unlock = () => {
    if (!pendingSound) return;
    const p = pendingSound;
    pendingSound = null;
    p();
  };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => document.addEventListener(ev, unlock, { capture: true, passive: true }));
}

// Pages where the chat must not pop up by itself (buying, logging in, admin)
const QUIET_PAGES = new RegExp(`^/(?:(?:${LOCALE_CODES.join("|")})/)?(cart|checkout|login|register|forgotpassword|resetpassword|dashboard)(/|$)`);

// ─── WHATSAPP BUTTON ────────────────────────────────────────────
function WhatsAppButton({ aiSummary = "" }) {
  const msg = aiSummary
    ? `${WHATSAPP_DEFAULT_MSG}\n\nContext from chat: ${aiSummary}`
    : WHATSAPP_DEFAULT_MSG;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(37,211,102,0.4)] group"
    >
      <svg viewBox="0 0 32 32" className="w-5 h-5 flex-shrink-0" fill="white">
        <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.765.727 5.461 2.109 7.836L.5 31.5l7.906-2.07A15.45 15.45 0 0016 31.5c8.561 0 15.5-6.939 15.5-15.5S24.561.5 16 .5zm0 28.35a13.8 13.8 0 01-7.049-1.934l-.505-.3-5.242 1.373 1.4-5.105-.33-.524A13.85 13.85 0 012.15 16C2.15 8.35 8.35 2.15 16 2.15S29.85 8.35 29.85 16 23.65 28.85 16 28.85zm7.576-10.36c-.416-.208-2.46-1.213-2.841-1.352-.38-.138-.657-.208-.934.208-.277.416-1.073 1.352-1.315 1.629-.242.277-.484.311-.9.104-.416-.208-1.756-.647-3.345-2.064-1.236-1.1-2.07-2.46-2.313-2.876-.242-.416-.026-.64.182-.847.187-.186.416-.484.624-.727.208-.242.277-.416.416-.693.138-.277.069-.52-.035-.727-.104-.208-.934-2.252-1.28-3.083-.337-.81-.68-.7-.934-.713l-.796-.014c-.277 0-.727.104-1.108.52-.38.416-1.454 1.42-1.454 3.463s1.489 4.017 1.697 4.294c.208.277 2.932 4.476 7.104 6.277.993.428 1.768.684 2.371.875.996.317 1.903.272 2.62.165.8-.12 2.46-.935 2.807-1.836.346-.9.346-1.672.242-1.836-.104-.165-.38-.277-.796-.484z"/>
      </svg>
      <div className="text-left flex-1">
        <p className="text-sm font-bold leading-tight">Chat on WhatsApp</p>
        <p className="text-[11px] text-white/75 leading-tight">Speak with a real agent</p>
      </div>
      <svg className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

// ─── INSTANT QUOTATION IN THE CHAT ──────────────────────────────
// Shown under Nova's reply when the visitor asked about the price of a machine with a listed
// price (app/api/chat sends `quote`). Same backend as the machine page's instant quotation:
// the price always comes from the database.
const QUOTE_GST = 18; // % – same as Backend/src/quotes/bulkQuoteRoutes.js (INSTANT_GST)
const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const chatField = "w-full rounded-lg bg-stone-900/80 border border-white/10 px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60";

function ChatQuote({ quote }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const total = Math.round(quote.price * qty * (1 + QUOTE_GST / 100));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !/^[+\d][\d\s-]{6,}$/.test(phone.trim())) return setError("Please enter your name and a valid phone number.");
    setBusy(true);
    try {
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes/instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: quote.id, quantity: qty, name, phone, email, origin: getLeadOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not make the quotation. Please try WhatsApp.");
      setDone(data);
      gaEvent("generate_lead", { form: "chat_instant_quote", machine: String(quote.name).slice(0, 100), value: data.quotation?.total, currency: "INR" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
        <p className="font-semibold">✅ Quotation {done.quotation?.number} is ready</p>
        <p className="mt-0.5">{qty} × {quote.name}: <strong>{rupees(done.quotation?.total)}</strong> incl. {done.quotation?.gstPercent}% GST{done.emailed ? `, also emailed to ${email}` : ""}.</p>
        <a href={done.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-white hover:bg-emerald-400">Open quotation (PDF)</a>
      </div>
    );
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-semibold text-white hover:from-amber-400 hover:to-orange-400">
        📄 Get instant quotation – {quote.name}
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl border border-amber-500/30 bg-stone-900/60 p-3">
      <p className="text-xs font-semibold text-amber-300">Instant quotation: {quote.name}</p>
      <div className="flex items-center justify-between text-xs text-stone-300">
        <label className="flex items-center gap-2">Qty
          <input type="number" min="1" max="50" value={qty} onChange={(e) => setQty(Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)))} className={`${chatField} w-14 text-center`} />
        </label>
        <span>{rupees(total)} <span className="text-stone-500">incl. {QUOTE_GST}% GST</span></span>
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" maxLength={100} className={chatField} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp *" type="tel" maxLength={30} className={chatField} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (to receive the PDF)" type="email" maxLength={150} className={chatField} />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 disabled:opacity-60">
        {busy ? "Making your quotation…" : "Get my quotation (PDF)"}
      </button>
      <p className="text-[10px] text-stone-500">Ex-works price; freight and installation quoted separately.</p>
    </form>
  );
}

// ─── MESSAGE TEXT ───────────────────────────────────────────────
// Our site links and our phone number become tappable (long links wrap inside the bubble)
const LINK_RE = /(https?:\/\/(?:www\.)?foodpharmamachinery\.com[^\s)\]]*[^\s)\].,;:!?]|\+91[\s-]?87007[\s-]?92607)/g;
function MessageText({ text }) {
  return text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const isPhone = part.startsWith("+91");
    return (
      <a key={i} href={isPhone ? "tel:+918700792607" : part} className="break-all text-amber-300 underline underline-offset-2 hover:text-amber-200">
        {isPhone ? part : part.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  });
}

// ─── MESSAGE BUBBLE ─────────────────────────────────────────────
function Bubble({ msg, isNew }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: isNew ? "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" : "none" }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-lg shadow-amber-500/20">
          <span className="text-sm">✦</span>
        </div>
      )}
      <div className={`max-w-[80%] min-w-0 whitespace-pre-line break-words px-4 py-2.5 text-sm font-sans leading-relaxed ${
        isUser
          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-br-sm shadow-lg shadow-amber-500/20"
          : "bg-stone-800/90 text-stone-200 rounded-2xl rounded-bl-sm border border-white/8 backdrop-blur-sm"
      }`}>
        {isUser ? msg.content : <MessageText text={msg.content} />}
        {msg.showWhatsApp && (
          <div className="mt-3">
            <WhatsAppButton aiSummary={msg.waSummary} />
          </div>
        )}
        {msg.quote && <ChatQuote quote={msg.quote} />}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0 mb-0.5">
          <svg className="w-4 h-4 text-stone-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── TYPING DOTS ─────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
        <span className="text-sm">✦</span>
      </div>
      <div className="bg-stone-800/90 border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
function detectWhatsApp(text) {
  return /whatsapp|whats app|wa\.me|ring|call|phone|speak|human|agent|connect|talk to someone/i.test(text);
}

// ─── MAIN LIVECHAT COMPONENT ────────────────────────────────────
function LiveChat() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([INIT_MSG]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const chatHistory = useRef([]);
  const welcomeTimeout = useRef(null);

  const pathname = usePathname() || "/";
  const [soundOn, setSoundOn] = useState(true);
  const autoOpened = useRef(false);
  const touched = useRef(false); // the visitor already used the chat

  useEffect(() => { setSoundOn(!soundOff()); }, []);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try { localStorage.setItem(SOUND_OFF_KEY, next ? "0" : "1"); } catch { /* storage blocked */ }
    if (next) playSound("message");
  };

  // ── Greet once per visit, as soon as the page has loaded (not while buying or logging in):
  // on a computer the chat opens with Nova "typing" the greeting; on a phone a small
  // bubble shows instead (a full chat would cover the screen). Both with a chime. ──
  useEffect(() => {
    if (QUIET_PAGES.test(pathname)) return undefined;
    let shown = false;
    try { shown = sessionStorage.getItem("chatWelcomeShown") === "true"; } catch { /* storage blocked */ }
    if (shown) return undefined;
    const timer = setTimeout(() => {
      if (touched.current) return;
      try { sessionStorage.setItem("chatWelcomeShown", "true"); } catch { /* storage blocked */ }
      if (window.matchMedia("(min-width: 1024px)").matches) {
        autoOpened.current = true;
        setMsgs([]);
        setLoading(true);
        setOpen(true);
        playSound("chime", { wait: true });
        welcomeTimeout.current = setTimeout(() => {
          setLoading(false);
          setMsgs([{ ...INIT_MSG, isNew: true }]);
        }, 1400);
      } else {
        setShowWelcome(true);
        playSound("chime", { wait: true });
        welcomeTimeout.current = setTimeout(() => {
          setShowWelcome(false);
          cancelPendingSound();
        }, 12000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (welcomeTimeout.current) clearTimeout(welcomeTimeout.current);
    };
  }, []);

  const handleWelcomeClick = () => {
    touched.current = true;
    setOpen(true);
    setShowWelcome(false);
    if (welcomeTimeout.current) clearTimeout(welcomeTimeout.current);
  };

  // ── Chat logic ──
  useEffect(() => {
    // An auto-opened chat doesn't take the keyboard focus from the page
    if (open) { setUnread(0); if (!autoOpened.current) setTimeout(() => inputRef.current?.focus(), 200); }
    if (!open) { autoOpened.current = false; cancelPendingSound(); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // ─── AI reply (server side: app/api/chat/route.js keeps the key) ──
  const callAI = async (messages) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json().catch(() => null);
      return res.ok && data?.reply ? data : null;
    } catch {
      return null;
    }
  };

  // ─── Send message ──────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content, isNew: true };
    touched.current = true;
    autoOpened.current = false;
    playSound("send");
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    chatHistory.current = [...chatHistory.current, { role: "user", content }];

    try {
      const answer = await callAI(chatHistory.current);
      if (!answer) throw new Error("AI returned no response");
      const reply = answer.reply;

      const wantsWA = detectWhatsApp(content) || detectWhatsApp(reply);
      const summary = chatHistory.current.slice(-3).map(m => m.content).join(" | ");

      const botMsg = { role: "assistant", content: reply, isNew: true, showWhatsApp: wantsWA, waSummary: summary, quote: answer.quote || null };
      chatHistory.current = [...chatHistory.current, { role: "assistant", content: reply }];

      setMsgs(prev => [...prev, botMsg]);
      playSound("message");
      if (!open) setUnread(n => n + 1);
    } catch (err) {
      console.error("AI error:", err);
      setMsgs(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please use WhatsApp for immediate help.",
        isNew: true, showWhatsApp: true, waSummary: ""
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, open]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0);   opacity: 0.4; }
          30%          { transform: translateY(-7px); opacity: 1;   }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0   rgba(245,158,11,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(245,158,11,0);   }
          100% { box-shadow: 0 0 0 0   rgba(245,158,11,0);   }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        .chat-panel { animation: chatSlideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) both; }
        .fab-pulse  { animation: pulseRing 2s ease-in-out infinite; }
        .welcome-popup { animation: slideInLeft 0.4s cubic-bezier(0.34,1.2,0.64,1) both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #44403c; border-radius: 2px; }
      `}</style>

      {/* ─── WELCOME POPUP ──────────────────────────────────── */}
      {showWelcome && (
        <div className="welcome-popup fixed bottom-24 left-4 sm:left-6 z-40 max-w-[230px] lg:max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 p-3 lg:p-4 cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={handleWelcomeClick}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
              <span className="text-base lg:text-lg">✦</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-bold text-white font-sans">💬 Live chat</p>
              <p className="text-xs lg:text-sm text-stone-300 font-sans mt-0.5">How can I help you today?</p>
              <div className="mt-1 lg:mt-2 flex items-center gap-2">
                <span className="text-xs text-amber-400 font-sans font-semibold">Click to start</span>
                <svg className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowWelcome(false); if (welcomeTimeout.current) clearTimeout(welcomeTimeout.current); }}
              className="text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0 -mt-1 -mr-1"
              aria-label="Close welcome popup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ─── FLOATING ACTION BUTTON ───────────────────────── */}
      <button
        onClick={() => { touched.current = true; setShowWelcome(false); cancelPendingSound(); setOpen(o => !o); }}
        aria-label="Chat with Nova, our AI assistant"
        className={`fixed bottom-[84px] lg:bottom-6 right-4 lg:right-6 z-50 w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${open ? "bg-stone-700 hover:bg-stone-600" : "bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 fab-pulse"}`}
      >
        <div className="relative">
          {open ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <BotMessageSquare className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow" strokeWidth={2.2} aria-hidden="true" />
          )}
          {!open && unread > 0 && (
            <span aria-hidden="true" className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold font-sans flex items-center justify-center shadow-lg">
              {unread}
            </span>
          )}
        </div>
      </button>

      {/* ─── CHAT PANEL ────────────────────────────────────── */}
      {open && (
        <div className="chat-panel fixed bottom-[140px] lg:bottom-28 right-4 sm:right-6 z-50 flex flex-col rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden"
          style={{ width: "min(380px, calc(100vw - 2rem))", maxHeight: "min(calc(100vh - 190px), 520px)", background: "linear-gradient(160deg,#141210 0%,#0e0c0a 100%)" }}>
          {/* Header */}
          <div className="relative px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#1c1a17 0%,#161310 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-t-3xl pointer-events-none">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl" />
            </div>
            <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
              <span className="text-lg">✦</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1c1a17]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white font-sans truncate">Nova · Food Pharma Machinery AI</p>
              <p className="text-xs text-emerald-400 font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Online · replies instantly
              </p>
            </div>
            <button
              onClick={toggleSound}
              aria-label={soundOn ? "Turn chat sounds off" : "Turn chat sounds on"}
              title={soundOn ? "Sounds on" : "Sounds off"}
              className="text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0"
            >
              {soundOn ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5zM16 9l5 5M21 9l-5 5" /></svg>
              )}
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* WhatsApp strip */}
          <div className="px-4 py-2.5" style={{ background: "rgba(37,211,102,0.07)", borderBottom: "1px solid rgba(37,211,102,0.15)" }}>
            <WhatsAppButton aiSummary={chatHistory.current.slice(-2).map(m => m.content).join(" | ")} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-h-[220px]">
            {msgs.map((m, i) => <Bubble key={i} msg={m} isNew={m.isNew} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {msgs.length <= 1 && !loading && (
            <div className="px-4 pb-3">
              <p className="text-[10px] tracking-widest uppercase text-stone-600 font-sans mb-2">Quick questions</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_REPLIES.map(({ icon, text }) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="flex items-center gap-2 text-left text-xs font-sans bg-stone-800/60 hover:bg-amber-500/15 border border-white/8 hover:border-amber-500/40 text-stone-300 hover:text-amber-300 px-3 py-2.5 rounded-xl transition-all duration-200"
                  >
                    <span>{icon}</span>
                    <span className="leading-snug">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 flex items-end gap-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={handleKey}
              placeholder="Ask Nova anything…"
              disabled={loading}
              className="flex-1 bg-stone-800/50 border border-white/8 focus:border-amber-500/50 rounded-xl outline-none resize-none text-sm text-stone-100 placeholder-stone-600 font-sans px-3 py-2.5 max-h-24 leading-relaxed transition-all duration-200 disabled:opacity-40"
              style={{ minHeight: 40 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:from-stone-700 disabled:to-stone-700 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 disabled:shadow-none"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <div className="text-center py-2" style={{ background: "rgba(0,0,0,0.3)" }}>
            <p className="text-[10px] text-stone-700 font-sans tracking-wider">
              Nova · <span className="text-stone-500">Food Pharma Machinery AI</span> · Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default LiveChat;