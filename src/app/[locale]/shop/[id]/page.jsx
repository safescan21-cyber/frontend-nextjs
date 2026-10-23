// One machine
import { notFound } from 'next/navigation';
import SingleProduct from '../../../../components/shop/ProductDetails/SingleProduct';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { productDetail } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['shop', p.id]);

export default async function Page({ params }) {
  const { locale, id } = await params;
  const seo = await getSeo(locale, ['shop', id]);
  if (seo.notFound) notFound(); // not a product id, or no such product
  return (
    <SitePage seo={seo} data={await productDetail(id)}>
      <SingleProduct />
    </SitePage>
  );
}
