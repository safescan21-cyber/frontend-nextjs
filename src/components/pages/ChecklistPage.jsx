'use client';
// /pharma-plant-checklist: free checklist (PDF) in return for an email address, which
// joins the newsletter list (Backend /api/newsletter/subscribe sends the usual confirmation)
import { useState } from 'react';
import { ClipboardCheck, Download, Loader2, CheckCircle } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { CHECKLIST, downloadChecklist } from '../../utlis/plantChecklist';
import { gaEvent } from '../../utlis/analytics';
import { Link } from '../../shell/router';

export default function ChecklistPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState(''); // '', 'sending', 'done'
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setState('sending');
    try {
      const res = await fetch(`${getBaseURL()}/api/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      // Already subscribed is fine: they still get the checklist
      if (!res.ok && res.status !== 409) throw new Error(data.message || 'Please check the email address.');
      gaEvent('generate_lead', { form: 'checklist' });
      await downloadChecklist();
      gaEvent('file_download', { file_name: 'pharma-plant-setup-checklist.pdf' });
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-emerald-700 to-teal-800 px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><ClipboardCheck className="h-3.5 w-3.5" /> Free download</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Pharma plant setup checklist (PDF)</h1>
          <p className="mt-2 max-w-2xl text-emerald-50">Everything to plan for a new pharma plant or production line: building, clean rooms, utilities, machines, validation, licences and people.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <h2 className="text-lg font-bold text-slate-900">What is inside</h2>
          <ul className="mt-3 space-y-2">
            {CHECKLIST.map(([title, items]) => (
              <li key={title} className="rounded-xl bg-white p-3 shadow-sm">
                <strong className="text-slate-900">{title}</strong>
                <span className="mt-0.5 block text-sm text-slate-600">{items.length} points, e.g. {items[0].toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          {state === 'done' ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5" role="status">
              <p className="flex items-center gap-2 font-bold text-green-800"><CheckCircle className="h-5 w-5" /> Your checklist is downloading</p>
              <p className="mt-1 text-sm text-green-900">Not started? <button type="button" onClick={downloadChecklist} className="font-semibold underline">Download again</button>. Planning a plant? <Link to="/project-cost-calculator" className="font-semibold underline">Estimate the cost</Link> or <Link to="/bulk-quote" className="font-semibold underline">ask for a quotation</Link>.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">Get the free PDF</h2>
              <label className="mt-3 block text-sm font-medium text-slate-700">Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
              </label>
              {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
              <button type="submit" disabled={state === 'sending'} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download checklist
              </button>
              <p className="mt-2 text-xs text-slate-500">We'll also send occasional news about new machines. Unsubscribe any time.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
