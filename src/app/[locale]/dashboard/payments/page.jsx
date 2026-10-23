// /dashboard/payments
import { UserPayments } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/payments">
      <UserPayments />
    </RoutePage>
  );
}
