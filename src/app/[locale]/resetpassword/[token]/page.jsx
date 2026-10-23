// /resetpassword/:token: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { ResetPasswordPage } from '../../../../shell/BrowserPages';

export const metadata = {
  title: { absolute: 'Reset password | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ResetPasswordPage />;
}
