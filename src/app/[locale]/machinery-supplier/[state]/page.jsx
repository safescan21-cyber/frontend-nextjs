// /machinery-supplier/<state>: one Indian state or union territory (components/seo/indiaStates.js)
import { notFound } from 'next/navigation';
import StatePage from '../../../../components/pages/StatePage';
import { indiaState } from '../../../../components/seo/indiaStates';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['machinery-supplier', p.state]);

export default async function Page({ params }) {
  const { locale, state: slug } = await params;
  const state = indiaState(slug);
  if (!state) notFound();
  const [seo, clients] = await Promise.all([getSeo(locale, ['machinery-supplier', slug]), getJson('/api/showcase?kind=client', 300)]);
  const installations = (clients?.items || []).filter((c) => String(c.state || '').toLowerCase() === state.name.toLowerCase()).slice(0, 20);
  return (
    <SitePage seo={seo}>
      <StatePage state={state} installations={installations} />
    </SitePage>
  );
}
