import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Quote, Star, BadgeCheck, MessageSquarePlus } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';

// Approved customer testimonials (Backend/src/testimonials). Real customers
// only: each one was submitted or confirmed by the customer and approved by
// the admin. Shown as plain text so search engines can read it; no star-rating
// markup (Google treats self-hosted reviews of your own business as spam).
export const fetchTestimonials = async (limit = 24) => {
  const res = await fetch(`${getBaseURL()}/api/testimonials?limit=${limit}`);
  if (!res.ok) throw new Error('Could not load testimonials');
  return (await res.json()).items || [];
};

const initials = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const TestimonialCard = ({ t, dark = false }) => (
  <figure className={`flex h-full flex-col rounded-2xl border p-5 shadow-sm ${dark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'}`}>
    <div className="mb-3 flex items-center justify-between">
      <Quote className={`h-7 w-7 ${dark ? 'text-orange-400' : 'text-blue-500'}`} aria-hidden="true" />
      <span className="flex" role="img" aria-label={`Rated ${t.rating || 5} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < (t.rating || 5) ? 'fill-amber-400 text-amber-400' : dark ? 'text-slate-600' : 'text-slate-300'}`} aria-hidden="true" />
        ))}
      </span>
    </div>
    <blockquote className={`flex-1 text-sm leading-relaxed sm:text-base ${dark ? 'text-slate-200' : 'text-slate-700'}`}>“{t.quote}”</blockquote>
    <figcaption className="mt-4 flex items-center gap-3">
      {t.photo ? (
        <img src={t.photo} alt={t.name} loading="lazy" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${dark ? 'bg-slate-700 text-orange-300' : 'bg-blue-100 text-blue-700'}`} aria-hidden="true">{initials(t.name)}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`flex items-center gap-1 font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {t.name}
          {t.verifiedBuyer && <BadgeCheck className="h-4 w-4 text-green-500" aria-label="Verified buyer" />}
        </span>
        <span className={`block truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {[t.role, t.company, t.city].filter(Boolean).join(' · ')}
        </span>
      </span>
      {t.logo && <img src={t.logo} alt={t.company ? `${t.company} logo` : ''} loading="lazy" className="h-8 max-w-[72px] shrink-0 object-contain" />}
    </figcaption>
  </figure>
);

// Section for the Home and About pages. Hidden until there are approved testimonials.
const TestimonialsSection = ({ dark = false, limit = 6, className = '' }) => {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchTestimonials(limit).then(setItems).catch(() => setItems([])); }, [limit]);
  if (!items.length) return null;

  return (
    <section aria-labelledby="testimonials-heading" className={`px-4 py-14 ${dark ? '' : 'bg-slate-50'} ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-orange-400' : 'text-blue-600'}`}>Customer testimonials</p>
          <h2 id="testimonials-heading" className={`mt-1 text-2xl font-bold sm:text-3xl ${dark ? 'text-white' : 'text-slate-900'}`}>What our customers say</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => <TestimonialCard key={t._id} t={t} dark={dark} />)}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <Link to="/testimonials" className={`font-semibold hover:underline ${dark ? 'text-orange-400' : 'text-blue-600'}`}>Read all testimonials →</Link>
          <Link to="/testimonials#share" className={`inline-flex items-center gap-1 font-semibold hover:underline ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            <MessageSquarePlus className="h-4 w-4" /> Share your experience
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
