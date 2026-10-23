// The body of a public Next.js page: structured data, the data the server fetched
// (put into the store before rendering) and the page component, wrapped so its
// React Router hooks see the route it belongs to.
//   <SitePage seo={seo} path="/shop/:id" data={entries}><SingleProduct /></SitePage>
import RoutePage from '../shell/RoutePage';
import Seed from '../shell/Seed';
import { PageJsonLd } from './pageMeta';

export default function SitePage({ seo, path, data = [], children }) {
  return (
    <>
      <PageJsonLd seo={seo} />
      <Seed entries={data}>
        <RoutePage path={path}>{children}</RoutePage>
      </Seed>
    </>
  );
}
