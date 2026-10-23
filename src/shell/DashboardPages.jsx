'use client';
// Dashboard pages (customer and admin), drawn in the browser only: they are private,
// need the saved login, and are never shown to Google. Each has a route under
// app/[locale]/dashboard; the side menu and login checks are in its layout.jsx.
import dynamic from 'next/dynamic';
import PageLoader from './PageLoader';

const browserOnly = (load) => dynamic(load, { ssr: false, loading: PageLoader });

export const UserDMain = browserOnly(() => import('../components/pages/dashboard/user/dashboard/UserDMain'));
export const UserOrders = browserOnly(() => import('../components/pages/dashboard/user/UserOrders'));
export const OrderDetails = browserOnly(() => import('../components/pages/dashboard/user/OrderDetails'));
export const UserPayments = browserOnly(() => import('../components/pages/dashboard/user/UserPayments'));
export const UserProfile = browserOnly(() => import('../components/pages/dashboard/user/UserProfile'));
export const UserReviews = browserOnly(() => import('../components/pages/dashboard/user/UserReviews'));
export const AdminDMain = browserOnly(() => import('../components/pages/dashboard/admin/dashboard/AdminDMain'));
export const AddProduct = browserOnly(() => import('../components/pages/dashboard/admin/addProduct/AddProduct'));
export const ManageProduct = browserOnly(() => import('../components/pages/dashboard/admin/manageProduct/ManageProduct'));
export const UpdateProduct = browserOnly(() => import('../components/pages/dashboard/admin/manageProduct/UpdateProduct'));
export const ManageUser = browserOnly(() => import('../components/pages/dashboard/admin/users/ManageUser'));
export const ManageOrders = browserOnly(() => import('../components/pages/dashboard/admin/manageOrders/ManageOrders'));
export const AddJob = browserOnly(() => import('../components/pages/dashboard/admin/jobs/AddJob'));
export const ManageJobs = browserOnly(() => import('../components/pages/dashboard/admin/jobs/ManageJobs'));
export const VisitorAnalytics = browserOnly(() => import('../components/pages/dashboard/admin/VisitorAnalytics'));
export const CustomerInsights = browserOnly(() => import('../components/pages/dashboard/admin/insights/CustomerInsights'));
export const MarketTrends = browserOnly(() => import('../components/pages/dashboard/admin/MarketTrends'));
export const ManagePharmaApis = browserOnly(() => import('../components/pages/dashboard/admin/pharmaApi/ManagePharmaApis'));
export const PharmaApiForm = browserOnly(() => import('../components/pages/dashboard/admin/pharmaApi/PharmaApiForm'));
export const ManageTestimonials = browserOnly(() => import('../components/pages/dashboard/admin/testimonials/ManageTestimonials'));
export const ManageOffers = browserOnly(() => import('../components/pages/dashboard/admin/offers/ManageOffers'));
export const ManageReviews = browserOnly(() => import('../components/pages/dashboard/admin/reviews/ManageReviews'));
export const ManageBulkQuotes = browserOnly(() => import('../components/pages/dashboard/admin/quotes/ManageBulkQuotes'));
export const AdminHeroSlides = browserOnly(() => import('../components/pages/dashboard/admin/AdminHeroSlides'));
export const UserServiceRequests = browserOnly(() => import('../components/pages/dashboard/user/UserServiceRequests'));
export const ManageServiceRequests = browserOnly(() => import('../components/pages/dashboard/admin/service/ManageServiceRequests'));
export const ManageAmcPlans = browserOnly(() => import('../components/pages/dashboard/admin/service/ManageAmcPlans'));
export const PressManagement = browserOnly(() => import('../components/pages/PressManagement'));
