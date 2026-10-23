import Toggle from '../../../../ui/Toggle';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from '../../../../../shell/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FlaskConical, Plus, X, Loader2, ArrowLeft, ImagePlus } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import DocumentUploader from '../addProduct/DocumentUploader';
import { API_CATEGORIES, GRADES, apiBase, fetchJson, authHeaders } from '../../../pharmaApi/pharmaApiShared';

const EMPTY = {
  name: '', category: '', chemicalName: '', casNumber: '', molecularFormula: '', molecularWeight: '', composition: '',
  form: '', appearance: '', solubility: '', storage: '', shelfLife: '', packaging: '', moq: '', price: '', description: '',
  grades: [], images: [], specifications: [], documents: [], active: true,
  sellOnline: false, unitPrice: '', unit: 'kg', minOrderQty: 1,
};

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
  </label>
);
const input = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';

// Admin: add (/dashboard/pharma-apis/new) or edit (/dashboard/pharma-apis/:id/edit) an API
const PharmaApiForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [api, setApi] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [docsBusy, setDocsBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    fetchJson(`${apiBase()}/${id}`)
      .then(({ item }) => setApi({ ...EMPTY, ...Object.fromEntries(Object.entries(item).filter(([, v]) => v !== null && v !== undefined)) }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const set = (patch) => setApi((a) => ({ ...a, ...patch }));
  const onText = (e) => set({ [e.target.name]: e.target.value });
  const toggleGrade = (g) => setApi((a) => ({ ...a, grades: a.grades.includes(g) ? a.grades.filter((x) => x !== g) : [...a.grades, g] }));

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (api.images.length + files.length > 10) { toast.error('Up to 10 images per API.'); return; }
    setImgBusy(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await axios.post(`${getBaseURL()}/api/uploadImages`, fd, { withCredentials: true, headers: authHeaders() });
      setApi((a) => ({ ...a, images: [...a.images, ...(res.data.urls || [])] }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setImgBusy(false);
    }
  };

  const setSpec = (i, patch) => setApi((a) => ({ ...a, specifications: a.specifications.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (!api.name.trim() || !api.category.trim()) { setError('Please enter the API name and category.'); return; }
    if (api.casNumber && !/^\d{2,7}-\d{2}-\d$/.test(api.casNumber.trim())) { setError('CAS number format looks wrong — it should look like 103-90-2.'); return; }
    if (api.sellOnline && !(Number(api.unitPrice) > 0)) { setError('Enter the price per unit to sell this API online.'); return; }
    setSaving(true);
    try {
      const body = {
        ...api,
        unitPrice: Number(api.unitPrice) || 0,
        minOrderQty: Math.max(1, parseInt(api.minOrderQty, 10) || 1),
        specifications: api.specifications.filter((s) => s.key.trim() && s.value.trim()),
      };
      for (const k of ['_id', 'slug', 'author', 'createdAt', 'updatedAt', '__v']) delete body[k];
      const { item } = await fetchJson(editing ? `${apiBase()}/${id}` : apiBase(), { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      toast.success(editing ? 'API updated' : 'API added');
      navigate('/dashboard/pharma-apis', { state: { saved: item.slug } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="px-4 pb-6 pt-6 md:px-6">
      <Link to="/dashboard/pharma-apis" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> All Pharma APIs</Link>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-800"><FlaskConical className="h-6 w-6 text-blue-600" />{editing ? 'Edit Pharma API' : 'Add Pharma API'}</h1>
      <p className="mb-6 text-sm text-gray-500">Active pharmaceutical ingredient / bulk drug. Buyers see these on the Pharma API page and send enquiries.</p>

      <form onSubmit={save} className="max-w-4xl space-y-6">
        <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <h2 className="font-semibold text-gray-800 sm:col-span-2">Basic details</h2>
          <Field label="API name *" hint="Generic name, e.g. Paracetamol, Metformin Hydrochloride">
            <input name="name" value={api.name} onChange={onText} required maxLength={120} className={input} />
          </Field>
          <Field label="Therapeutic category *" hint="Pick one or type your own">
            <input name="category" value={api.category} onChange={onText} required maxLength={60} list="api-categories" className={input} />
            <datalist id="api-categories">{API_CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <div className="sm:col-span-2">
            <span className="block text-sm font-medium text-gray-700">Pharmacopoeia grades</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button key={g} type="button" onClick={() => toggleGrade(g)} aria-pressed={api.grades.includes(g)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${api.grades.includes(g) ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <Toggle className="sm:col-span-2" checked={api.active} onChange={(v) => set({ active: v })} label="Show on the website" description="Off = hidden without deleting" />
        </section>

        <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <h2 className="font-semibold text-gray-800 sm:col-span-2">Chemical identity &amp; composition</h2>
          <div className="sm:col-span-2">
            <Field label="Chemical name (IUPAC)" hint="e.g. N-(4-hydroxyphenyl)acetamide">
              <input name="chemicalName" value={api.chemicalName} onChange={onText} maxLength={400} className={input} />
            </Field>
          </div>
          <Field label="CAS number" hint="Format 103-90-2"><input name="casNumber" value={api.casNumber} onChange={onText} maxLength={20} className={input} /></Field>
          <Field label="Molecular formula" hint="e.g. C8H9NO2"><input name="molecularFormula" value={api.molecularFormula} onChange={onText} maxLength={80} className={input} /></Field>
          <Field label="Molecular weight" hint="e.g. 151.16 g/mol"><input name="molecularWeight" value={api.molecularWeight} onChange={onText} maxLength={40} className={input} /></Field>
          <Field label="Physical form" hint="e.g. White crystalline powder"><input name="form" value={api.form} onChange={onText} maxLength={60} className={input} /></Field>
          <div className="sm:col-span-2">
            <Field label="Composition / assay" hint="e.g. Paracetamol IP, assay 99.0–101.0% on dried basis; salt form, purity, impurities">
              <textarea name="composition" value={api.composition} onChange={onText} maxLength={2000} rows={3} className={input} />
            </Field>
          </div>
          <Field label="Appearance"><input name="appearance" value={api.appearance} onChange={onText} maxLength={200} className={input} /></Field>
          <Field label="Solubility"><input name="solubility" value={api.solubility} onChange={onText} maxLength={300} className={input} /></Field>
          <Field label="Storage"><input name="storage" value={api.storage} onChange={onText} maxLength={200} className={input} /></Field>
          <Field label="Shelf life / retest period"><input name="shelfLife" value={api.shelfLife} onChange={onText} maxLength={60} className={input} /></Field>
        </section>

        <section className={`rounded-xl border p-4 ${api.sellOnline ? 'border-green-300 bg-green-50/60' : 'border-gray-200 bg-white'}`}>
          <Toggle tone="green" checked={api.sellOnline} onChange={(v) => set({ sellOnline: v })} label="Sell online (Add to cart, checkout & payment like machines)" labelClassName="font-semibold text-gray-800" description="Off = enquiry only. Buyers must enter their drug licence number at checkout." />
          {api.sellOnline && (
            <div className="mt-3 grid gap-4 pl-6 sm:grid-cols-3">
              <Field label="Price per unit (₹) *" hint="Charged at checkout; GST as for machines">
                <input type="number" inputMode="decimal" min="0" step="0.01" name="unitPrice" value={api.unitPrice} onChange={onText} className={input} />
              </Field>
              <Field label="Unit">
                <select name="unit" value={api.unit} onChange={onText} className={input}>
                  <option value="kg">kg</option><option value="g">g</option><option value="L">litre</option>
                </select>
              </Field>
              <Field label="Minimum order quantity" hint={`in ${api.unit}`}>
                <input type="number" inputMode="numeric" min="1" step="1" name="minOrderQty" value={api.minOrderQty} onChange={onText} className={input} />
              </Field>
            </div>
          )}
        </section>

        <section className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
          <h2 className="font-semibold text-gray-800 sm:col-span-3">Commercial</h2>
          <Field label="Packaging" hint="e.g. 25 kg HDPE drum"><input name="packaging" value={api.packaging} onChange={onText} maxLength={200} className={input} /></Field>
          <Field label="Minimum order" hint="e.g. 100 kg"><input name="moq" value={api.moq} onChange={onText} maxLength={60} className={input} /></Field>
          <Field label="Price (optional)" hint="e.g. ₹2,400/kg — leave empty for 'on request'"><input name="price" value={api.price} onChange={onText} maxLength={60} className={input} /></Field>
          <div className="sm:col-span-3">
            <Field label="Description">
              <textarea name="description" value={api.description} onChange={onText} maxLength={10000} rows={5} className={input} placeholder="Uses, therapeutic class, regulatory status (DMF, CEP, WC), manufacturing site…" />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Specifications <span className="text-xs font-normal text-gray-400">(test → limit, e.g. Loss on drying → NMT 0.5%)</span></h2>
            <button type="button" onClick={() => set({ specifications: [...api.specifications, { key: '', value: '' }] })} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"><Plus className="h-4 w-4" /> Add row</button>
          </div>
          {api.specifications.length === 0 && <p className="text-xs text-gray-400">No specifications yet.</p>}
          <div className="space-y-2">
            {api.specifications.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input value={s.key} onChange={(e) => setSpec(i, { key: e.target.value })} placeholder="Test" aria-label="Specification test" maxLength={80} className={`${input} mt-0 flex-1`} />
                <input value={s.value} onChange={(e) => setSpec(i, { value: e.target.value })} placeholder="Limit" aria-label="Specification limit" maxLength={300} className={`${input} mt-0 flex-1`} />
                <button type="button" onClick={() => set({ specifications: api.specifications.filter((_, j) => j !== i) })} aria-label="Remove row" className="rounded-full p-2 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <h2 className="font-semibold text-gray-800">Images <span className="text-xs font-normal text-gray-400">(optional — structure, product photo, packaging)</span></h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {api.images.map((url) => (
                <div key={url} className="relative h-24 w-24 overflow-hidden rounded border border-gray-200">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => set({ images: api.images.filter((u) => u !== url) })} aria-label="Remove image" className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"><X size={12} /></button>
                </div>
              ))}
              <label className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-500 hover:border-blue-400 ${imgBusy ? 'opacity-50' : ''}`}>
                {imgBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                <span className="mt-1">Add images</span>
                <input type="file" accept="image/*" multiple onChange={uploadImages} disabled={imgBusy} className="sr-only" aria-label="Add images" />
              </label>
            </div>
          </div>
          <DocumentUploader documents={api.documents} setDocuments={(fn) => setApi((a) => ({ ...a, documents: typeof fn === 'function' ? fn(a.documents) : fn }))} onBusyChange={setDocsBusy} />
          <p className="text-xs text-gray-500">Tip: attach the COA, MSDS/SDS, DMF summary or technical data sheet so buyers can read them.</p>
        </section>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving || imgBusy || docsBusy} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving…' : imgBusy || docsBusy ? 'Uploading…' : editing ? 'Save changes' : 'Add API'}
          </button>
          <Link to="/dashboard/pharma-apis" className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default PharmaApiForm;
