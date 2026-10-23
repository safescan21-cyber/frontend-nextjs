// /dashboard/admin
import { AdminDMain } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/admin">
      <AdminDMain />
    </RoutePage>
  );
}
