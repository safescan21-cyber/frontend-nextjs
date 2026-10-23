// /dashboard/manage-orders
import { ManageOrders } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/manage-orders">
      <ManageOrders />
    </RoutePage>
  );
}
