// /checkout: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { CheckoutPage } from '../../../shell/BrowserPages';
import RoutePage from '../../../shell/RoutePage';

export const metadata = {
  title: { absolute: 'Checkout | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <RoutePage path="/checkout">
      <CheckoutPage />
    </RoutePage>
  );
}
