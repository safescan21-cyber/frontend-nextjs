'use client';
// /pcb-repair: send photos of a faulty PCB. The request and photos go to the business email and
// to Dashboard → Service requests (POST /api/service/requests/pcb).
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, CircuitBoard, ImagePlus, X } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { useLocale } from '../../i18n/LocaleContext';

const MAX_PHOTOS = 5;
const MAX_SIZE = 6 * 1024 * 1024;
const EMPTY = { name: '', phone: '', email: '', company: '', board: '', machine: '', issue: '', city: '', website: '' }; // website = honeypot
const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none';

export default function PcbRepairPage() {
  const { t } = useLocale();
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [number, setNumber] = useState('');
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const addPhotos = (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    const good = files.filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type) && f.size <= MAX_SIZE);
    setError(good.length < files.length ? t('Photos must be JPG, PNG or WebP and under 6 MB each.') : '');
    setPhotos((list) => [...list, ...good.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, MAX_PHOTOS));
  };
  const removePhoto = (url) => { URL.revokeObjectURL(url); setPhotos((list) => list.filter((p) => p.url !== url)); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 7) { setError(t('Please enter your name and a valid phone number.')); return; }
    if (!photos.length) { setError(t('Please add at least one photo of the PCB.')); return; }
    if (form.issue.trim().length < 10) { setError(t('Please tell us what is wrong with the PCB (at least a sentence).')); return; }
    setSending(true);
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    photos.forEach((p) => data.append('photos', p.file));
    try {
      const res = await axios.post(`${getBaseURL()}/api/service/requests/pcb`, data, { timeout: 60000 });
      setNumber(res.data.number);
    } catch (err) {
      setError(err.response?.data?.message || t('Could not send your request. Please try WhatsApp.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><CircuitBoard className="h-3.5 w-3.5" /> {t('PCB Repair Service')}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('PCB repair for pharma and food machines')}</h1>
          <p className="mt-2 text-slate-300">{t('Send photos of your faulty circuit board and tell us the problem. Our team will check them and contact you.')}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {number ? (
          <div role="status" className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-slate-900">{t('Request received')}</h2>
            <p className="mt-2 text-slate-600">{t('Your request number is {number}. Our team will contact you soon.', { number })}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm" noValidate>
            <div>
              <p className="text-sm font-medium text-slate-700">{t('PCB photos')} *</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {photos.map((p) => (
                  <div key={p.url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(p.url)} aria-label={t('Remove')} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-orange-400">
                    <ImagePlus className="mb-1 h-5 w-5" aria-hidden="true" /> {t('Add photo')}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} className="sr-only" />
                  </label>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">{t('Up to 5 photos, front and back of the board.')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">{t('Your name')} *<input name="name" value={form.name} onChange={set} maxLength={100} autoComplete="name" className={input} /></label>
              <label className="text-sm font-medium text-slate-700">{t('Phone / WhatsApp')} *<input name="phone" value={form.phone} onChange={set} maxLength={30} inputMode="tel" autoComplete="tel" className={input} /></label>
              <label className="text-sm font-medium text-slate-700">{t('Email (optional)')}<input name="email" type="email" value={form.email} onChange={set} maxLength={150} autoComplete="email" className={input} /></label>
              <label className="text-sm font-medium text-slate-700">{t('Company')}<input name="company" value={form.company} onChange={set} maxLength={150} className={input} /></label>
              <label className="text-sm font-medium text-slate-700">{t('PCB name or number')}<input name="board" value={form.board} onChange={set} maxLength={100} className={input} /></label>
              <label className="text-sm font-medium text-slate-700">{t('Machine and model')}<input name="machine" value={form.machine} onChange={set} maxLength={200} className={input} /></label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">{t('City')}<input name="city" value={form.city} onChange={set} maxLength={100} className={input} /></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">{t('What is the problem?')} *<textarea name="issue" value={form.issue} onChange={set} rows={4} maxLength={3000} className={input} /></label>
            <div className="hidden" aria-hidden="true"><label>Website<input name="website" value={form.website} onChange={set} tabIndex={-1} autoComplete="off" /></label></div>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {sending ? t('Sending…') : t('Send PCB photos')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
