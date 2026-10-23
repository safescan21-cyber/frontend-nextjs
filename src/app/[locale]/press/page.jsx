// Press releases (news / blog)
import PublicPressList from '../../../components/pages/PublicPressList';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { getJson } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['press']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, initial] = await Promise.all([getSeo(locale, ['press']), getJson('/api/press?active=true&page=1&limit=10')]);
  return (
    <SitePage seo={seo} path="/press">
      <PublicPressList initial={initial} />
    </SitePage>
  );
}
