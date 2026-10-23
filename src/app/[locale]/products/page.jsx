// Machine categories overview
import ProductCategoryPage from '../../../components/pages/ProductCategoryPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['products']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['products'])}>
      <ProductCategoryPage />
    </SitePage>
  );
}
