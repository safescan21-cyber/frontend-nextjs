// /resources/<slug>: guides (kept out of Google, see seo/pageSeo.js)
import { notFound } from 'next/navigation';
import { ResourcePage } from '../../../../components/seo/SolutionPages';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['resources', p.slug]);

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const seo = await getSeo(locale, ['resources', slug]);
  if (seo.notFound) notFound();
  return (
    <SitePage seo={seo} path="/resources/:slug">
      <ResourcePage />
    </SitePage>
  );
}
