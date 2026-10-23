// /register: account / cart page, drawn in the browser (shell/BrowserPages.jsx)
import { RegisterPage } from '../../../shell/BrowserPages';
import RoutePage from '../../../shell/RoutePage';

export const metadata = {
  title: { absolute: 'Create an account | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <RoutePage path="/register">
      <RegisterPage />
    </RoutePage>
  );
}
