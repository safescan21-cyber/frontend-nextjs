// /factory: factory photos, client logos (with permission) and installations by state,
// all entered in admin. Kept out of Google until there is something to show.
import FactoryPage from '../../../components/pages/FactoryPage';
import SitePage from '../../SitePage';
import { getSeo, buildMetadata } from '../../pageMeta';
import { getJson } from '../../serverData';

const load = () => Promise.all([getJson('/api/showcase?kind=photo', 300), getJson('/api/showcase?kind=client', 300)])
  .then(([p, c]) => ({ photos: p?.items || [], clients: c?.items || [] }));

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const [seo, { photos, clients }] = await Promise.all([getSeo(locale, ['factory']), load()]);
  const meta = buildMetadata(seo);
  return photos.length || clients.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const [seo, data] = await Promise.all([getSeo(locale, ['factory']), load()]);
  return (
    <SitePage seo={seo}>
      <FactoryPage photos={data.photos} clients={data.clients} />
    </SitePage>
  );
}
