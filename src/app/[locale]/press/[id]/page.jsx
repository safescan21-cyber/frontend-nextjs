// One press release
import { notFound } from 'next/navigation';
import PublicPressDetail from '../../../../components/pages/PublicPressDetail';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['press', p.id]);

export default async function Page({ params }) {
  const { locale, id } = await params;
  const seo = await getSeo(locale, ['press', id]);
  if (seo.notFound) notFound();
  const res = await getJson(`/api/press/${id}`);
  return (
    <SitePage seo={seo} path="/press/:id">
      <PublicPressDetail initial={res?.data} />
    </SitePage>
  );
}
