// /categories/<name>: pages from the old site template, kept so old links still open
// (noindex, see seo/pageSeo.js)
import CategoryPage from '../../../../components/pages/CategoryPage';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['categories', p.name]);

export default async function Page({ params }) {
  const { locale, name } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['categories', name])} path="/categories/:categoriesName">
      <CategoryPage />
    </SitePage>
  );
}
