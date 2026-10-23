// /privacy: Privacy and cookie policy
import PrivacyPolicy from '../../../components/seo/PrivacyPolicy';
import SitePage from '../../../app/SitePage';
import { getSeo, seoMetadata } from '../../../app/pageMeta';

export const generateMetadata = seoMetadata(() => ['privacy']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['privacy'])}>
      <PrivacyPolicy />
    </SitePage>
  );
}
