// /dashboard/pharma-apis/:id/edit
import { PharmaApiForm } from '../../../../../../shell/DashboardPages';
import RoutePage from '../../../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/pharma-apis/:id/edit">
      <PharmaApiForm />
    </RoutePage>
  );
}
