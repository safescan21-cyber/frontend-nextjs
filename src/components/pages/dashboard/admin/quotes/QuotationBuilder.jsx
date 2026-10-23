// Quotation builder for one quote request: lines with prices, freight, GST and terms;
// save, preview the PDF, then email it to the customer (PDF attached) and send the
// link on WhatsApp. Backend: /api/bulk-quotes/:id/quotation…
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, Send, Loader2, MessageCircle, CheckCircle2 } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/bulk-quotes${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const input = 'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none';

const startFrom = (q) => {
  const saved = q.quotation || {};
  return {
    items: saved.items?.length
      ? saved.items.map((i) => ({ ...i }))
      : (q.items || []).map((i) => ({ name: i.name, quantity: i.quantity || 1, unitPrice: '', notes: i.notes || '' })),
    gstPercent: saved.gstPercent ?? 18,
    freight: saved.freight ?? 0,
    deliveryTime: saved.deliveryTime || '',
    paymentTerms: saved.paymentTerms || '',
    warranty: saved.warranty || '',
    validityDays: saved.validityDays ?? 15,
    notes: saved.notes || '',
  };
};

export default function QuotationBuilder({ q, onSaved }) {
  const [form, setForm] = useState(() => startFrom(q));
  const [busy, setBusy] = useState('');
  const [sent, setSent] = useState(null); // { emailed, whatsappUrl, pdfUrl }
  const saved = q.quotation || {};

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setItem = (i, patch) => setForm((f) => ({ ...f, items: f.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) }));

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s, i) => s + Number(i.unitPrice || 0) * Number(i.quantity || 0), 0) + Number(form.freight || 0);
    const gst = (subtotal * Number(form.gstPercent || 0)) / 100;
    return { subtotal, gst, total: subtotal + gst };
  }, [form]);

  const save = async () => {
    setBusy('save');
    try {
      const { quote } = await call(`/${q._id}/quotation`, { method: 'PUT', body: JSON.stringify(form) });
      onSaved(quote);
      toast.success(`Quotation ${quote.quotation.number} saved`);
      return quote;
    } catch (e) {
      toast.error(e.message);
      return null;
    } finally {
      setBusy('');
    }
  };

  const preview = async () => {
    const quote = await save();
    if (!quote) return;
    setBusy('pdf');
    try {
      const res = await fetch(`${getBaseURL()}/api/bulk-quotes/${q._id}/quotation.pdf`, { credentials: 'include', headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
      if (!res.ok) throw new Error('Could not create the PDF');
      window.open(URL.createObjectURL(await res.blob()), '_blank', 'noopener');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  };

  const send = async () => {
    const quote = await save();
    if (!quote) return;
    if (!window.confirm(q.contact?.email ? `Email quotation ${quote.quotation.number} to ${q.contact.email}?` : 'This customer gave no email. Mark the quotation as sent and get the WhatsApp message?')) return;
    setBusy('send');
    try {
      const r = await call(`/${q._id}/quotation/send`, { method: 'POST' });
      onSaved(r.quote);
      setSent(r);
      if (r.emailed) toast.success(`Emailed to ${q.contact.email}`);
      else if (r.emailError) toast.error(`Email failed: ${r.emailError}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-slate-800">Quotation {saved.number ? <span className="font-mono">{saved.number}</span> : '(new)'}</h3>
        {saved.sentAt && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sent {new Date(saved.sentAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}{saved.sentTo ? ` to ${saved.sentTo}` : ''}
            {saved.followUpSentAt ? ' · follow-up sent' : ''}
          </span>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-500">
              <th className="pb-1">Machine / item</th><th className="w-20 pb-1">Qty</th><th className="w-36 pb-1">Unit price (₹, ex-GST)</th><th className="w-32 pb-1 text-right">Amount</th><th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {form.items.map((it, i) => (
              <tr key={i} className="align-top">
                <td className="py-1 pr-2">
                  <input aria-label="Item name" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} className={input} maxLength={200} />
                  <input aria-label="Item details" value={it.notes} onChange={(e) => setItem(i, { notes: e.target.value })} placeholder="Model, options, specification…" className={`${input} mt-1 text-xs`} maxLength={500} />
                </td>
                <td className="py-1 pr-2"><input aria-label="Quantity" type="number" min="1" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} className={input} /></td>
                <td className="py-1 pr-2"><input aria-label="Unit price" type="number" min="0" step="any" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: e.target.value })} className={input} /></td>
                <td className="py-1 pr-2 pt-2.5 text-right font-medium">{inr(Number(it.unitPrice || 0) * Number(it.quantity || 0))}</td>
                <td className="py-1"><button type="button" aria-label="Remove line" onClick={() => set({ items: form.items.filter((_, k) => k !== i) })} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => set({ items: [...form.items, { name: '', quantity: 1, unitPrice: '', notes: '' }] })} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
        <Plus className="h-4 w-4" /> Add line
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold uppercase text-slate-500">Freight / packing (₹)<input type="number" min="0" value={form.freight} onChange={(e) => set({ freight: e.target.value })} className={`${input} mt-1`} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500">GST %
          <select value={form.gstPercent} onChange={(e) => set({ gstPercent: Number(e.target.value) })} className={`${input} mt-1`}>
            {[0, 5, 12, 18, 28].map((g) => <option key={g} value={g}>{g}%</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase text-slate-500">Valid for (days)<input type="number" min="1" max="365" value={form.validityDays} onChange={(e) => set({ validityDays: e.target.value })} className={`${input} mt-1`} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-3">Delivery<input value={form.deliveryTime} onChange={(e) => set({ deliveryTime: e.target.value })} placeholder="e.g. 6–8 weeks from advance payment" className={`${input} mt-1 normal-case`} maxLength={200} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-3">Payment terms<input value={form.paymentTerms} onChange={(e) => set({ paymentTerms: e.target.value })} placeholder="e.g. 40% advance, balance before dispatch" className={`${input} mt-1 normal-case`} maxLength={500} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-3">Warranty<input value={form.warranty} onChange={(e) => set({ warranty: e.target.value })} placeholder="e.g. 12 months from installation" className={`${input} mt-1 normal-case`} maxLength={300} /></label>
        <label className="text-xs font-semibold uppercase text-slate-500 sm:col-span-3">Other notes on the quotation<textarea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Installation, training, exclusions…" className={`${input} mt-1 normal-case`} maxLength={2000} /></label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-3">
        <p className="text-sm text-slate-700">
          Subtotal {inr(totals.subtotal)} · GST {inr(totals.gst)} · <strong className="text-slate-900">Total {inr(totals.total)}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={!!busy} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-400 disabled:opacity-50">
            {busy === 'save' ? <Loader2 className="inline h-4 w-4 animate-spin" /> : 'Save'}
          </button>
          <button type="button" onClick={preview} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-400 disabled:opacity-50">
            {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Preview PDF
          </button>
          <button type="button" onClick={send} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {busy === 'send' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {q.contact?.email ? 'Email to customer' : 'Mark as sent'}
          </button>
        </div>
      </div>

      {sent?.whatsappUrl && (
        <a href={sent.whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <MessageCircle className="h-4 w-4" /> Send the quotation link on WhatsApp
        </a>
      )}
    </div>
  );
}
