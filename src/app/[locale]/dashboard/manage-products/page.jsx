// /dashboard/manage-products
import { ManageProduct } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/manage-products">
      <ManageProduct />
    </RoutePage>
  );
}
