// /dashboard/update-product/:id
import { UpdateProduct } from '../../../../../shell/DashboardPages';
import RoutePage from '../../../../../shell/RoutePage';

export default function Page() {
  return (
    <RoutePage path="/dashboard/update-product/:id">
      <UpdateProduct />
    </RoutePage>
  );
}
