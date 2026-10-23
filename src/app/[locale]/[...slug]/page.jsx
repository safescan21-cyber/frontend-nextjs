// Pages that are not Next.js pages yet (login, cart, dashboard, pharma APIs…).
// The server sends the page's SEO tags, structured data and a short readable
// summary; in the browser App.jsx (React Router) renders the real page.
import { notFound } from 'next/navigation';
import ClientApp from '../../ClientApp';
import SeoSummary from '../../SeoSummary';
import { getSeo, seoMetadata, PageJsonLd } from '../../pageMeta';

export const generateMetadata = seoMetadata((p) => p.slug);

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const seo = await getSeo(locale, slug);
  if (seo.notFound) notFound();

  return (
    <>
      <PageJsonLd seo={seo} />
      <ClientApp>
        <SeoSummary summary={seo.summary} />
      </ClientApp>
    </>
  );
}
