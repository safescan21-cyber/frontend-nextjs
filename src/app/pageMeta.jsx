// Server-side SEO shared by every page under app/[locale]: title, description,
// canonical, hreflang, Open Graph, structured data and the readable summary, all
// from seo/pageSeo.js (translated for the country versions by seo/localizeSeo.js).
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { seoForPath, DEFAULT_IMAGE } from '../seo/pageSeo';
import { localizeSeo } from '../seo/localizeSeo';
import { localeFromSegment, localeInfo } from '../i18n/locales';

// [locale] value -> locale code ('' = India); unknown folders are a 404
export const pageLocale = (segment) => {
  const locale = localeFromSegment(segment);
  if (locale == null) notFound();
  return locale;
};

// ('fr', ['shop', '123']) -> SEO of /shop/123 in the French version
export const getSeo = cache(async (segment, rest = []) => {
  const locale = localeFromSegment(segment) ?? '';
  const path = `/${rest.map(decodeURIComponent).join('/')}`.replace(/\/+$/, '') || '/';
  return { ...localizeSeo(await seoForPath(rest), locale, path), locale, isHome: rest.length === 0 };
});

// For a page's generateMetadata:  export const generateMetadata = seoMetadata((p) => ['shop', p.id]);
export const seoMetadata = (segmentsOf) => async ({ params }) => {
  const p = await params;
  return buildMetadata(await getSeo(p.locale, segmentsOf(p)));
};

export function buildMetadata(seo) {
  if (seo.notFound) return {}; // the page itself calls notFound()
  if (!seo.title && !seo.canonical) return {}; // login, cart… keep the site defaults

  const image = seo.image || DEFAULT_IMAGE;
  return {
    ...(seo.title && { title: { absolute: seo.title } }),
    ...(seo.description && { description: seo.description }),
    ...(seo.canonical && { alternates: { canonical: seo.canonical, ...(seo.alternates && { languages: seo.alternates }) } }),
    ...(seo.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      type: seo.type === 'article' ? 'article' : 'website',
      locale: localeInfo(seo.locale).lang.replace('-', '_'),
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

const jsonLd = (data, key) => (
  <script
    key={key}
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);

// The page's own structured data (Product, BreadcrumbList…). Organization, WebSite and
// the site navigation are written once per page by the header (components/Navbar.jsx).
export function PageJsonLd({ seo }) {
  return <>{(seo?.jsonLd || []).map((d, i) => jsonLd(d, i))}</>;
}
