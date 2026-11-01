// /export/<country>: machinery exported from India to one country (components/seo/countries.js)
import { notFound } from 'next/navigation';
import CountryPage from '../../../../components/pages/CountryPage';
import { exportCountry } from '../../../../components/seo/countries';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';

export const generateMetadata = seoMetadata((p) => ['export', p.country]);

export default async function Page({ params }) {
  const { locale, country: slug } = await params;
  const country = exportCountry(slug);
  if (!country) notFound();
  return (
    <SitePage seo={await getSeo(locale, ['export', slug])}>
      <CountryPage country={country} />
    </SitePage>
  );
}
