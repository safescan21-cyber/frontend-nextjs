// /bulk-quote: Bulk quote request
import BulkQuote from '../../../components/pages/BulkQuote';
import SitePage from '../../../app/SitePage';
import { getSeo, seoMetadata } from '../../../app/pageMeta';

export const generateMetadata = seoMetadata(() => ['bulk-quote']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['bulk-quote'])} path="/bulk-quote">
      <BulkQuote />
    </SitePage>
  );
}
