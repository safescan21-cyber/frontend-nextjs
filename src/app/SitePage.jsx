// The body of a public Next.js page: structured data, the data the server fetched
// (put into the store before rendering) and the page component.
//   <SitePage seo={seo} data={entries}><SingleProduct /></SitePage>
import Seed from '../shell/Seed';
import { PageJsonLd } from './pageMeta';

export default function SitePage({ seo, data = [], children }) {
  return (
    <>
      <PageJsonLd seo={seo} />
      <Seed entries={data}>
        {children}
      </Seed>
    </>
  );
}
