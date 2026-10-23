// /dashboard/bulk-quotes
import { ManageBulkQuotes } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/bulk-quotes">
      <ManageBulkQuotes />
    </RoutePage>
  );
}
