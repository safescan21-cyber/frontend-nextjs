// /pharma-plant-checklist: free checklist PDF for an email address
import ChecklistPage from '../../../components/pages/ChecklistPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['pharma-plant-checklist']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['pharma-plant-checklist'])}>
      <ChecklistPage />
    </SitePage>
  );
}
