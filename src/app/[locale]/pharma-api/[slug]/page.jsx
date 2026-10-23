// /pharma-api/<slug>: one active pharmaceutical ingredient
import { notFound } from 'next/navigation';
import PharmaApiDetail from '../../../../components/pages/pharmaApi/PharmaApiDetail';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['pharma-api', p.slug]);

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const seo = await getSeo(locale, ['pharma-api', slug]);
  if (seo.notFound) notFound();
  const res = await getJson(`/api/pharma-apis/${encodeURIComponent(slug)}`);
  return (
    <SitePage seo={seo}>
      <PharmaApiDetail initial={res?.item} />
    </SitePage>
  );
}
