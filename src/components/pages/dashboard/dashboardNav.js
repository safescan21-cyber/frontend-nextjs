// Dashboard pages, in menu order: admin and customer. Used by the side menu
// (DashboardShell.jsx) and the profile dropdown in the header (Navbar.jsx).
import {
  LayoutDashboard, Package, Truck, PlusCircle, FileText, Users, TrendingUp, BarChart3,
  FlaskConical, MessageSquare, CreditCard, Image, Newspaper, Star, ClipboardList, User, ShoppingBag, Wrench, ShieldCheck,
} from 'lucide-react';

export const ADMIN_NAV = [
  { group: 'Overview', items: [
    { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'User Analytics', path: '/dashboard/visitors', icon: TrendingUp },
    { label: 'Customer Insights', path: '/dashboard/insights', icon: BarChart3 },
    { label: 'Market Trends', path: '/dashboard/market-trends', icon: TrendingUp },
  ] },
  { group: 'Catalogue', items: [
    { label: 'Manage Items', path: '/dashboard/manage-products', icon: Package },
    { label: 'Add Product', path: '/dashboard/add-product', icon: PlusCircle },
    { label: 'Pharma APIs', path: '/dashboard/pharma-apis', icon: FlaskConical },
  ] },
  { group: 'Sales', items: [
    { label: 'All Orders', path: '/dashboard/manage-orders', icon: Truck },
    { label: 'Bulk Quotes', path: '/dashboard/bulk-quotes', icon: ClipboardList },
    { label: 'Service Requests', path: '/dashboard/service-requests', icon: Wrench },
    { label: 'AMC Plans', path: '/dashboard/amc-plans', icon: ShieldCheck },
    { label: 'Discount Offers', path: '/dashboard/offers', icon: CreditCard },
    { label: 'Users', path: '/dashboard/users', icon: Users },
  ] },
  { group: 'Content', items: [
    { label: 'Hero Slides', path: '/dashboard/hero-slides', icon: Image },
    { label: 'Testimonials', path: '/dashboard/testimonials', icon: Star },
    { label: 'Reviews & Comments', path: '/dashboard/manage-reviews', icon: MessageSquare },
    { label: 'Press Releases', path: '/dashboard/press', icon: Newspaper },
    { label: 'Manage Jobs', path: '/dashboard/manage-jobs', icon: FileText },
    { label: 'Post Job', path: '/dashboard/add-job', icon: PlusCircle },
  ] },
];

export const ADMIN_LINKS = ADMIN_NAV.flatMap((g) => g.items);

// Customer dashboard
export const USER_NAV = [
  { group: 'My account', items: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    { label: 'Service requests', path: '/dashboard/service', icon: Wrench },
    { label: 'Reviews', path: '/dashboard/reviews', icon: MessageSquare },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ] },
];

export const USER_LINKS = USER_NAV.flatMap((g) => g.items);
