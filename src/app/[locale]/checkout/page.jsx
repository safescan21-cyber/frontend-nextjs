// /checkout: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { CheckoutPage } from '../../../shell/BrowserPages';

export const metadata = {
  title: { absolute: 'Checkout | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <CheckoutPage />;
}
