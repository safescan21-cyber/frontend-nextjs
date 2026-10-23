import React, { useEffect, useState } from 'react';
import { Link } from '../../shell/router';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Copy, Check, Clock, Sparkles, EyeOff, Pencil, Loader2 } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { OFFER_THEMES } from './offerThemes';
import { rememberCoupon } from '../../utlis/coupon';


const pad = (n) => String(n).padStart(2, '0');

const useCountdown = (endsAt) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return { ended: true };
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
};

// Presentational card — also used for the live preview in the admin offers page
export const OfferCard = ({ offer, adminControls = null, preview = false }) => {
  const [copied, setCopied] = useState(false);
  const left = useCountdown(offer.endsAt);
  const code = String(offer.code || '').toUpperCase();
  if (left?.ended && !preview) return null;

  const copy = async () => {
    try {
      if (!preview) rememberCoupon(code); // checkout pre-fills it
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const external = /^https?:\/\//i.test(offer.ctaLink || '');
  const ctaClass =
    'inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl';

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${OFFER_THEMES[offer.theme] || OFFER_THEMES.orange} text-white shadow-xl`}>
      {/* decorative circles */}
      <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />

      {adminControls && <div className="absolute right-3 top-3 z-10">{adminControls}</div>}

      <div className="relative flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Limited time offer
          </span>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {offer.discountText && (
              <span className="text-4xl font-black leading-none drop-shadow-sm sm:text-5xl md:text-6xl">{offer.discountText}</span>
            )}
            <h2 className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">{offer.title || 'Your offer title'}</h2>
          </div>
          {offer.subtitle && <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{offer.subtitle}</p>}

          {left && !left.ended && (
            <div className="mt-4 flex items-center gap-2" aria-label="Time left">
              <Clock className="h-4 w-4 text-white/80" />
              <div className="flex gap-1.5 font-mono text-sm font-bold">
                {[
                  [left.d, 'd'],
                  [left.h, 'h'],
                  [left.m, 'm'],
                  [left.s, 's'],
                ].map(([v, l]) => (
                  <span key={l} className="rounded-md bg-black/20 px-2 py-1">
                    {l === 'd' ? v : pad(v)}<span className="ml-0.5 text-[10px] font-normal opacity-80">{l}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center md:flex-col md:items-stretch">
          {code && (
            <button
              type="button"
              onClick={copy}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/70 bg-white/10 px-5 py-2.5 font-mono text-lg font-bold tracking-widest transition hover:bg-white/20"
              aria-label={`Copy code ${code}`}
            >
              {code}
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-80 group-hover:opacity-100" />}
              <span className="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
            </button>
          )}
          {offer.ctaText && (preview ? (
            <span className={ctaClass}>{offer.ctaText}</span>
          ) : external ? (
            <a href={offer.ctaLink} target="_blank" rel="noopener noreferrer" className={ctaClass}>{offer.ctaText}</a>
          ) : (
            <Link to={offer.ctaLink || '/shop'} className={ctaClass}>{offer.ctaText}</Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Home page: shows running offers (rotates when there is more than one).
// Visitors can't close the banner; only an admin can turn an offer off.
const OfferBanner = () => {
  const [offers, setOffers] = useState([]);
  const [index, setIndex] = useState(0);
  const [turningOff, setTurningOff] = useState(false);
  const isAdmin = useSelector((state) => state.auth?.user?.role === 'admin');

  useEffect(() => {
    let alive = true;
    fetch(`${getBaseURL()}/api/offers/active`)
      .then((r) => (r.ok ? r.json() : { offers: [] }))
      .then((d) => alive && setOffers(d.offers || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (offers.length < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % offers.length), 7000);
    return () => clearInterval(t);
  }, [offers.length]);

  if (!offers.length) return null;
  const offer = offers[index % offers.length];

  // Admin only: switch the offer off for every visitor (the server also checks admin)
  const turnOff = async () => {
    if (!window.confirm(`Remove "${offer.title}" from the home page for all visitors?

You can turn it back on in Discount Offers.`)) return;
    setTurningOff(true);
    try {
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const res = await fetch(`${getBaseURL()}/api/offers/${offer._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isActive: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not turn the offer off');
      setOffers((list) => list.filter((o) => o._id !== offer._id));
      setIndex(0);
      toast.success('Offer removed from the home page');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTurningOff(false);
    }
  };

  const adminControls = isAdmin ? (
    <div className="flex items-center gap-1.5">
      <Link
        to="/dashboard/offers"
        className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-xs font-semibold backdrop-blur transition hover:bg-black/40"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Link>
      <button
        type="button"
        onClick={turnOff}
        disabled={turningOff}
        className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-xs font-semibold backdrop-blur transition hover:bg-black/40 disabled:opacity-60"
      >
        {turningOff ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
        Turn off
      </button>
    </div>
  ) : null;

  return (
    <section aria-label="Special offer" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <OfferCard offer={offer} adminControls={adminControls} />
      {offers.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {offers.map((o, i) => (
            <button
              key={o._id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show offer ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index % offers.length ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default OfferBanner;
