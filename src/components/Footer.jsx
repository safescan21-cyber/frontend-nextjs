// PharmaMachineFooter.jsx
// Requirements: react-router-dom, tailwindcss, axios
// Add to tailwind.config.js => fontFamily: { barlow: ['"Barlow"','sans-serif'], barlowC: ['"Barlow Condensed"','sans-serif'] }

import { Link } from "react-router-dom";
import { useFetchAllProductsQuery } from "../components/store/products/productsApi"; // ✅ adjust path
import { useState, useEffect } from "react";
import axios from "axios";
import getBaseUrl from "../utlis/baseURL";

const WHATSAPP_NUMBER = "918700792607"; // country code + number, as wa.me requires
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20your%20machines.`;
const PHONE_DISPLAY = "+91 8700792607";
const PHONE_TEL = "tel:+918700792607";
const EMAIL = "safescan21@gmail.com";

/* ─── SVG Icons ─────────────────────────────────────────── */
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M6.62 10.79a15.45 15.45 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.59.57A1 1 0 0121 16.5v3.51A1 1 0 0120 21 17 17 0 013 4a1 1 0 011-.99H7.5A1 1 0 018.5 4a11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01L6.62 10.79z" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
  </svg>
);
const IconWhatsApp = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.862L.057 23.486a.5.5 0 00.613.601l5.76-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.574 9.574 0 01-4.895-1.345l-.351-.208-3.62.948.972-3.51-.228-.362A9.555 9.555 0 012.4 12C2.4 6.698 6.698 2.4 12 2.4S21.6 6.698 21.6 12 17.302 21.6 12 21.6z" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
);
const IconUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconGear = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
    <path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 00-.6.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58a7.07 7.07 0 000 1.88L2.82 14.52a.5.5 0 00-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" />
  </svg>
);

/* ─── Data ─────────────────────────────────────────────────── */
const NAV_PRODUCTS_FALLBACK = [
  { label: "Tablet Press Machines", to: "/products/tablet-press" },
  { label: "Capsule Filling Machines", to: "/products/capsule-filling" },
  { label: "Blister Packaging Machines", to: "/products/blister-packaging" },
];

const NAV_SERVICES = [
  { label: "Turnkey Projects", to: "/solutions/turnkey" },
  { label: "Custom Machine Design", to: "/contact" },
  { label: "Validation & Compliance", to: "/solutions/compliance" },
  { label: "Installation & Commissioning", to: "/solutions/turnkey" },
  { label: "Technical Support", to: "/contact" },
  { label: "After-Sales Service", to: "/contact" },
];

const NAV_COMPANY = [
  { label: "About PharmaMachine", to: "/about" },
  { label: "Careers", to: "/career" },
  { label: "Press & Media", to: "/press" },
];

const CERTIFICATIONS = ["ISO 9001:2015", "cGMP Compliant", "CE Marked", "FDA Approved", "GAMP 5"];

const STATS = [
  { value: "35+", label: "Years of Experience" },
  { value: "3,000+", label: "Satisfied Clients" },
  { value: "80+", label: "Countries Served" },
  { value: "24/7", label: "Technical Support" },
];

const HOURS = [
  { day: "Mon – Fri", time: "08:00 – 18:00 EST", open: true },
  { day: "Saturday", time: "09:00 – 13:00 EST", open: true },
  { day: "Sunday", time: "Emergency Support", open: false },
];

/* ─── Sub-components ──────────────────────────────────────── */
const ColHeading = ({ children }) => (
  <h2 className="font-barlowC font-bold text-[13px] tracking-[0.22em] uppercase text-white mb-6 flex items-center gap-3">
    <span className="inline-block w-6 h-[3px] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shrink-0" aria-hidden="true" />
    {children}
  </h2>
);

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="group flex items-center gap-2 text-[14px] text-slate-400 hover:text-white transition-all duration-200 leading-snug py-1.5"
  >
    <span className="text-orange-500 -ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
      <IconArrow />
    </span>
    <span className="-ml-3 group-hover:ml-0 transition-all duration-200">{children}</span>
  </Link>
);

const ContactRow = ({ icon: Icon, label, children }) => (
  <div className="group flex items-start gap-3.5">
    <div
      className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-orange-500 group-hover:from-orange-600 group-hover:to-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:shadow-lg group-hover:shadow-orange-600/20 transition-all duration-300"
      aria-hidden="true"
    >
      <Icon />
    </div>
    <div className="pt-0.5">
      <p className="font-barlowC font-bold text-[11px] tracking-[0.16em] uppercase text-slate-500 mb-1">{label}</p>
      <div className="text-[14px] text-slate-300 leading-snug">{children}</div>
    </div>
  </div>
);

/* ─── Main Footer ─────────────────────────────────────────── */
export default function PharmaMachineFooter() {
  // ── Product query ──
  const { data: apiData, isLoading: productsLoading } = useFetchAllProductsQuery({
    page: 1,
    limit: 1000,
  });
  const allProducts = apiData?.products || [];

  const navProducts = (() => {
    if (allProducts.length === 0) return NAV_PRODUCTS_FALLBACK;
    const seen = new Set();
    const items = [];
    allProducts.forEach((p) => {
      const cat = p.category || "uncategorized";
      if (seen.has(cat)) return;
      seen.add(cat);
      items.push({
        label: cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        to: `/shop?category=${cat}`,
      });
    });
    return items.slice(0, 12);
  })();

  // ── Fetch press releases ──
  const [pressReleases, setPressReleases] = useState([]);
  const [pressLoading, setPressLoading] = useState(true);

  useEffect(() => {
    const fetchPress = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${getBaseUrl()}/api/press`, {
          params: { active: true, limit: 3, page: 1 },
          headers,
        });
        setPressReleases(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        setPressReleases([]);
      } finally {
        setPressLoading(false);
      }
    };
    fetchPress();
  }, []);

  // ── Newsletter subscription ──
  const NEWSLETTER_KEY = "newsletterSubscribed";
  const [email, setEmail] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  // Remember a successful signup on this device so we show "subscribed" next visit
  const [subscribedAs, setSubscribedAs] = useState(() => {
    try { return localStorage.getItem(NEWSLETTER_KEY) || ""; } catch { return ""; }
  });
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const handleSubscribe = async (e) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setSubscribeError(clean ? "That email doesn't look right — please check it." : "Please enter your email address.");
      return;
    }

    setSubscribing(true);
    setSubscribeError("");
    try {
      const response = await axios.post(`${getBaseUrl()}/api/newsletter/subscribe`, { email: clean });
      setSubscribeMessage(response.data?.message || "You're subscribed!");
      setSubscribedAs(clean);
      setEmail("");
      try { localStorage.setItem(NEWSLETTER_KEY, clean); } catch { /* storage blocked */ }
    } catch (error) {
      setSubscribeError(
        error.response?.data?.message ||
          (error.request ? "Can't reach the server. Check your connection and try again." : "Something went wrong. Please try again.")
      );
    } finally {
      setSubscribing(false);
    }
  };

  const resetSubscribe = () => {
    setSubscribedAs("");
    setSubscribeMessage("");
    setSubscribeError("");
    try { localStorage.removeItem(NEWSLETTER_KEY); } catch { /* storage blocked */ }
  };


  const MediaTypeIcon = ({ type }) => {
    switch (type) {
      case "video":
        return <span className="text-purple-500 text-[10px]">🎬</span>;
      case "document":
        return <span className="text-orange-500 text-[10px]">📄</span>;
      default:
        return <span className="text-blue-500 text-[10px]">🖼️</span>;
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      itemScope
      itemType="https://schema.org/Organization"
      className="relative bg-[#080b11] text-slate-400 font-barlow w-full overflow-hidden"
      aria-label="Site footer"
    >
      <meta itemProp="name" content="PharmaMachine Pharmaceutical Machinery" />
      <meta itemProp="url" content="https://foodpharmamachinery.com" />

      {/* Decorative background: blueprint grid + orange glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-orange-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 -right-32 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-[120px]"
        aria-hidden="true"
      />

      {/* Gradient accent line */}
      <div className="relative h-1 bg-gradient-to-r from-orange-700 via-amber-400 to-orange-700" aria-hidden="true" />

      {/* ─── CTA banner ─── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-7 sm:p-10 shadow-2xl shadow-orange-900/30">
          <div
            className="absolute -right-10 -top-10 w-56 h-56 rounded-full border-[28px] border-white/10"
            aria-hidden="true"
          />
          <div
            className="absolute right-24 -bottom-16 w-40 h-40 rounded-full border-[18px] border-white/10"
            aria-hidden="true"
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-barlowC font-bold text-[12px] tracking-[0.25em] uppercase text-white/80 mb-2">
                Pharmaceutical machinery solutions
              </p>
              <h2 className="font-barlowC font-bold text-3xl sm:text-4xl leading-tight text-white">
                Looking for the right machine for your plant?
              </h2>
              <p className="mt-2 text-[15px] text-white/90">
                Tell us what you manufacture and our engineers will recommend the right equipment, with a quote within 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-[#080b11] hover:bg-black text-white font-barlowC font-bold text-[14px] tracking-widest uppercase px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Request a Quote
                <IconArrow />
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-700 font-barlowC font-bold text-[14px] tracking-widest uppercase px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <IconWhatsApp className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-800 bg-slate-800">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-[#0b0f17] px-5 py-6 text-center group hover:bg-[#0e131d] transition-colors">
              <p className="font-barlowC font-bold text-3xl sm:text-4xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-amber-300 transition-all">
                {value}
              </p>
              <p className="mt-1 font-barlowC font-semibold text-[11px] tracking-[0.2em] uppercase text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main grid ─── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
        {/* Brand */}
        <div className="lg:col-span-3">
          <Link to="/" aria-label="PharmaMachine — Home" className="flex items-center gap-3 mb-4 group">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-lg shadow-orange-900/40 group-hover:rotate-90 transition-transform duration-700">
              <IconGear />
            </span>
            <span>
              <span className="block font-barlowC font-bold text-[28px] leading-none text-white tracking-tight">
                PHARMA<span className="text-orange-500">MACHINE</span>
              </span>
              <span className="block mt-1 font-barlowC text-[11px] tracking-[0.2em] uppercase text-slate-500">
                Pharmaceutical Machinery
              </span>
            </span>
          </Link>
          <p itemProp="description" className="text-[14px] leading-relaxed text-slate-400 mb-6">
            Engineering high-precision pharmaceutical processing and packaging equipment for solid dose,
            liquid, and sterile applications — built to cGMP, delivered on time.
          </p>
          <div className="flex flex-wrap gap-2" aria-label="Certifications">
            {CERTIFICATIONS.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/70 rounded-full pl-2 pr-3 py-1 text-[10.5px] font-barlowC font-bold tracking-wide uppercase text-slate-300"
              >
                <span className="text-emerald-500">
                  <IconShield />
                </span>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Products + Services */}
        <div className="lg:col-span-3 lg:pl-6">
          <ColHeading>Products</ColHeading>
          <nav aria-label="Product categories">
            {productsLoading ? (
              <p className="text-[12px] text-slate-600">Loading…</p>
            ) : (
              <ul role="list">
                {navProducts.map(({ label, to }) => (
                  <li key={label}>
                    <FooterLink to={to}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            )}
          </nav>
          <div className="mt-8">
            <ColHeading>Services</ColHeading>
            <nav aria-label="Services">
              <ul role="list">
                {NAV_SERVICES.map(({ label, to }) => (
                  <li key={label}>
                    <FooterLink to={to}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <ColHeading>Contact Us</ColHeading>
          <address className="not-italic space-y-5">
            <ContactRow icon={IconPin} label="Office Locations">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-white">Main Office:</span> Shivalik Nagar, Haridwar,
                  Uttarakhand 249403, India
                </div>
                <div>
                  <span className="font-semibold text-white">East India:</span> Lokhra, Jyotikuchhi,
                  Guwahati, Assam, India
                </div>
                <div>
                  <span className="font-semibold text-white">Mumbai:</span> Thane, Mumbai, Maharashtra, India
                </div>
              </div>
            </ContactRow>

            <ContactRow icon={IconPhone} label="Sales Hotline">
              <a
                href={PHONE_TEL}
                itemProp="telephone"
                className="text-[16px] font-semibold text-white hover:text-orange-400 transition-colors"
                aria-label="Call our sales line"
              >
                {PHONE_DISPLAY}
              </a>
            </ContactRow>

            <ContactRow icon={IconWhatsApp} label="WhatsApp">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] font-semibold text-white hover:text-emerald-400 transition-colors"
              >
                {PHONE_DISPLAY}
              </a>
            </ContactRow>

            <ContactRow icon={IconMail} label="Email">
              <a
                href={`mailto:${EMAIL}`}
                itemProp="email"
                className="text-white hover:text-orange-400 transition-colors break-all"
              >
                {EMAIL}
              </a>
            </ContactRow>

            <ContactRow icon={IconClock} label="Business Hours">
              <div
                className="mt-1 bg-slate-900/70 border-l-2 border-orange-500 rounded-r-lg p-3 space-y-1.5 min-w-[210px]"
                itemProp="openingHours"
              >
                {HOURS.map(({ day, time, open }) => (
                  <div key={day} className="flex justify-between gap-4 text-[12.5px]">
                    <span className="text-slate-500">{day}</span>
                    <span className={open ? "text-emerald-400 font-medium" : "text-slate-500"}>{time}</span>
                  </div>
                ))}
              </div>
            </ContactRow>
          </address>
        </div>

        {/* Newsletter + Company + Press */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-900/30 p-5 backdrop-blur">
            <ColHeading>Newsletter</ColHeading>
            <p className="text-[13.5px] text-slate-400 leading-relaxed mb-4 -mt-2">
              Regulatory updates, new machines and pharma tech news — straight to your inbox.
            </p>

            {subscribedAs ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-emerald-700/60 bg-emerald-900/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-300">{subscribeMessage ? "You're on the list!" : "You're subscribed"}</p>
                    <p className="mt-0.5 text-[13px] text-slate-300 break-all">
                      {subscribeMessage
                        ? <>We sent a confirmation to <span className="text-white">{subscribedAs}</span>. Check your inbox (and spam folder).</>
                        : <>Updates go to <span className="text-white">{subscribedAs}</span>.</>}
                    </p>
                    <button
                      type="button"
                      onClick={resetSubscribe}
                      className="mt-2 text-[13px] text-orange-400 underline-offset-2 hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate>
                <label htmlFor="footer-email" className="mb-1.5 block text-[13px] font-medium text-slate-300">
                  Your email address
                </label>
                <div
                  className={`flex rounded-xl overflow-hidden border bg-[#0b0f17] transition-all focus-within:ring-2 ${
                    subscribeError
                      ? "border-red-500 focus-within:ring-red-500/20"
                      : "border-slate-700 focus-within:border-orange-500 focus-within:ring-orange-500/20"
                  }`}
                >
                  <input
                    id="footer-email"
                    type="email"
                    inputMode="email"
                    enterKeyHint="go"
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="flex-1 bg-transparent px-3.5 py-3 text-base sm:text-[14px] text-slate-200 placeholder-slate-500 outline-none min-w-0"
                    aria-invalid={Boolean(subscribeError)}
                    aria-describedby={subscribeError ? "footer-email-error" : "footer-email-hint"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subscribeError) setSubscribeError("");
                    }}
                    disabled={subscribing}
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="inline-flex min-h-[48px] items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 px-4 sm:px-5 text-white font-barlowC font-bold text-[13px] tracking-wider uppercase transition-all shrink-0 disabled:opacity-80 disabled:cursor-wait"
                  >
                    {subscribing && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    )}
                    {subscribing ? "Joining…" : "Subscribe"}
                  </button>
                </div>
                {subscribeError ? (
                  <p id="footer-email-error" role="alert" className="mt-2 text-[13px] text-red-400">
                    {subscribeError}
                  </p>
                ) : (
                  <p id="footer-email-hint" className="mt-2 text-[12px] text-slate-500">
                    No spam. Unsubscribe with one click.
                  </p>
                )}
              </form>
            )}

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-900/30 text-[13px] font-barlowC font-bold tracking-wider uppercase"
              aria-label="Chat with us on WhatsApp"
            >
              <IconWhatsApp className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-8">
            <ColHeading>Company</ColHeading>
            <nav aria-label="Company pages">
              <ul role="list">
                {NAV_COMPANY.map(({ label, to }) => (
                  <li key={label}>
                    <FooterLink to={to}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Latest Press Releases */}
            {!pressLoading && pressReleases.length > 0 && (
              <div className="mt-6">
                <h3 className="font-barlowC font-bold text-[11px] tracking-[0.2em] uppercase text-orange-500 mb-3">
                  Latest Press Releases
                </h3>
                <ul className="space-y-3">
                  {pressReleases.map((item) => (
                    <li key={item._id} className="border-b border-slate-800/70 pb-3 last:border-0">
                      <Link
                        to={`/press/${item._id}`}
                        className="group flex flex-col gap-1 text-[13px] text-slate-400 hover:text-white transition-colors leading-snug"
                      >
                        <span className="font-medium">{item.title}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600">
                          {item.publishedDate && (
                            <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                          )}
                          {item.media && item.media.length > 0 && (
                            <span className="flex items-center gap-1">
                              {item.media.slice(0, 3).map((m, idx) => (
                                <MediaTypeIcon key={idx} type={m.type} />
                              ))}
                              {item.media.length > 3 && <span>+{item.media.length - 3}</span>}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/press"
                  className="inline-block mt-3 text-[11px] font-barlowC font-bold tracking-widest uppercase text-orange-500 hover:text-orange-400 transition-colors"
                >
                  View all →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Trust bar ─── */}
      <div className="relative border-y border-slate-800/80 bg-[#0a0e15]/80 px-5 sm:px-8 py-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
        {["cGMP Compliant", "ISO 9001:2015", "CE Marked", "On-Site Validation", "Pan-India & Global Delivery"].map(
          (item) => (
            <span
              key={item}
              className="flex items-center gap-2 text-[12px] text-slate-400 font-barlowC font-semibold tracking-[0.12em] uppercase"
            >
              <span className="text-orange-500">
                <IconShield />
              </span>
              {item}
            </span>
          )
        )}
      </div>

      {/* ─── Legal footer ─── */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        <p className="text-[12.5px] text-slate-500 order-3 lg:order-1 text-center">
          &copy; {new Date().getFullYear()} PharmaMachine. All rights reserved.
        </p>
        <nav aria-label="Legal links" className="order-2 flex flex-wrap justify-center gap-x-6 gap-y-1">
          <Link to="/privacy" className="text-[12.5px] text-slate-500 hover:text-orange-400 transition-colors">
            Privacy Policy
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
            className="text-[12.5px] text-slate-500 hover:text-orange-400 transition-colors"
          >
            Cookie Settings
          </button>
          {/* Plain link: the sitemap is a file, not an app page */}
          <a href="/sitemap.xml" className="text-[12.5px] text-slate-500 hover:text-orange-400 transition-colors">
            Sitemap
          </a>
        </nav>
        <div
          className="order-1 lg:order-3 flex flex-wrap items-center justify-center gap-2"
          aria-label="Accepted payment methods"
        >
          {["VISA", "MC", "AMEX", "Wire", "NET 30", "PayPal"].map((m) => (
            <span
              key={m}
              className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-[10.5px] font-barlowC font-bold tracking-wide text-slate-400"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Floating buttons: WhatsApp + back to top ─── */}
      {/* On phones/tablets the bottom action bar already has WhatsApp, so only "back to top" shows, above the chat bubble */}
      <div className="fixed bottom-[160px] right-5 z-50 flex flex-col items-end gap-3 lg:bottom-5">
        <button
          type="button"
          onClick={scrollToTop}
          className="w-11 h-11 rounded-full bg-slate-800/90 hover:bg-orange-600 text-white border border-slate-600 flex items-center justify-center shadow-lg backdrop-blur transition-colors"
          aria-label="Back to top"
        >
          <IconUp />
        </button>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="relative hidden lg:flex w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white items-center justify-center shadow-xl shadow-emerald-900/40 transition-transform hover:scale-110"
          aria-label="Chat with us on WhatsApp"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" aria-hidden="true" />
          <IconWhatsApp className="relative w-7 h-7" />
        </a>
      </div>
    </footer>
  );
}