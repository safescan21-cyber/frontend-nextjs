// /industrial-areas: pharma and food industrial areas in India (components/seo/industrialAreas.js)
import AreaIndex from '../../../components/pages/AreaIndex';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['industrial-areas']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['industrial-areas'])}>
      <AreaIndex />
    </SitePage>
  );
}
