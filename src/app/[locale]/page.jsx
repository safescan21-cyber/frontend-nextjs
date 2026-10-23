// Home page
import Home from '../../components/Home';
import SitePage from '../SitePage';
import { getSeo, seoMetadata } from '../pageMeta';
import { heroSlides, productList } from '../serverData';

export const generateMetadata = seoMetadata(() => []);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, ...data] = await Promise.all([getSeo(locale, []), heroSlides(), productList()]);
  return (
    <SitePage seo={seo} path="/" data={data}>
      <Home />
    </SitePage>
  );
}
