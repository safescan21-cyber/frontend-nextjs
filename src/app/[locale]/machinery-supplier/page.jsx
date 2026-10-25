// /machinery-supplier: every Indian state and union territory (components/seo/indiaStates.js)
import StateIndex from '../../../components/pages/StateIndex';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['machinery-supplier']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['machinery-supplier'])}>
      <StateIndex />
    </SitePage>
  );
}
