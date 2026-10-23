// /pharma-api: catalogue of active pharmaceutical ingredients (?q=, ?category=, ?page=)
import PharmaApiList from '../../../components/pages/pharmaApi/PharmaApiList';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';
import { getJson } from '../../serverData';

const PAGE_SIZE = 24; // as in PharmaApiList.jsx

export const generateMetadata = seoMetadata(() => ['pharma-api']);

export default async function Page({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  const one = (v) => (Array.isArray(v) ? v[0] : v) || '';
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);
  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (one(sp.q)) qs.set('q', one(sp.q));
  if (one(sp.category)) qs.set('category', one(sp.category));
  const [seo, data, categories] = await Promise.all([
    getSeo(locale, ['pharma-api']),
    getJson(`/api/pharma-apis?${qs}`),
    getJson('/api/pharma-apis/categories', 300),
  ]);
  const initial = Array.isArray(data?.items) ? { data, ...(Array.isArray(categories) && { categories }) } : undefined;
  return (
    <SitePage seo={seo} path="/pharma-api">
      <PharmaApiList initial={initial} />
    </SitePage>
  );
}
