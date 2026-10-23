// All machines
import ShopePage from '../../../components/pages/ShopePage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { productList } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['shop']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, products] = await Promise.all([getSeo(locale, ['shop']), productList()]);
  return (
    <SitePage seo={seo} path="/shop" data={[products]}>
      <ShopePage />
    </SitePage>
  );
}
