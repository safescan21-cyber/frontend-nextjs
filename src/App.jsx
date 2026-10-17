import './App.css';
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileActionButtons from './components/MobileActionButtons';
const Register = lazy(() => import('./components/Register'));
import Home from './components/Home';
const CategoryPage = lazy(() => import('./components/pages/CategoryPage'));
const Searchpage = lazy(() => import('./components/pages/Searchpage'));
import ShopePage from './components/pages/ShopePage';
import Contact from './components/pages/Contact';
const Login = lazy(() => import('../src/components/pages/Login'));
const CartPage = lazy(() => import('./components/cart/CartPage'));
const TrackOrder = lazy(() => import('./components/pages/TrackOrder'));
const CheckoutPage = lazy(() => import('./components/cart/CheckoutPage'));
import SingleProduct from './components/shop/ProductDetails/SingleProduct';
const ForgotPassword = lazy(() => import('./components/password/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/password/ResetPassword'));
import PrivateRoute from './components/pages/PrivateRoute';

const UserDMain = lazy(() => import('./components/pages/dashboard/user/dashboard/UserDMain'));
const UserOrders = lazy(() => import('./components/pages/dashboard/user/UserOrders'));
const OrderDetails = lazy(() => import('./components/pages/dashboard/user/OrderDetails'));
const UserPayments = lazy(() => import('./components/pages/dashboard/user/UserPayments'));
const UserReviews = lazy(() => import('./components/pages/dashboard/user/UserReviews'));
const UserProfile = lazy(() => import('./components/pages/dashboard/user/UserProfile'));

const AdminDMain = lazy(() => import('./components/pages/dashboard/admin/dashboard/AdminDMain'));
const AddProduct = lazy(() => import('./components/pages/dashboard/admin/addProduct/AddProduct'));
const ManageProduct = lazy(() => import('./components/pages/dashboard/admin/manageProduct/ManageProduct'));
const UpdateProduct = lazy(() => import('./components/pages/dashboard/admin/manageProduct/UpdateProduct'));
const ManageUser = lazy(() => import('./components/pages/dashboard/admin/users/ManageUser'));
const ManageOrders = lazy(() => import('./components/pages/dashboard/admin/manageOrders/ManageOrders'));
const Projects = lazy(() => import("../src/components/pages/Projects"));
const AddJob = lazy(() => import('./components/pages/dashboard/admin/jobs/AddJob'));
const ManageJobs = lazy(() => import('./components/pages/dashboard/admin/jobs/ManageJobs'));
const CareerPage = lazy(() => import('./components/pages/dashboard/admin/jobs/CareerPage'));
import CookieConsent from './components/pages/CookieConsent';
import ProductCategoryPage from "./components/pages/ProductCategoryPage";

const VisitorAnalytics = lazy(() => import('./components/pages/dashboard/admin/VisitorAnalytics'));
const CustomerInsights = lazy(() => import('./components/pages/dashboard/admin/insights/CustomerInsights'));
const MarketTrends = lazy(() => import('./components/pages/dashboard/admin/MarketTrends'));
const ManageOffers = lazy(() => import('./components/pages/dashboard/admin/offers/ManageOffers'));
const ManageReviews = lazy(() => import('./components/pages/dashboard/admin/reviews/ManageReviews'));
const AdminHeroSlides = lazy(() => import('../src/components/pages/dashboard/admin/AdminHeroSlides'));
const PressManagement = lazy(() => import('../src/components/pages/PressManagement'));
const PublicPressList = lazy(() => import('../src/components/pages/PublicPressList'));
const PublicPressDetail = lazy(() => import('../src/components/pages/PublicPressDetail'));
import About from './components/pages/About';
import LiveChat from './components/pages/LiveChat'

import ProductsPage from './components/pages/ProductCategoryPage';
import RouteSeo from './components/seo/RouteSeo';
import NotFound from './components/seo/NotFound';
const PrivacyPolicy = lazy(() => import('./components/seo/PrivacyPolicy'));
const BulkQuote = lazy(() => import('./components/pages/BulkQuote'));
const ManageBulkQuotes = lazy(() => import('./components/pages/dashboard/admin/quotes/ManageBulkQuotes'));
import { SolutionsHub, SolutionPage, ResourcePage } from './components/seo/SolutionPages';

const Wishlist = () => (
  <div className="p-8 text-slate-200">
    <h2 className="text-2xl font-bold">Your Wishlist</h2>
    <p className="mt-4 text-slate-400">You haven't added any items yet.</p>
  </div>
);

// Global toast look: dark theme to match the site, readable on mobile
const toastOptions = {
  duration: 3500,
  style: {
    background: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '12px',
    fontSize: '14px',
    maxWidth: '90vw',
  },
  success: {
    duration: 3000,
    iconTheme: { primary: '#fbbf24', secondary: '#1e293b' },
  },
  error: {
    duration: 5000,
    iconTheme: { primary: '#f87171', secondary: '#1e293b' },
  },
};

// Shown while a page's code is downloading
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center pt-24" role="status" aria-label="Loading">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
  </div>
);

function App() {
  return (
    <div className="app-shell flex flex-col min-h-screen">
      <Toaster position="top-right" reverseOrder={false} gutter={8} toastOptions={toastOptions} />
      <Navbar />
      <RouteSeo />

      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public top‑level routes ── */}
          <Route path="/" element={<Home />} />
         <Route path="/press" element={<PublicPressList />} />
          <Route path="/press/:id" element={<PublicPressDetail />} />
          <Route path="/about" element={<About />} />

          <Route path="/register" element={<Register />} />
          <Route path="/categories/:categoriesName" element={<CategoryPage />} />
          <Route path="/search" element={<Searchpage />} />
          <Route path="/shop" element={<ShopePage />} />
          <Route path="/shop/:id" element={<SingleProduct />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/career" element={<CareerPage />} />
          

          {/* ✅ Products overview + category page (before wildcards) */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:category" element={<ProductCategoryPage />} />

          {/* Solutions & resources */}
          <Route path="/solutions" element={<SolutionsHub />} />
          <Route path="/solutions/:slug" element={<SolutionPage />} />
          <Route path="/resources/:slug" element={<ResourcePage />} />

          {/* ── Dashboard (protected) ── */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route index element={<UserDMain />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="reviews" element={<UserReviews />} />

            {/* Admin routes */}
            <Route element={<PrivateRoute role="admin" />}>
              <Route path="admin" element={<AdminDMain />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="manage-products" element={<ManageProduct />} />
              <Route path="update-product/:id" element={<UpdateProduct />} />
              <Route path="users" element={<ManageUser />} />
              <Route path="manage-orders" element={<ManageOrders />} />
              <Route path="add-job" element={<AddJob />} />
              <Route path="manage-jobs" element={<ManageJobs />} />
              <Route path="visitors" element={<VisitorAnalytics />} />
              <Route path="insights" element={<CustomerInsights />} />
              <Route path="market-trends" element={<MarketTrends />} />
              <Route path="offers" element={<ManageOffers />} />
              <Route path="manage-reviews" element={<ManageReviews />} />
              <Route path="bulk-quotes" element={<ManageBulkQuotes />} />
              <Route path="/dashboard/hero-slides" element={<AdminHeroSlides />} />
              <Route path="press" element={<PressManagement />} />
            </Route>
          </Route>

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/bulk-quote" element={<BulkQuote />} />

          {/* Anything else */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <MobileActionButtons />
      <Footer />
      <CookieConsent />
      <LiveChat />
    </div>
  );
}

export default App;