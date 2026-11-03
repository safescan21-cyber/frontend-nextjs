// /machinery-supplier/<state>: one Indian state or union territory (components/seo/indiaStates.js)
import { notFound } from 'next/navigation';
import StatePage from '../../../../components/pages/StatePage';
import { cardFields } from '../../../../components/pages/productCategoryData';
import { indiaState } from '../../../../components/seo/indiaStates';
import { MACHINERY_HUBS, realMachines } from '../../../../components/seo/machineryHubs';
import SitePage from '../../../SitePage';
import { getSeo, seoMetadata } from '../../../pageMeta';
import { getJson, productList } from '../../../serverData';

export const generateMetadata = seoMetadata((p) => ['machinery-supplier', p.state]);

export default async function Page({ params }) {
  const { locale, state: slug } = await params;
  const state = indiaState(slug);
  if (!state) notFound();
  const [seo, clients, list] = await Promise.all([getSeo(locale, ['machinery-supplier', slug]), getJson('/api/showcase?kind=client', 300), productList()]);
  const installations = (clients?.items || []).filter((c) => String(c.state || '').toLowerCase() === state.name.toLowerCase()).slice(0, 20);
  // Every shop machine where there is pharma manufacturing; elsewhere the ones for food plants
  const food = MACHINERY_HUBS.food;
  const machines = (state.pharma ? realMachines(list.value?.products) : realMachines(list.value?.products, food.categories, food.notFor)).map(cardFields);
  return (
    <SitePage seo={seo}>
      <StatePage state={state} installations={installations} machines={machines} />
    </SitePage>
  );
}
