// /login: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { LoginPage } from '../../../shell/BrowserPages';
import RoutePage from '../../../shell/RoutePage';

export const metadata = {
  title: { absolute: 'Log in | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <RoutePage path="/login">
      <LoginPage />
    </RoutePage>
  );
}
