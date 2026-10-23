// /dashboard/add-product
import { AddProduct } from '../../../../shell/DashboardPages';
import RoutePage from '../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/add-product">
      <AddProduct />
    </RoutePage>
  );
}
