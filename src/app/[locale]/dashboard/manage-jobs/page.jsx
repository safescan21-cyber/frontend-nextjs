// /dashboard/manage-jobs
import { ManageJobs } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/manage-jobs">
      <ManageJobs />
    </RoutePage>
  );
}
