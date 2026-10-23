// /dashboard/orders
import { UserOrders } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/orders">
      <UserOrders />
    </RoutePage>
  );
}
