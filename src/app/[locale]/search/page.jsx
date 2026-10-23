// Site search (machines and pharma APIs). Results depend on what the visitor typed,
// so the page is kept out of Google.
import Searchpage from '../../../components/pages/Searchpage';
import SitePage from '../../SitePage';
import { getSeo } from '../../pageMeta';
import { productList } from '../../serverData';

export const metadata = {
  title: { absolute: 'Search machines and pharma APIs | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, products] = await Promise.all([getSeo(locale, ['search']), productList()]);
  return (
    <SitePage seo={seo} data={[products]}>
      <Searchpage />
    </SitePage>
  );
}
