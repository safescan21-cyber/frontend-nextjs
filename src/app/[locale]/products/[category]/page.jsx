// One machine category (/products/tablet-press…)
import { notFound } from 'next/navigation';
import ProductCategoryPage from '../../../../components/pages/ProductCategoryPage';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['products', p.category]);

export default async function Page({ params }) {
  const { locale, category } = await params;
  const seo = await getSeo(locale, ['products', category]);
  if (seo.notFound) notFound();
  return (
    <SitePage seo={seo} path="/products/:category">
      <ProductCategoryPage />
    </SitePage>
  );
}
