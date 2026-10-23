// /service-request: report a breakdown or book a service visit
import ServiceRequestPage from '../../../components/pages/ServiceRequestPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['service-request']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['service-request'])}>
      <ServiceRequestPage />
    </SitePage>
  );
}
