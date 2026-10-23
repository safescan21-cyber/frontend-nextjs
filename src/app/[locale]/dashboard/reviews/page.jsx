// /dashboard/reviews
import { UserReviews } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/reviews">
      <UserReviews />
    </RoutePage>
  );
}
