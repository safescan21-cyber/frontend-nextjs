// /industrial-areas/<area>: machinery for one industrial area in India (components/seo/industrialAreas.js)
import { notFound } from 'next/navigation';
import AreaPage from '../../../../components/pages/AreaPage';
import { industrialArea } from '../../../../components/seo/industrialAreas';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['industrial-areas', p.area]);

export default async function Page({ params }) {
  const { locale, area: slug } = await params;
  const area = industrialArea(slug);
  if (!area) notFound();
  return (
    <SitePage seo={await getSeo(locale, ['industrial-areas', slug])}>
      <AreaPage area={area} />
    </SitePage>
  );
}
