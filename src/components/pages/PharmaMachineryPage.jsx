'use client';
// /pharma-machinery: the main page for "pharma machinery" searches. Machine types, the
// real machines from the shop with prices, lines by dosage form, buying tips, FAQs and
// a quick quote. Content: components/seo/pharmaMachinery.js
import { Factory, Truck, Wrench, ShieldCheck, FileText, MapPin, ArrowRight } from 'lucide-react';
import { Link } from '../../shell/router';
import QuickQuote from '../quote/QuickQuote';
import ProductFaqs from '../shop/ProductDetails/ProductFaqs';
import { CITY_HUBS } from '../seo/cityHubs';
import { MACHINE_TYPES, BY_DOSAGE_FORM, BUYING_TIPS, pharmaMachineryFaqs, realMachines } from '../seo/pharmaMachinery';
import { PRODUCT_DATA } from './productCategoryData';

const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const rs = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
// Cloudinary photo (or a video's first frame) at card size
const thumb = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  if (url.includes('/video/upload/')) return url.replace('/video/upload/', '/video/upload/so_1,w_480,h_360,c_pad,b_white/').replace(/\.\w+(\?.*)?$/, '.jpg');
  return url.replace('/image/upload/', '/image/upload/w_480,h_360,c_pad,b_white,f_auto,q_auto/');
};

export default function PharmaMachineryPage({ products = [] }) {
  const machines = realMachines(products);
  const faqs = pharmaMachineryFaqs(machines);
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Factory className="h-3.5 w-3.5" /> Made in Haridwar, India</p>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Pharma machinery manufacturer &amp; supplier in India</h1>
          <p className="mt-4 max-w-3xl text-lg text-blue-50">
            Food Pharma Machinery (PureLine Machinery Pvt. Ltd.) makes and supplies pharmaceutical machines for tablets, capsules, liquids, injectables and packaging, from single machines to complete lines, with installation support, AMC and spare parts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#quick-quote" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">Get a quotation <ArrowRight className="h-4 w-4" /></a>
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-semibold text-white hover:bg-white/25">See machines &amp; prices</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section aria-labelledby="types">
            <h2 id="types" className="text-2xl font-bold text-slate-900">Types of pharma machinery we supply</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {MACHINE_TYPES.map((m) => {
                const card = (
                  <>
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">{m.text}</span>
                  </>
                );
                return PRODUCT_DATA[m.slug] ? (
                  <Link key={m.slug} to={`/products/${m.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400">{card}</Link>
                ) : (
                  <div key={m.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{card}</div>
                );
              })}
            </div>
          </section>

          {machines.length > 0 && (
            <section aria-labelledby="machines">
              <h2 id="machines" className="text-2xl font-bold text-slate-900">Pharma machines with prices</h2>
              <p className="mt-1 text-sm text-slate-500">Ex-works prices; taxes, freight and installation are quoted separately.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {machines.map((p) => {
                  const img = thumb(p.images?.[0]);
                  return (
                    <Link key={p._id} to={`/shop/${p._id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:border-blue-400">
                      {img ? <img src={img} alt={p.name} loading="lazy" width="480" height="360" className="aspect-[4/3] w-full bg-white object-contain" /> : <div className="aspect-[4/3] bg-slate-100" />}
                      <span className="block p-3">
                        <span className="block text-xs font-medium uppercase text-slate-500">{label(p.category)}</span>
                        <span className="mt-0.5 block font-semibold text-slate-900">{p.name}</span>
                        <span className="mt-1 block font-bold text-blue-700">{Number(p.price) > 0 ? rs(p.price) : 'Price on request'}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link to="/shop" className="mt-4 inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline">All machines in the shop <ArrowRight className="h-4 w-4" /></Link>
            </section>
          )}

          <section aria-labelledby="lines">
            <h2 id="lines" className="text-2xl font-bold text-slate-900">Which machines does your plant need?</h2>
            <div className="mt-4 space-y-3">
              {BY_DOSAGE_FORM.map((d) => (
                <Link key={d.form} to={d.to} className="block rounded-xl bg-white p-4 shadow-sm hover:ring-2 hover:ring-blue-200">
                  <span className="font-semibold text-slate-900">{d.form}</span>
                  <span className="mt-1 block text-sm text-slate-600">{d.line}</span>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Planning a new plant? Try the <Link to="/project-cost-calculator" className="font-semibold text-blue-600 hover:underline">plant cost calculator</Link> or download the free <Link to="/pharma-plant-checklist" className="font-semibold text-blue-600 hover:underline">plant setup checklist</Link>.
            </p>
          </section>

          <section aria-labelledby="tips">
            <h2 id="tips" className="text-2xl font-bold text-slate-900">How to choose pharma machinery</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {BUYING_TIPS.map(([title, text]) => (
                <li key={title} className="rounded-xl bg-white p-4 shadow-sm">
                  <strong className="text-slate-900">{title}</strong>
                  <span className="mt-1 block text-sm text-slate-600">{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="work">
            <h2 id="work" className="text-2xl font-bold text-slate-900">How we work</h2>
            <ol className="mt-4 space-y-3">
              {[
                [FileText, 'Quotation', 'Tell us your product, output and budget. We send a written quotation with specifications, delivery time and terms.'],
                [Factory, 'Manufacturing & testing', 'Your machine is built and tested at our factory in Haridwar, Uttarakhand.'],
                [Truck, 'Dispatch', 'Packed and shipped to your plant anywhere in India, or quoted for export.'],
                [Wrench, 'Installation & training', 'Installation, commissioning and operator training can be arranged with the order.'],
                [ShieldCheck, 'Service, AMC & spares', 'Service requests, annual maintenance contracts and spare parts after installation.'],
              ].map(([Icon, title, text]) => (
                <li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-slate-600">
              <Link to="/factory" className="font-semibold text-blue-600 hover:underline">Our factory</Link> · <Link to="/spares" className="font-semibold text-blue-600 hover:underline">Spare parts</Link> · <Link to="/amc" className="font-semibold text-blue-600 hover:underline">AMC plans</Link> · <Link to="/service-request" className="font-semibold text-blue-600 hover:underline">Service request</Link> · <Link to="/compare" className="font-semibold text-blue-600 hover:underline">Compare machines</Link>
            </p>
          </section>

          <section aria-labelledby="hubs">
            <h2 id="hubs" className="text-2xl font-bold text-slate-900">Pharma machinery across India</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CITY_HUBS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/pharma-machinery-supplier/${c.slug}`} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-blue-400">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> {c.city}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="-mx-4">
            <ProductFaqs faqs={faqs} title="Pharma machinery: frequently asked questions" />
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <QuickQuote id="quick-quote" machine="" />
        </aside>
      </div>
    </div>
  );
}
