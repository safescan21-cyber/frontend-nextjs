// /amc: annual maintenance contract plans (written in admin) and booking
import AmcPage from '../../../components/pages/AmcPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { getJson } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['amc']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, res] = await Promise.all([getSeo(locale, ['amc']), getJson('/api/service/amc-plans')]);
  return (
    <SitePage seo={seo}>
      <AmcPage plans={Array.isArray(res?.plans) ? res.plans : []} />
    </SitePage>
  );
}
