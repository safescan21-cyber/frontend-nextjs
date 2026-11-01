// /export: every country with its own export page (components/seo/countries.js)
import CountryIndex from '../../../components/pages/CountryIndex';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['export']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['export'])}>
      <CountryIndex />
    </SitePage>
  );
}
