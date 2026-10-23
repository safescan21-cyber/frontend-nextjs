// /testimonials: approved customer testimonials and the form to send one
import TestimonialsPage from '../../../components/testimonials/TestimonialsPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { getJson } from '../../serverData';

export const generateMetadata = seoMetadata(() => ['testimonials']);

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, res] = await Promise.all([getSeo(locale, ['testimonials']), getJson('/api/testimonials?limit=100')]);
  return (
    <SitePage seo={seo} path="/testimonials">
      <TestimonialsPage initial={Array.isArray(res?.items) ? res.items : undefined} />
    </SitePage>
  );
}
