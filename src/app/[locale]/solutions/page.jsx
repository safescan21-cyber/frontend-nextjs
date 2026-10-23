// Solutions overview
import { SolutionsHub } from '../../../components/seo/SolutionPages';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['solutions']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['solutions'])} path="/solutions">
      <SolutionsHub />
    </SitePage>
  );
}
