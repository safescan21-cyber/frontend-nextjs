// /pharma-machinery-supplier: the pharma hubs we have pages for
import { CITY_HUBS } from '../../../components/seo/cityHubs';
import HubIndex from '../../../components/pages/HubIndex';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['pharma-machinery-supplier']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['pharma-machinery-supplier'])}>
      <HubIndex hubs={CITY_HUBS} />
    </SitePage>
  );
}
