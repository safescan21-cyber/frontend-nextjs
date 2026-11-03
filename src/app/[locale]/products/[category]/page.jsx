// One machine category (/products/tablet-press…), with its real machines from the shop
import { notFound } from 'next/navigation';
import ProductCategoryPage from '../../../../components/pages/ProductCategoryPage';
import { cardFields, categoryMachines } from '../../../../components/pages/productCategoryData';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { productList } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['products', p.category]);

export default async function Page({ params }) {
  const { locale, category } = await params;
  const [seo, list] = await Promise.all([getSeo(locale, ['products', category]), productList()]);
  if (seo.notFound) notFound();
  return (
    <SitePage seo={seo}>
      <ProductCategoryPage products={categoryMachines(list.value?.products, category).map(cardFields)} />
    </SitePage>
  );
}
