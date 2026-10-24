'use client';
// /pharma-machinery and /food-machinery: the main pages for "pharma machinery" and
// "food machinery" searches. Machine types, the real machines from the shop with prices,
// lines by product, buying tips, FAQs and a quick quote.
//   <MachineryHubPage hub="pharma" products={…} />   content: components/seo/machineryHubs.js
import { Factory, Truck, Wrench, ShieldCheck, FileText, MapPin, ArrowRight } from 'lucide-react';
import { Link } from '../../shell/router';
import QuickQuote from '../quote/QuickQuote';
import ProductFaqs from '../shop/ProductDetails/ProductFaqs';
import { CITY_HUBS } from '../seo/cityHubs';
import { MACHINERY_HUBS, realMachines } from '../seo/machineryHubs';
import { PRODUCT_DATA } from './productCategoryData';

const label = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const rs = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
// Cloudinary photo (or a video's first frame) at card size
const thumb = (url) => {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  if (url.includes('/video/upload/')) return url.replace('/video/upload/', '/video/upload/so_1,w_480,h_360,c_pad,b_white/').replace(/\.\w+(\?.*)?$/, '.jpg');
  return url.replace('/image/upload/', '/image/upload/w_480,h_360,c_pad,b_white,f_auto,q_auto/');
};

// Full class names (Tailwind only keeps classes it can see written out)
const THEMES = {
  blue: { hero: 'from-blue-800 to-indigo-900', heroText: 'text-blue-50', icon: 'text-blue-600', link: 'text-blue-600', price: 'text-blue-700', hover: 'hover:border-blue-400', ring: 'hover:ring-blue-200' },
  emerald: { hero: 'from-emerald-700 to-teal-900', heroText: 'text-emerald-50', icon: 'text-emerald-600', link: 'text-emerald-700', price: 'text-emerald-700', hover: 'hover:border-emerald-400', ring: 'hover:ring-emerald-200' },
};

export default function MachineryHubPage({ hub: hubKey = 'pharma', products = [] }) {
  const hub = MACHINERY_HUBS[hubKey] || MACHINERY_HUBS.pharma;
  const t = THEMES[hub.theme] || THEMES.blue;
  const machines = realMachines(products, hub.categories);
  const faqs = hub.faqs(machines);
  const a = `font-semibold ${t.link} hover:underline`;
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <section className={`bg-gradient-to-r ${t.hero} px-4 py-12 text-white`}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"><Factory className="h-3.5 w-3.5" /> Made in Haridwar, India</p>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{hub.h1}</h1>
          <p className={`mt-4 max-w-3xl text-lg ${t.heroText}`}>{hub.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#quick-quote" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">Get a quotation <ArrowRight className="h-4 w-4" /></a>
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-semibold text-white hover:bg-white/25">See machines &amp; prices</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          <section aria-labelledby="types">
            <h2 id="types" className="text-2xl font-bold text-slate-900">{hub.typesTitle}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hub.types.map((m) => {
                const card = (
                  <>
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">{m.text}</span>
                  </>
                );
                return PRODUCT_DATA[m.slug] ? (
                  <Link key={m.slug} to={`/products/${m.slug}`} className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${t.hover}`}>{card}</Link>
                ) : (
                  <div key={m.slug} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{card}</div>
                );
              })}
            </div>
          </section>

          {machines.length > 0 && (
            <section aria-labelledby="machines">
              <h2 id="machines" className="text-2xl font-bold text-slate-900">{hub.machinesTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">Ex-works prices; taxes, freight and installation are quoted separately.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {machines.map((p) => {
                  const img = thumb(p.images?.[0]);
                  return (
                    <Link key={p._id} to={`/shop/${p._id}`} className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${t.hover}`}>
                      {img ? <img src={img} alt={p.name} loading="lazy" width="480" height="360" className="aspect-[4/3] w-full bg-white object-contain" /> : <div className="aspect-[4/3] bg-slate-100" />}
                      <span className="block p-3">
                        <span className="block text-xs font-medium uppercase text-slate-500">{label(p.category)}</span>
                        <span className="mt-0.5 block font-semibold text-slate-900">{p.name}</span>
                        <span className={`mt-1 block font-bold ${t.price}`}>{Number(p.price) > 0 ? rs(p.price) : 'Price on request'}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <Link to="/shop" className={`mt-4 inline-flex items-center gap-1 ${a}`}>All machines in the shop <ArrowRight className="h-4 w-4" /></Link>
            </section>
          )}

          <section aria-labelledby="lines">
            <h2 id="lines" className="text-2xl font-bold text-slate-900">{hub.linesTitle}</h2>
            <div className="mt-4 space-y-3">
              {hub.lines.map((d) => (
                <Link key={d.form} to={d.to} className={`block rounded-xl bg-white p-4 shadow-sm hover:ring-2 ${t.ring}`}>
                  <span className="font-semibold text-slate-900">{d.form}</span>
                  <span className="mt-1 block text-sm text-slate-600">{d.line}</span>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Planning a new plant? Try the <Link to="/project-cost-calculator" className={a}>plant cost calculator</Link>, see <Link to="/solutions/turnkey" className={a}>turnkey projects</Link> or download the free <Link to="/pharma-plant-checklist" className={a}>plant setup checklist</Link>.
            </p>
          </section>

          <section aria-labelledby="tips">
            <h2 id="tips" className="text-2xl font-bold text-slate-900">{hub.tipsTitle}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {hub.tips.map(([title, text]) => (
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
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${t.icon}`} aria-hidden="true" />
                  <span><strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span></span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-slate-600">
              <Link to="/factory" className={a}>Our factory</Link> · <Link to="/spares" className={a}>Spare parts</Link> · <Link to="/amc" className={a}>AMC plans</Link> · <Link to="/service-request" className={a}>Service request</Link> · <Link to="/compare" className={a}>Compare machines</Link> · <Link to={hub.other.to} className={a}>{hub.other.label}</Link>
            </p>
          </section>

          {hub.showHubs && (
            <section aria-labelledby="hubs">
              <h2 id="hubs" className="text-2xl font-bold text-slate-900">Pharma machinery across India</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {CITY_HUBS.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/pharma-machinery-supplier/${c.slug}`} className={`inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 ${t.hover}`}>
                      <MapPin className={`h-3.5 w-3.5 ${t.icon}`} /> {c.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="-mx-4">
            <ProductFaqs faqs={faqs} title={hub.faqTitle} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <QuickQuote id="quick-quote" machine="" />
        </aside>
      </div>
    </div>
  );
}
