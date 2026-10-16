import { useState } from "react";
import axios from "axios";
import getBaseUrl from "../../utlis/baseURL";

// ══════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════
const WHATSAPP_NUMBER = "8700792607";
const WHATSAPP_MSG = "Hello, I would like to enquire about your machines.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
const PHONE_DISPLAY = "+91 8700792607";
const PHONE_TEL = "tel:+918700792607";
const EMAIL = "safescan21@gmail.com";

const OFFICES = [
  { name: "Main Office", address: "Shivalik Nagar, Haridwar, Uttarakhand 249403, India" },
  { name: "East India", address: "Lokhra, Jyotikuchhi, Guwahati, Assam, India" },
  { name: "Mumbai", address: "Thane, Mumbai, Maharashtra, India" },
];

const HOURS = [
  { day: "Mon – Fri", time: "08:00 – 18:00" },
  { day: "Saturday", time: "09:00 – 13:00" },
  { day: "Sunday", time: "Emergency support" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" }; // "website" = honeypot

// ══════════════════════════════════════════════════════════
//  SMALL PIECES
// ══════════════════════════════════════════════════════════
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.765.727 5.461 2.109 7.836L.5 31.5l7.906-2.07A15.45 15.45 0 0016 31.5c8.561 0 15.5-6.939 15.5-15.5S24.561.5 16 .5zm0 28.35a13.8 13.8 0 01-7.049-1.934l-.505-.3-5.242 1.373 1.4-5.105-.33-.524A13.85 13.85 0 012.15 16C2.15 8.35 8.35 2.15 16 2.15S29.85 8.35 29.85 16 23.65 28.85 16 28.85zm7.576-10.36c-.416-.208-2.46-1.213-2.841-1.352-.38-.138-.657-.208-.934.208-.277.416-1.073 1.352-1.315 1.629-.242.277-.484.311-.9.104-.416-.208-1.756-.647-3.345-2.064-1.236-1.1-2.07-2.46-2.313-2.876-.242-.416-.026-.64.182-.847.187-.186.416-.484.624-.727.208-.242.277-.416.416-.693.138-.277.069-.52-.035-.727-.104-.208-.934-2.252-1.28-3.083-.337-.81-.68-.7-.934-.713l-.796-.014c-.277 0-.727.104-1.108.52-.38.416-1.454 1.42-1.454 3.463s1.489 4.017 1.697 4.294c.208.277 2.932 4.476 7.104 6.277.993.428 1.768.684 2.371.875.996.317 1.903.272 2.62.165.8-.12 2.46-.935 2.807-1.836.346-.9.346-1.672.242-1.836-.104-.165-.38-.277-.796-.484z" />
  </svg>
);

const Icon = ({ d }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d={d} />
  </svg>
);

const ICON_MAIL = "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const ICON_PHONE = "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
const ICON_PIN = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z";
const ICON_CLOCK = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z";

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-all duration-200">
      <Icon d={icon} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-1">{label}</p>
      <div className="text-stone-200 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, placeholder, error, type = "text", required, children }) => (
  <div>
    <label htmlFor={`c-${name}`} className="block text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400 mb-2">
      {label}
      {required && <span className="text-amber-500"> *</span>}
    </label>
    {children || (
      <input
        id={`c-${name}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === "email" ? "email" : name === "name" ? "name" : "off"}
        aria-invalid={!!error}
        className={`w-full bg-transparent border-b-2 ${
          error ? "border-rose-500" : "border-stone-700 hover:border-amber-500/60"
        } focus:border-amber-400 outline-none py-3 text-stone-100 placeholder-stone-600 transition-colors duration-300 text-sm`}
      />
    )}
    {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
  </div>
);

// ══════════════════════════════════════════════════════════
//  CONTACT PAGE
// ══════════════════════════════════════════════════════════
export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.message.trim()) e.message = "Message cannot be empty";
    else if (form.message.length > 5000) e.message = "Message is too long (max 5000 characters)";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Bots fill hidden fields; pretend success and drop the message
    if (form.website) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      await axios.post(
        `${getBaseUrl()}/api/contact`,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        },
        { timeout: 20000 }
      );
      setForm(EMPTY_FORM);
      setStatus("sent");
    } catch (error) {
      console.error("Contact submission error:", error);
      let msg = "Something went wrong. Please try again, or message us on WhatsApp.";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.code === "ECONNABORTED") msg = "The request timed out. Please try again.";
      else if (!error.response) msg = "Could not reach the server. Check your connection or use WhatsApp.";
      setServerError(msg);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen text-stone-100 relative overflow-hidden" style={{ background: "#09080a" }}>
      <style>{`@keyframes contactPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px]" style={{ background: "radial-gradient(circle,#f59e0b,transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: "radial-gradient(circle,#f97316,transparent)" }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Header */}
        <header className="mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs tracking-[0.3em] uppercase text-amber-400 font-semibold">Get in touch</p>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black leading-none text-white" style={{ fontFamily: "Georgia,serif", letterSpacing: "-0.03em" }}>
            Let&apos;s <span className="text-transparent" style={{ WebkitTextStroke: "2px #f59e0b" }}>Talk.</span>
          </h1>
          <p className="mt-6 text-stone-400 text-base sm:text-lg max-w-xl leading-relaxed">
            Tell us about your plant and the machine you need. Our engineers reply within 24 hours, or message us on WhatsApp for a faster answer.
          </p>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp Us
            </a>
            <a href={PHONE_TEL} className="inline-flex items-center gap-2 border border-white/15 hover:border-amber-500/50 text-stone-200 text-sm font-semibold px-5 py-3 rounded-xl transition-colors">
              <Icon d={ICON_PHONE} />
              {PHONE_DISPLAY}
            </a>
          </div>
        </header>

        <div className="grid md:grid-cols-5 gap-12 lg:gap-20 items-start">
          {/* Left: details */}
          <aside className="md:col-span-2 space-y-8">
            <InfoRow icon={ICON_MAIL} label="Email">
              <a href={`mailto:${EMAIL}`} className="hover:text-amber-400 transition-colors break-all">{EMAIL}</a>
            </InfoRow>
            <InfoRow icon={ICON_PHONE} label="Phone / WhatsApp">
              <a href={PHONE_TEL} className="hover:text-amber-400 transition-colors">{PHONE_DISPLAY}</a>
            </InfoRow>
            <InfoRow icon={ICON_PIN} label="Offices">
              <ul className="space-y-2">
                {OFFICES.map((o) => (
                  <li key={o.name}>
                    <span className="font-semibold text-white">{o.name}:</span> {o.address}
                  </li>
                ))}
              </ul>
            </InfoRow>
            <InfoRow icon={ICON_CLOCK} label="Business Hours">
              <ul className="space-y-1">
                {HOURS.map((h) => (
                  <li key={h.day} className="flex justify-between gap-6 max-w-[260px]">
                    <span className="text-stone-500">{h.day}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
            </InfoRow>
          </aside>

          {/* Right: form */}
          <section className="md:col-span-3" aria-label="Contact form">
            <div className="rounded-2xl border border-white/10 p-6 sm:p-8" style={{ background: "rgba(255,255,255,0.03)" }}>
              {status === "sent" ? (
                <div className="flex flex-col items-center justify-center py-14 text-center space-y-5" role="status">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center" style={{ animation: "contactPop 0.4s ease-out both" }}>
                    <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia,serif" }}>Message Sent!</h2>
                  <p className="text-stone-400 text-sm max-w-xs">
                    Thank you. We&apos;ll get back to you within 24 hours. For an instant reply, message us on WhatsApp.
                  </p>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-xs tracking-widest uppercase text-stone-500 hover:text-amber-400 transition-colors"
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7" noValidate>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-stone-500">Send a message</p>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" error={errors.name} required />
                    <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" error={errors.email} required />
                  </div>

                  <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Tablet press quotation" />

                  <Field label="Message" name="message" error={errors.message} required>
                    <textarea
                      id="c-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      maxLength={5000}
                      placeholder="Tell us which machine you need, capacity, and your location…"
                      aria-invalid={!!errors.message}
                      className={`w-full bg-transparent border-b-2 ${
                        errors.message ? "border-rose-500" : "border-stone-700 hover:border-amber-500/60"
                      } focus:border-amber-400 outline-none py-3 text-stone-100 placeholder-stone-600 transition-colors duration-300 resize-none text-sm`}
                    />
                  </Field>

                  {/* Honeypot — hidden from people, bots fill it */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="c-website">Website</label>
                    <input id="c-website" name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                  </div>

                  {serverError && (
                    <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
                      {serverError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-stone-700 disabled:to-stone-700 text-white disabled:text-stone-400 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] disabled:cursor-not-allowed"
                    >
                      <span>{status === "sending" ? "Sending…" : "Send Message"}</span>
                      {status !== "sending" && (
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-stone-500">or use WhatsApp for instant replies</span>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}