// /contact
import Contact from '../../../components/pages/Contact';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['contact']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['contact'])}>
      <Contact />
    </SitePage>
  );
}
