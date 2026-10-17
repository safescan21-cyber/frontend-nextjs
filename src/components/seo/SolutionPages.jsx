import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, MessageCircle, FileText, ChevronRight } from 'lucide-react';
import Seo from '../Seo';
import { seoPages } from '../pages/seoPages';
import { SOLUTIONS, RESOURCES } from './solutionsData';
import NotFound from './NotFound';

const SITE_URL = 'https://www.foodpharmamachinery.com';
const WHATSAPP = 'https://wa.me/918700792607?text=';

const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((it, i) => (
        <li key={it.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
          {i < items.length - 1 ? (
            <Link to={it.path} className="hover:text-amber-600">{it.name}</Link>
          ) : (
            <span aria-current="page" className="text-slate-700">{it.name}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
});

const QuoteBox = ({ topic }) => (
  <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white md:p-8">
    <h2 className="text-xl font-bold md:text-2xl">Need help choosing the right machine?</h2>
    <p className="mt-2 text-slate-300">
      Tell us what you manufacture and your required output. Our team will recommend suitable equipment and send a quote.
    </p>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-900 hover:bg-amber-400">
        Request a quote <ArrowRight className="h-4 w-4" />
      </Link>
      <a
        href={`${WHATSAPP}${encodeURIComponent(`Hello, I'd like to know more about ${topic}.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
      >
        <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
      </a>
    </div>
  </div>
);

const pageWrap = 'min-h-screen bg-gray-50 px-4 pb-24 pt-6';

// /solutions — overview of all solution areas
export const SolutionsHub = () => {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }];
  return (
    <>
      <Seo
        {...seoPages.solutions}
        jsonLd={[
          breadcrumbJsonLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: SOLUTIONS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: `${SITE_URL}/solutions/${s.slug}` })),
          },
        ]}
      />
      <div className={pageWrap}>
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">Pharma & food processing solutions</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{seoPages.solutions.description}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/solutions/${s.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >
                  <h2 className="font-bold text-slate-800">{s.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{s.machines.slice(0, 3).join(' · ')}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10"><QuoteBox topic="your machinery" /></div>
        </div>
      </div>
    </>
  );
};

// /solutions/:slug
export const SolutionPage = () => {
  const { slug } = useParams();
  const s = SOLUTIONS.find((x) => x.slug === slug);
  if (!s) return <NotFound />;
  const seo = Object.values(seoPages).find((p) => p.path === `/solutions/${slug}`) || {};
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Solutions', path: '/solutions' }, { name: s.name, path: `/solutions/${slug}` }];
  const others = SOLUTIONS.filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <>
      <Seo
        title={seo.title || s.title}
        description={seo.description || s.intro}
        path={`/solutions/${slug}`}
        jsonLd={[
          breadcrumbJsonLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: s.title,
            description: s.intro,
            provider: { '@type': 'Organization', name: 'Food Pharma Machinery', url: SITE_URL },
            areaServed: 'Worldwide',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: s.title,
              itemListElement: s.machines.map((m) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: m } })),
            },
          },
        ]}
      />
      <div className={pageWrap}>
        <div className="mx-auto max-w-6xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">{s.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{s.intro}</p>

          <section className="mt-8" aria-labelledby="machines">
            <h2 id="machines" className="mb-4 text-xl font-bold text-slate-800">Machines & services</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {s.machines.map((m) => (
                <li key={m}>
                  <Link
                    to={`/shop?search=${encodeURIComponent(m)}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    {m} <ArrowRight className="h-4 w-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10" aria-labelledby="help">
            <h2 id="help" className="mb-4 text-xl font-bold text-slate-800">What we can help with</h2>
            <ul className="space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {p}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10"><QuoteBox topic={s.title} /></div>

          <section className="mt-10" aria-labelledby="related">
            <h2 id="related" className="mb-4 text-xl font-bold text-slate-800">Related solutions</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to={`/solutions/${o.slug}`} className="block rounded-xl border border-gray-200 bg-white p-4 font-semibold text-slate-700 hover:border-amber-300 hover:text-amber-700">
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};

// /resources/:slug — documents are sent on request, so these pages are not indexed yet
export const ResourcePage = () => {
  const { slug } = useParams();
  const r = RESOURCES.find((x) => x.slug === slug);
  if (!r) return <NotFound />;
  return (
    <>
      <Seo title={r.title} description={r.description} path={`/resources/${slug}`} noindex />
      <div className={pageWrap}>
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Resources', path: `/resources/${slug}` }, { name: r.name, path: `/resources/${slug}` }]} />
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <FileText className="mb-3 h-10 w-10 text-amber-500" />
            <h1 className="text-3xl font-bold text-slate-800">{r.title}</h1>
            <p className="mt-3 text-lg text-slate-600">{r.description}</p>
            <p className="mt-4 text-slate-600">
              Tell us the machine or product you're interested in and we'll send you the right documents.
            </p>
          </div>
          <div className="mt-6"><QuoteBox topic={r.title} /></div>
          <div className="mt-6 flex flex-wrap gap-2">
            {RESOURCES.filter((x) => x.slug !== slug).map((x) => (
              <Link key={x.slug} to={`/resources/${x.slug}`} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-amber-300">
                {x.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
