// /spares: spare parts by machine model (?model=, ?q=)
import SparesPage from '../../../components/pages/SparesPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { productList } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['spares']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, products] = await Promise.all([getSeo(locale, ['spares']), productList()]);
  return (
    <SitePage seo={seo} data={[products]}>
      <SparesPage />
    </SitePage>
  );
}
