// /dashboard/insights
import { CustomerInsights } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/insights">
      <CustomerInsights />
    </RoutePage>
  );
}
