'use client';
import LocalPrice from '../../../i18n/LocalPrice';
import { useLocale } from '../../../i18n/LocaleContext';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { FlaskConical, FileText, MessageCircle, Printer, Loader2, ChevronRight, Atom, ShoppingCart, Zap, Minus, Plus } from 'lucide-react';
import { addToCart } from '../../store/cartSlice';
import Seo from '../../Seo';
import NotFound from '../../seo/NotFound';
import ProductDocuments from '../../shop/ProductDetails/ProductDocuments';
import { apiBase, fetchJson, IDENTITY_FIELDS, GRADE_NAMES, prettyFormula } from './pharmaApiShared';

const WHATSAPP = '918700792607';

// One API (/pharma-api/:slug): chemical identity, composition, specs, documents and enquiry
// initial: the API as the server fetched it (app/[locale]/pharma-api/[slug])
const PharmaApiDetail = ({ initial }) => {
  const { t } = useLocale();
  const { slug } = useParams();
  const [item, setItem] = useState(initial || null);
  const [state, setState] = useState(initial ? 'ready' : 'loading'); // loading | ready | missing | error
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(initial?.minOrderQty || 1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (initial && (initial.slug === slug || initial._id === slug) && item === initial) return;
    setState('loading');
    fetchJson(`${apiBase()}/${encodeURIComponent(slug)}`)
      .then((d) => { setItem(d.item); setState('ready'); setImage(0); setQty(d.item.minOrderQty || 1); })
      .catch((e) => setState(e.status === 404 ? 'missing' : 'error'));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'loading') return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (state === 'missing') return <NotFound />;
  if (state === 'error') return <p className="mx-auto max-w-3xl p-8 text-center text-red-600">{t("Could not load this API. Please try again.")}</p>;

  const buyable = item.active && item.sellOnline && item.unitPrice > 0;
  const minQty = item.minOrderQty || 1;
  const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const rows = IDENTITY_FIELDS.filter(([k]) => item[k] && !(buyable && k === 'price')).map(([k, label]) => [label, k === 'molecularFormula' ? prettyFormula(item[k]) : item[k]]);
  if (buyable) rows.push(['Price', `${inr(item.unitPrice)} per ${item.unit} · minimum ${minQty} ${item.unit}`]);
  else if (!item.price) rows.push(['Price', 'On request']);
  const safeQty = Math.max(minQty, Math.min(100000, Number(qty) || minQty));
  const addLine = () => {
    dispatch(addToCart({
      _id: item._id, kind: 'api', slug: item.slug, name: item.name, price: item.unitPrice, unit: item.unit,
      minQty, quantity: safeQty, image: item.images?.[0] || '', category: item.category,
    }));
  };
  const onAdd = () => { addLine(); toast.success(`${safeQty} ${item.unit} of ${item.name} added to cart`); };
  const onBuy = () => { addLine(); navigate('/checkout'); };
  const enquiry = `/bulk-quote?product=${encodeURIComponent(item.name)}&source=pharma-api`;
  const waText = `Hello, I'd like a quote for ${item.name}${item.casNumber ? ` (CAS ${item.casNumber})` : ''}${item.grades?.length ? `, grade ${item.grades.join('/')}` : ''}.\nQuantity: \nhttps://www.foodpharmamachinery.com/pharma-api/${item.slug}`;
  const description = [item.name, item.chemicalName && `(${item.chemicalName})`, item.casNumber && `CAS ${item.casNumber}`, item.grades?.length && `${item.grades.join(', ')} grade`, item.category].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <Seo
        title={`${item.name}${item.casNumber ? ` (CAS ${item.casNumber})` : ''} – API Supplier`}
        description={`${description}. Composition, specifications, COA/MSDS and price on request.`}
        path={`/pharma-api/${item.slug}`}
        image={item.images?.[0]}
        noindex={!item.active}
      />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav aria-label={t("Breadcrumb")} className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 print:hidden">
          <Link to="/" className="hover:text-blue-600">{t("Home")}</Link><ChevronRight className="h-3.5 w-3.5" />
          <Link to="/pharma-api" className="hover:text-blue-600">{t("Pharma APIs")}</Link><ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-700">{item.name}</span>
        </nav>

        {!item.active && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{t("This API is hidden from the website. Only admins can see this page.")}</p>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Images */}
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {item.images?.length ? (
                <img src={item.images[image]} alt={`${item.name} ${image === 0 ? '' : `image ${image + 1}`}`.trim()} className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-slate-300"><Atom className="mx-auto h-24 w-24" /><p className="mt-2 text-sm text-slate-400">{item.molecularFormula ? prettyFormula(item.molecularFormula) : 'API'}</p></div>
              )}
            </div>
            {item.images?.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {item.images.map((u, i) => (
                  <button key={u} type="button" onClick={() => setImage(i)} aria-label={`Image ${i + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === image ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Identity */}
          <div>
            <p className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">{t(item.category)}</span>
              {item.grades?.map((g) => <span key={g} title={GRADE_NAMES[g]} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">{g}</span>)}
            </p>
            <h1 className="flex items-start gap-2 text-2xl font-bold text-slate-900 sm:text-3xl"><FlaskConical className="mt-1 h-7 w-7 shrink-0 text-blue-600" />{item.name}</h1>
            {item.chemicalName && <p className="mt-1 break-words text-base italic text-slate-600">{item.chemicalName}</p>}

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <caption className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold text-slate-800">{t("Chemical name & composition")}</caption>
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-slate-100 last:border-0">
                      <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium text-slate-500">{label}</th>
                      <td className="whitespace-pre-line break-words px-4 py-2.5 text-slate-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {buyable && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 print:hidden">
                <p className="text-2xl font-bold text-slate-900">{inr(item.unitPrice)} <span className="text-base font-medium text-slate-600">per {item.unit}</span> <LocalPrice inr={item.unitPrice} className="text-sm font-normal text-slate-500" /></p>
                <p className="text-xs text-slate-600">Minimum order {minQty} {item.unit} · GST and shipping shown at checkout · drug licence required</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                    <button type="button" onClick={() => setQty(Math.max(minQty, safeQty - 1))} disabled={safeQty <= minQty} aria-label={t("Decrease quantity")} className="px-3 py-2 text-slate-600 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                    <input type="number" inputMode="numeric" min={minQty} max={100000} value={qty} onChange={(e) => setQty(e.target.value)} onBlur={() => setQty(safeQty)} aria-label={`Quantity in ${item.unit}`} className="w-20 border-x border-slate-300 py-2 text-center text-sm focus:outline-none" />
                    <button type="button" onClick={() => setQty(safeQty + 1)} aria-label={t("Increase quantity")} className="px-3 py-2 text-slate-600"><Plus className="h-4 w-4" /></button>
                  </div>
                  <span className="text-sm text-slate-600">{item.unit} · <span className="font-semibold text-slate-900">{inr(item.unitPrice * safeQty)}</span></span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"><ShoppingCart className="h-4 w-4" /> {t("Add to cart")}</button>
                  <button type="button" onClick={onBuy} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"><Zap className="h-4 w-4" /> {t("Buy now")}</button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <Link to={enquiry} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600"><FileText className="h-4 w-4" /> {buyable ? 'Bulk quotation' : 'Request quotation'}</Link>
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700"><MessageCircle className="h-4 w-4" /> {t("WhatsApp enquiry")}</a>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Printer className="h-4 w-4" /> {t("Print")}</button>
            </div>
          </div>
        </div>

        {item.description && (
          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-bold text-slate-900">About {item.name}</h2>
            <p className="whitespace-pre-line text-slate-700">{item.description}</p>
          </section>
        )}

        {item.specifications?.length > 0 && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-slate-900">{t("Specifications")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500"><th className="py-2 pr-4 font-medium">{t("Test")}</th><th className="py-2 font-medium">{t("Limit")}</th></tr></thead>
                <tbody>
                  {item.specifications.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0"><td className="py-2.5 pr-4 font-medium text-slate-800">{s.key}</td><td className="py-2.5 text-slate-700">{s.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {item.documents?.length > 0 && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 print:hidden">
            <ProductDocuments documents={item.documents} subtitle="COA, MSDS/SDS, DMF summary and technical data sheets for this API." />
          </section>
        )}

        <p className="mt-6 text-xs text-slate-500">
          {t("Information is provided by the supplier for reference. Final specifications, documents and regulatory status are confirmed with each quotation.")}
        </p>
      </div>
    </div>
  );
};

export default PharmaApiDetail;
