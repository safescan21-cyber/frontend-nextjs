'use client';
// Service request (breakdown / visit) or AMC booking. Logged-in customers can add up to
// 5 photos and later follow the request in their dashboard. Backend: /api/service/requests
//   <ServiceForm type="service" />     <ServiceForm type="amc" plans={plans} planId={id} />
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, Loader2, Camera, X } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { Link } from '../../shell/router';
import { whatsappLink } from '../../utlis/contact';
import { getLeadOrigin } from '../../utlis/leadOrigin';

const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };

export default function ServiceForm({ type = 'service', plans = [], planId = '', className = '' }) {
  const isAmc = type === 'amc';
  const user = useSelector((s) => s.auth?.user);
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '', machineName: '', machineModel: '', serialNumber: '', installedYear: '',
    issue: '', urgency: 'normal', city: '', state: '', planId: planId || plans[0]?._id || '', machines: 1, website: '',
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.username || '', email: f.email || user.email || '' }));
  }, [user]);
  useEffect(() => { if (planId) setForm((f) => ({ ...f, planId })); }, [planId]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const addPhotos = async (files) => {
    const list = [...files].slice(0, 5 - photos.length);
    if (!list.length) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      list.forEach((f) => body.append('images', f));
      const res = await fetch(`${getBaseURL()}/api/uploadImages`, { method: 'POST', body, credentials: 'include', headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not upload the photos');
      setPhotos((p) => [...p, ...data.urls].slice(0, 5));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const plan = plans.find((p) => p._id === form.planId);
      const res = await fetch(`${getBaseURL()}/api/service/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token() && { Authorization: `Bearer ${token()}` }) },
        credentials: 'include',
        body: JSON.stringify({ ...form, type, photos, planName: plan?.name || '', origin: getLeadOrigin() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send your request. Please call or WhatsApp us.');
      setDone(data.number);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className={`rounded-2xl border border-green-200 bg-green-50 p-6 ${className}`} role="status">
        <p className="flex items-center gap-2 text-lg font-bold text-green-800"><CheckCircle className="h-6 w-6" aria-hidden="true" /> Request received · {done}</p>
        <p className="mt-2 text-sm text-green-900">
          Our service team will call you {form.urgency === 'machine_down' ? 'as soon as possible' : 'within 1 business day'}.
          {user ? <> You can follow it in <Link to="/dashboard/service" className="font-semibold underline">My service requests</Link>.</> : ' Log in with the same email to follow it in your account.'}
        </p>
        <a href={whatsappLink(`Hello, I sent ${isAmc ? 'an AMC' : 'a service'} request ${done}${form.machineName ? ` for ${form.machineName}` : ''}. Name: ${form.name}, phone ${form.phone}.`)} target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
          Send it on WhatsApp too
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        {isAmc && plans.length > 0 && (
          <label className="text-sm font-medium text-slate-700">Plan
            <select value={form.planId} onChange={(e) => set({ planId: e.target.value })} className={field}>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              <option value="">Not sure – please advise</option>
            </select>
          </label>
        )}
        {isAmc && (
          <label className="text-sm font-medium text-slate-700">Number of machines
            <input type="number" min="1" max="500" value={form.machines} onChange={(e) => set({ machines: e.target.value })} className={field} />
          </label>
        )}
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">{isAmc ? 'Machines to cover' : 'Machine'}{!isAmc && <span className="text-red-500"> *</span>}
          <input value={form.machineName} onChange={(e) => set({ machineName: e.target.value })} required={!isAmc} maxLength={200} placeholder={isAmc ? 'e.g. 2 tablet presses, 1 capsule filler' : 'e.g. Rotary Tablet Press'} className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Model
          <input value={form.machineModel} onChange={(e) => set({ machineModel: e.target.value })} maxLength={100} placeholder="e.g. ZP-35D" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Serial number
          <input value={form.serialNumber} onChange={(e) => set({ serialNumber: e.target.value })} maxLength={100} placeholder="On the machine's name plate" className={field} />
        </label>
        {!isAmc && (
          <>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">What is the problem?<span className="text-red-500"> *</span>
              <textarea value={form.issue} onChange={(e) => set({ issue: e.target.value })} required minLength={10} maxLength={3000} rows={4} placeholder="What happens, since when, any error message or noise…" className={field} />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium text-slate-700">How urgent?</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {[['normal', 'Normal'], ['urgent', 'Urgent'], ['machine_down', 'Machine stopped']].map(([v, l]) => (
                  <label key={v} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${form.urgency === v ? (v === 'machine_down' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'border-slate-300 text-slate-700'}`}>
                    <input type="radio" name="urgency" value={v} checked={form.urgency === v} onChange={() => set({ urgency: v })} className="sr-only" />{l}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-slate-700">Photos or a short video still <span className="font-normal text-slate-500">(optional, up to 5)</span></p>
              {user ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {photos.map((u) => (
                    <span key={u} className="relative">
                      <img src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button type="button" onClick={() => setPhotos((p) => p.filter((x) => x !== u))} aria-label="Remove photo" className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  {photos.length < 5 && (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-400 px-3 py-2 text-sm text-slate-600 hover:border-blue-500">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Add photos
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} disabled={uploading} />
                    </label>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500"><Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in</Link> to attach photos, or send them on WhatsApp after this form.</p>
              )}
            </div>
          </>
        )}
        <label className="text-sm font-medium text-slate-700">Your name<span className="text-red-500"> *</span>
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Company
          <input value={form.company} onChange={(e) => set({ company: e.target.value })} maxLength={150} autoComplete="organization" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Phone / WhatsApp<span className="text-red-500"> *</span>
          <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} required type="tel" maxLength={30} autoComplete="tel" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">Email
          <input value={form.email} onChange={(e) => set({ email: e.target.value })} type="email" maxLength={150} autoComplete="email" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">City
          <input value={form.city} onChange={(e) => set({ city: e.target.value })} maxLength={100} autoComplete="address-level2" className={field} />
        </label>
        <label className="text-sm font-medium text-slate-700">State
          <input value={form.state} onChange={(e) => set({ state: e.target.value })} maxLength={100} autoComplete="address-level1" className={field} />
        </label>
        {!isAmc && (
          <label className="text-sm font-medium text-slate-700">Year installed
            <input type="number" min="1950" max="2100" value={form.installedYear} onChange={(e) => set({ installedYear: e.target.value })} className={field} />
          </label>
        )}
        <input type="text" name="website" value={form.website} onChange={(e) => set({ website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={sending || uploading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:px-8">
        {sending && <Loader2 className="h-4 w-4 animate-spin" />} {isAmc ? 'Request AMC' : 'Send service request'}
      </button>
    </form>
  );
}
