// /pharma-machinery: main page for "pharma machinery" searches (components/seo/machineryHubs.js)
import MachineryHubPage from '../../../components/pages/MachineryHubPage';
import { MACHINERY_HUBS, realMachines } from '../../../components/seo/machineryHubs';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { productList } from '../../serverData';

const hub = MACHINERY_HUBS.pharma;
export const generateMetadata = seoMetadata(() => ['pharma-machinery']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, list] = await Promise.all([getSeo(locale, ['pharma-machinery']), productList()]);
  // Only what the cards show
  const products = realMachines(list.value?.products, hub.categories).map(({ _id, name, category, price, images }) => ({ _id, name, category, price, images: (images || []).slice(0, 1) }));
  return (
    <SitePage seo={seo}>
      <MachineryHubPage hub="pharma" products={products} />
    </SitePage>
  );
}
