// One solution (/solutions/turnkey…)
import { notFound } from 'next/navigation';
import { SolutionPage } from '../../../../components/seo/SolutionPages';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['solutions', p.slug]);

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const seo = await getSeo(locale, ['solutions', slug]);
  if (seo.notFound) notFound();
  return (
    <SitePage seo={seo}>
      <SolutionPage />
    </SitePage>
  );
}
