// /dashboard/orders/:id
import { OrderDetails } from '../../../../../shell/DashboardPages';
import RoutePage from '../../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/orders/:id">
      <OrderDetails />
    </RoutePage>
  );
}
