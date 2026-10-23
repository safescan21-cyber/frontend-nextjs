'use client';
// "Get a quote in 2 minutes" on machine pages: machine, capacity, city, name and phone
// (email optional). Saved as a bulk quote (Backend /api/bulk-quotes/quick), which
// emails the business at once. The confirmation offers a ready WhatsApp message with
// the quote number, so the customer can reach the team straight away.
//   <QuickQuote machine="Rotary Tablet Press" productId={id} />
//   <QuickQuote machines={['Model A', 'Model B']} />   (a list to choose from)
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Loader2, Zap } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { whatsappLink } from '../../utlis/contact';
import { useLocale } from '../../i18n/LocaleContext';
import { getLeadOrigin } from '../../utlis/leadOrigin';
import { gaEvent } from '../../utlis/analytics';

const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';

export default function QuickQuote({ id, machine = '', machines = [], productId = '', city = '', className = '' }) {
  const { t } = useLocale();
  const user = useSelector((s) => s.auth?.user);
  const [form, setForm] = useState({ machine: machine || machines[0] || '', capacity: '', city, name: '', phone: '', email: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // quote number

  // The saved login is read just after the page loads: fill in what we know
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.username || '', email: f.email || user.email || '' }));
  }, [user]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.machine.trim()) return setError(t('Please tell us which machine you need.'));
    if (!form.name.trim() || !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) return setError(t('Please enter your name and a valid phone number.'));
    setSending(true);
    try {
      let token = null;
      try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes/quick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        credentials: 'include',
        body: JSON.stringify({ ...form, productId, origin: getLeadOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || t('Could not send your request. Please try WhatsApp.'));
      setDone(data.quoteNumber);
      gaEvent('generate_lead', { form: 'quick_quote', machine: form.machine.slice(0, 100) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const message = [
      `Hello Food Pharma Machinery, I just requested a quote (${done}).`,
      `Machine: ${form.machine}`,
      form.capacity && `Capacity: ${form.capacity}`,
      form.city && `City: ${form.city}`,
      `Name: ${form.name}, phone ${form.phone}`,
    ].filter(Boolean).join('\n');
    return (
      <div id={id} className={`rounded-2xl border border-green-200 bg-green-50 p-5 ${className}`} role="status">
        <p className="flex items-center gap-2 font-bold text-green-800">
          <CheckCircle className="h-5 w-5" aria-hidden="true" /> {t('Request received')} · {done}
        </p>
        <p className="mt-1 text-sm text-green-900">{t('Our team will call you soon, usually within 1 business day.')}</p>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          {t('Confirm on WhatsApp for a faster reply')}
        </a>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} className={`rounded-2xl border border-orange-200 bg-orange-50/60 p-5 ${className}`} aria-labelledby={`${id || 'quick-quote'}-title`}>
      <h2 id={`${id || 'quick-quote'}-title`} className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Zap className="h-5 w-5 text-orange-500" aria-hidden="true" /> {t('Get a quote in 2 minutes')}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t('Tell us what you need. We reply with price and delivery time.')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          {t('Machine')}
          {machines.length > 1 ? (
            <select value={form.machine} onChange={(e) => set({ machine: e.target.value })} className={field}>
              {machines.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="Not sure – please advise">{t('Not sure – please advise')}</option>
            </select>
          ) : (
            <input value={form.machine} onChange={(e) => set({ machine: e.target.value })} maxLength={200} required className={field} />
          )}
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('Capacity / output')}
          <input value={form.capacity} onChange={(e) => set({ capacity: e.target.value })} maxLength={200} placeholder={t('e.g. 50,000 tablets per hour')} className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('City')}
          <input value={form.city} onChange={(e) => set({ city: e.target.value })} maxLength={100} autoComplete="address-level2" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('Your name')}
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={100} required autoComplete="name" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('Phone / WhatsApp')}
          <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} maxLength={30} required type="tel" inputMode="tel" autoComplete="tel" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          {t('Email (optional)')}
          <input value={form.email} onChange={(e) => set({ email: e.target.value })} maxLength={150} type="email" autoComplete="email" className={field} />
        </label>
        {/* Left empty by people; bots fill it */}
        <input type="text" name="website" value={form.website} onChange={(e) => set({ website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {t('Get my quote')}
      </button>
      <p className="mt-2 text-center text-xs text-slate-500">{t('No spam. We only use your number to send this quote.')}</p>
    </form>
  );
}
