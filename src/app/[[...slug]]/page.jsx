// Every URL of the site. The server sends that page's SEO tags, structured data
// and a short readable summary; in the browser the React app (React Router)
// renders the real page. Step 2 of the migration turns individual pages into
// full server components with their own folders under src/app.
import { cache } from 'react';
import { preload } from 'react-dom';
import { notFound } from 'next/navigation';
import ClientApp from '../ClientApp';
import SeoSummary from '../SeoSummary';
import { seoForPath, DEFAULT_IMAGE } from '../../seo/pageSeo';
import { organizationNode, websiteNode } from '../../components/seo/organization';
import { orderedSlides, slideSrcSet } from '../../components/heroSlidesData';

const API = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.foodpharmamachinery.com').replace(/\/api\/?$/, '').replace(/\/$/, '');

// Home page: start downloading the first hero slide with the HTML instead of after the
// app's JavaScript has loaded (it is the largest thing on screen, Google's LCP).
const preloadHeroImage = async () => {
  let apiSlides = [];
  try {
    const res = await fetch(`${API}/api/hero-slides`, { next: { revalidate: 300 } });
    if (res.ok) apiSlides = await res.json();
  } catch {
    /* API down: the defaults are shown, so preload those */
  }
  const first = orderedSlides(apiSlides)[0];
  if (!first?.url) return;
  const srcSet = slideSrcSet(first.url);
  preload(first.url, { as: 'image', fetchPriority: 'high', ...(srcSet && { imageSrcSet: srcSet, imageSizes: '100vw' }) });
};

const getSeo = cache((slug) => seoForPath(slug || []));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const seo = await getSeo(slug);
  if (seo.notFound) return {}; // the page itself calls notFound()
  if (!seo.title && !seo.canonical) return {}; // login, cart… keep the site defaults

  const image = seo.image || DEFAULT_IMAGE;
  return {
    ...(seo.title && { title: { absolute: seo.title } }),
    ...(seo.description && { description: seo.description }),
    ...(seo.canonical && { alternates: { canonical: seo.canonical } }),
    ...(seo.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      type: seo.type === 'article' ? 'article' : 'website',
      url: seo.canonical,
      ...(seo.title && { title: seo.title }),
      ...(seo.description && { description: seo.description }),
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      ...(seo.title && { title: seo.title }),
      ...(seo.description && { description: seo.description }),
      images: [image],
    },
  };
}

const jsonLd = (data) => (
  <script
    key={data['@type'] || 'graph'}
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);

export default async function Page({ params }) {
  const { slug } = await params;
  const seo = await getSeo(slug);
  if (seo.notFound) notFound();
  if (!slug || slug.length === 0) await preloadHeroImage();

  return (
    <ClientApp>
      {jsonLd({ '@context': 'https://schema.org', '@graph': [organizationNode, websiteNode] })}
      {(seo.jsonLd || []).map((d) => jsonLd(d))}
      <SeoSummary summary={seo.summary} />
    </ClientApp>
  );
}
