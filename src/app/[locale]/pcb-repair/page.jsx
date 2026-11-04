// /pcb-repair: send photos of a faulty PCB for repair
import PcbRepairPage from '../../../components/pages/PcbRepairPage';
import SitePage from '../../SitePage';
import { getSeo, seoMetadata } from '../../pageMeta';

export const generateMetadata = seoMetadata(() => ['pcb-repair']);

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <SitePage seo={await getSeo(locale, ['pcb-repair'])}>
      <PcbRepairPage />
    </SitePage>
  );
}
