// /dashboard/add-job
import { AddJob } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/add-job">
      <AddJob />
    </RoutePage>
  );
}
