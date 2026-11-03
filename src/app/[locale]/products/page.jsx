// Machine categories overview, with the real machines in the shop
import ProductCategoryPage from '../../../components/pages/ProductCategoryPage';
import { cardFields } from '../../../components/pages/productCategoryData';
import { realMachines } from '../../../components/seo/machineryHubs';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { productList } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['products']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, list] = await Promise.all([getSeo(locale, ['products']), productList()]);
  return (
    <SitePage seo={seo}>
      <ProductCategoryPage products={realMachines(list.value?.products).map(cardFields)} />
    </SitePage>
  );
}
