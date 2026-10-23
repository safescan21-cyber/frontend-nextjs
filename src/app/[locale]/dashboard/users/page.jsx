// /dashboard/users
import { ManageUser } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/users">
      <ManageUser />
    </RoutePage>
  );
}
