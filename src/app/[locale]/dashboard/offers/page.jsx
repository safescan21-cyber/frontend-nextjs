// /dashboard/offers
import { ManageOffers } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/offers">
      <ManageOffers />
    </RoutePage>
  );
}
