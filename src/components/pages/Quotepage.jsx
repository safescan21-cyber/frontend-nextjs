import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Seo from '../Seo';
import { seoPages } from '../seoPages';

// Backend base URL. Set VITE_API_URL in the frontend .env (e.g. https://api.foodpharmamachinery.com)
// or leave it empty if Nginx forwards /api to the backend on the same domain.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const EMAIL = 'safescan21@gmail.com';
const PHONE_DISPLAY = '+91 87007 92607';
const PHONE_LINK = '+918700792607';

const INITIAL = { name: '', company: '', phone: '', email: '', product: '', message: '', website: '' };

const QuotePage = () => {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/api/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send your request.');
      setStatus('success');
      setForm(INITIAL);
      toast.success('Quote request sent. We will reply soon.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not send your request.');
      setStatus('error');
      toast.error(err.message || 'Could not send your request.');
    }
  };

  const input =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <>
      <Seo {...seoPages.quote} />
      <div className="bg-gray-50 min-h-screen pt-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Get a Quote</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Request a quote for pharma and food processing machinery. Tell us what you need and
              our team will reply with pricing and availability.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 md:py-14 max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your name *</label>
                <input id="name" name="name" required value={form.name} onChange={update} className={input} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input id="company" name="company" value={form.company} onChange={update} className={input} autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input id="phone" name="phone" type="tel" required value={form.phone} onChange={update} className={input} autoComplete="tel" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input id="email" name="email" type="email" required value={form.email} onChange={update} className={input} autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Machine or product needed *</label>
              <input id="product" name="product" required value={form.product} onChange={update} className={input} placeholder="e.g. Tablet press, 100 kg load cell" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea id="message" name="message" rows={4} value={form.message} onChange={update} className={input} placeholder="Capacity, quantity, delivery location..." />
            </div>
            {/* Honeypot: hidden from people, filled in by spam bots */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={update}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            {status === 'success' && (
              <div role="status" className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                Thank you! Your quote request has been sent. We will reply soon.
              </div>
            )}
            {status === 'error' && (
              <div role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMsg} Please try again or call {PHONE_DISPLAY}.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Sending...' : 'Send quote request'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Prefer to call? <a href={`tel:${PHONE_LINK}`} className="text-blue-600 hover:underline">{PHONE_DISPLAY}</a>
            {' '}or email{' '}
            <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default QuotePage;