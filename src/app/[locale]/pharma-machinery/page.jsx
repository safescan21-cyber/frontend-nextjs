// /pharma-machinery: main page for "pharma machinery" searches (components/seo/pharmaMachinery.js)
import PharmaMachineryPage from '../../../components/pages/PharmaMachineryPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { productList } from '../../serverData';
import { realMachines } from '../../../components/seo/pharmaMachinery';

export const generateMetadata = seoMetadata(() => ['pharma-machinery']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, list] = await Promise.all([getSeo(locale, ['pharma-machinery']), productList()]);
  return (
    <SitePage seo={seo}>
      <PharmaMachineryPage products={realMachines(list.value?.products).map(({ _id, name, category, price, images }) => ({ _id, name, category, price, images: (images || []).slice(0, 1) }))} />
    </SitePage>
  );
}
