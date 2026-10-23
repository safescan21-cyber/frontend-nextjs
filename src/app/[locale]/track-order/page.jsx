// /track-order: Track your order
import TrackOrder from '../../../components/pages/TrackOrder';
import SitePage from '../../../app/SitePage';
import { getSeo, seoMetadata } from '../../../app/pageMeta';

export const generateMetadata = seoMetadata(() => ['track-order']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['track-order'])}>
      <TrackOrder />
    </SitePage>
  );
}
