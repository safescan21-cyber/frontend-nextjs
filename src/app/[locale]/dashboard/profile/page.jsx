// /dashboard/profile
import { UserProfile } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/profile">
      <UserProfile />
    </RoutePage>
  );
}
