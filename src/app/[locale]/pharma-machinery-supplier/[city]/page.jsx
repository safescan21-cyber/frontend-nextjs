// /pharma-machinery-supplier/<city>: one pharma hub (components/seo/cityHubs.js)
import { notFound } from 'next/navigation';
import CityPage from '../../../../components/pages/CityPage';
import { cardFields } from '../../../../components/pages/productCategoryData';
import { cityHub } from '../../../../components/seo/cityHubs';
import { machinesFor } from '../../../../components/seo/machineryHubs';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson, productList } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['pharma-machinery-supplier', p.city]);

export default async function Page({ params }) {
  const { locale, city } = await params;
  const hub = cityHub(city);
  if (!hub) notFound();
  const [seo, clients, list] = await Promise.all([getSeo(locale, ['pharma-machinery-supplier', city]), getJson('/api/showcase?kind=client', 300), productList()]);
  const installations = (clients?.items || []).filter((c) => String(c.state || '').toLowerCase() === hub.state.toLowerCase()).slice(0, 20);
  return (
    <SitePage seo={seo}>
      <CityPage hub={hub} installations={installations} machines={machinesFor(list.value?.products).map(cardFields)} />
    </SitePage>
  );
}
