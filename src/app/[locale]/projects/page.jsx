// /projects: Projects
import Projects from '../../../components/pages/Projects';
import SitePage from '../../../app/SitePage';
import { getSeo, seoMetadata } from '../../../app/pageMeta';

export const generateMetadata = seoMetadata(() => ['projects']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['projects'])} path="/projects">
      <Projects />
    </SitePage>
  );
}
