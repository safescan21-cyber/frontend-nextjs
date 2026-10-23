// Every /dashboard page: private (noindex), with the side menu and login checks of
// shell/DashboardFrame.jsx. The frame stays mounted while moving between pages.
import DashboardFrame from '../../../shell/DashboardFrame';

export const metadata = {
  title: { absolute: 'Dashboard | Food Pharma Machinery' },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
