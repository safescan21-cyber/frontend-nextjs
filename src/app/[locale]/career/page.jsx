// /career: open jobs
import CareerPage from '../../../components/pages/dashboard/admin/jobs/CareerPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { jobList } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['career']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, jobs] = await Promise.all([getSeo(locale, ['career']), jobList()]);
  return (
    <SitePage seo={seo} data={[jobs]}>
      <CareerPage />
    </SitePage>
  );
}
