// /cart: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { CartPage } from '../../../shell/BrowserPages';
import RoutePage from '../../../shell/RoutePage';

export const metadata = {
  title: { absolute: 'Your cart | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <RoutePage path="/cart">
      <CartPage />
    </RoutePage>
  );
}
