'use client';
import { formTool } from '../webmcp/webmcpTools';
import React, { useEffect, useState } from 'react';
import { Star, Send, CheckCircle, Loader2, MessageSquareQuote } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { TestimonialCard, fetchTestimonials } from './TestimonialsSection';

const EMPTY = { name: '', role: '', company: '', city: '', email: '', rating: 5, quote: '', consent: false, website: '' };
const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';

// /testimonials: every approved testimonial + a form for customers to share theirs
// initial: the approved testimonials the server fetched (app/[locale]/testimonials)
const TestimonialsPage = ({ initial }) => {
  const [items, setItems] = useState(initial || []);
  const [loading, setLoading] = useState(!initial);
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) return;
    fetchTestimonials(100).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#share') setTimeout(() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' }), 300);
  }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.quote.trim().length < 20) { setError('Please write at least 20 characters about your experience.'); return; }
    if (!form.consent) { setError('Please tick the box to let us publish your testimonial.'); return; }
    setSending(true);
    try {
      const res = await fetch(`${getBaseURL()}/api/testimonials/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send your testimonial.');
      setDone(data.message || 'Thank you!');
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100"><MessageSquareQuote className="h-3.5 w-3.5" /> Testimonials</p>
          <h1 className="text-2xl font-bold sm:text-4xl">Customer testimonials</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:text-base">
            What pharma and food manufacturers say about PureLine Machinery&apos;s machines, delivery and support. Every testimonial comes from a real customer who agreed to be published.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((t) => <TestimonialCard key={t._id} t={t} />)}</div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No testimonials published yet — be the first to share your experience below.</p>
        )}

        <section id="share" aria-labelledby="share-heading" className="mt-12 scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 xl:scroll-mt-[310px]">
          <h2 id="share-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">Share your experience</h2>
          <p className="mt-1 text-sm text-slate-600">Bought a machine or API from us? Tell other buyers how it went. We publish testimonials after a quick check; your email is never shown.</p>

          {done ? (
            <p className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800"><CheckCircle className="h-5 w-5" /> {done}</p>
          ) : (
            <form {...formTool('testimonial')} onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
              <label className="block"><span className="text-sm font-medium text-slate-700">Your name *</span>
                <input name="name" value={form.name} onChange={(e) => set({ name: e.target.value })} required maxLength={80} autoComplete="name" className={input} /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">Email * <span className="font-normal text-slate-400">(not shown)</span></span>
                <input type="email" name="email" value={form.email} onChange={(e) => set({ email: e.target.value })} required maxLength={200} autoComplete="email" className={input} /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">Job title</span>
                <input name="role" value={form.role} onChange={(e) => set({ role: e.target.value })} maxLength={80} placeholder="e.g. Production Manager" className={input} /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">Company</span>
                <input name="company" value={form.company} onChange={(e) => set({ company: e.target.value })} maxLength={120} autoComplete="organization" className={input} /></label>
              <label className="block"><span className="text-sm font-medium text-slate-700">City</span>
                <input name="city" value={form.city} onChange={(e) => set({ city: e.target.value })} maxLength={60} className={input} /></label>
              <div>
                <span className="text-sm font-medium text-slate-700">Rating</span>
                <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => set({ rating: n })} className="p-1">
                      <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="block sm:col-span-2"><span className="text-sm font-medium text-slate-700">Your testimonial *</span>
                <textarea name="quote" value={form.quote} onChange={(e) => set({ quote: e.target.value })} required minLength={20} maxLength={1000} rows={5} placeholder="Which machine or API did you buy, and how were the quality, delivery and support?" className={input} />
                <span className="text-xs text-slate-400">{form.quote.length}/1000</span></label>
              {/* hidden from people; bots fill it in */}
              <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set({ website: e.target.value })} /></label>
              <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
                <input type="checkbox" name="consent" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-0.5 h-4 w-4 accent-blue-600" />
                I agree that PureLine Machinery may publish this testimonial with my name, job title, company and city on its website.
              </label>
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send testimonial
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default TestimonialsPage;
