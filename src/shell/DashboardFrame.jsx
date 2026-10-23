'use client';
// Around every /dashboard page: logged-in users only, admin pages for admins only,
// and the customer or admin side menu (DashboardShell.jsx).
import { useLocation } from 'react-router-dom';
import PrivateRoute from '../components/pages/PrivateRoute';
import DashboardShell from '../components/pages/dashboard/DashboardShell';

// /dashboard, /dashboard/orders… are the customer's pages; everything else is admin
const CUSTOMER_PAGES = new Set(['', 'orders', 'payments', 'profile', 'reviews']);

export default function DashboardFrame({ children }) {
  const { pathname } = useLocation(); // without the country folder
  const section = pathname.split('/')[2] || '';
  const kind = CUSTOMER_PAGES.has(section) ? 'user' : 'admin';
  return (
    <PrivateRoute role={kind === 'admin' ? 'admin' : undefined}>
      <DashboardShell kind={kind}>{children}</DashboardShell>
    </PrivateRoute>
  );
}
