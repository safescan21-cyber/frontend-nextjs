// /cart: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { CartPage } from '../../../shell/BrowserPages';

export const metadata = {
  title: { absolute: 'Your cart | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <CartPage />;
}
