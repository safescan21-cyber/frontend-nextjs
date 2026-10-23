// /project-cost-calculator (inputs kept in the address: ?forms=…)
import ProjectCostCalculator from '../../../components/pages/costCalculator/ProjectCostCalculator';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['project-cost-calculator']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['project-cost-calculator'])}>
      <ProjectCostCalculator />
    </SitePage>
  );
}
