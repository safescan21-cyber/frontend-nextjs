// /pharma-machinery-supplier/<city>: one pharma hub (components/seo/cityHubs.js)
import { notFound } from 'next/navigation';
import CityPage from '../../../../components/pages/CityPage';
import { cityHub } from '../../../../components/seo/cityHubs';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['pharma-machinery-supplier', p.city]);

export default async function Page({ params }) {
  const { locale, city } = await params;
  const hub = cityHub(city);
  if (!hub) notFound();
  const [seo, clients] = await Promise.all([getSeo(locale, ['pharma-machinery-supplier', city]), getJson('/api/showcase?kind=client', 300)]);
  const installations = (clients?.items || []).filter((c) => String(c.state || '').toLowerCase() === hub.state.toLowerCase()).slice(0, 20);
  return (
    <SitePage seo={seo}>
      <CityPage hub={hub} installations={installations} />
    </SitePage>
  );
}
