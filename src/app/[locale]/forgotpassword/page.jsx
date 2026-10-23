// /forgotpassword: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { ForgotPasswordPage } from '../../../shell/BrowserPages';
import RoutePage from '../../../shell/RoutePage';

export const metadata = {
  title: { absolute: 'Forgot password | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <RoutePage path="/forgotpassword">
      <ForgotPasswordPage />
    </RoutePage>
  );
}
