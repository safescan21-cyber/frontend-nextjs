// /industrial-areas/<area>: machinery for one industrial area in India (components/seo/industrialAreas.js)
import { notFound } from 'next/navigation';
import AreaPage from '../../../../components/pages/AreaPage';
import { cardFields } from '../../../../components/pages/productCategoryData';
import { industrialArea } from '../../../../components/seo/industrialAreas';
import { machinesFor } from '../../../../components/seo/machineryHubs';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { productList } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['industrial-areas', p.area]);

export default async function Page({ params }) {
  const { locale, area: slug } = await params;
  const area = industrialArea(slug);
  if (!area) notFound();
  const [seo, list] = await Promise.all([getSeo(locale, ['industrial-areas', slug]), productList()]);
  const machines = machinesFor(list.value?.products).map(cardFields);
  return (
    <SitePage seo={seo}>
      <AreaPage area={area} machines={machines} />
    </SitePage>
  );
}
