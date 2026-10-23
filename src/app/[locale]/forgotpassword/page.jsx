// /forgotpassword: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { ForgotPasswordPage } from '../../../shell/BrowserPages';

export const metadata = {
  title: { absolute: 'Forgot password | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ForgotPasswordPage />;
}
