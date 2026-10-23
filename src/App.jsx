import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const Register = lazy(() => import('./components/Register'));
const CategoryPage = lazy(() => import('./components/pages/CategoryPage'));
const Login = lazy(() => import('../src/components/pages/Login'));
const CartPage = lazy(() => import('./components/cart/CartPage'));
const TrackOrder = lazy(() => import('./components/pages/TrackOrder'));
const CheckoutPage = lazy(() => import('./components/cart/CheckoutPage'));
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
import DashboardShell from './components/pages/dashboard/DashboardShell';
const AddProduct = lazy(() => import('./components/pages/dashboard/admin/addProduct/AddProduct'));
const ManageProduct = lazy(() => import('./components/pages/dashboard/admin/manageProduct/ManageProduct'));
const UpdateProduct = lazy(() => import('./components/pages/dashboard/admin/manageProduct/UpdateProduct'));
const ManageUser = lazy(() => import('./components/pages/dashboard/admin/users/ManageUser'));
const ManageOrders = lazy(() => import('./components/pages/dashboard/admin/manageOrders/ManageOrders'));
const Projects = lazy(() => import("../src/components/pages/Projects"));
const AddJob = lazy(() => import('./components/pages/dashboard/admin/jobs/AddJob'));
const ManageJobs = lazy(() => import('./components/pages/dashboard/admin/jobs/ManageJobs'));
const CareerPage = lazy(() => import('./components/pages/dashboard/admin/jobs/CareerPage'));

const VisitorAnalytics = lazy(() => import('./components/pages/dashboard/admin/VisitorAnalytics'));
const CustomerInsights = lazy(() => import('./components/pages/dashboard/admin/insights/CustomerInsights'));
const MarketTrends = lazy(() => import('./components/pages/dashboard/admin/MarketTrends'));
const ManageOffers = lazy(() => import('./components/pages/dashboard/admin/offers/ManageOffers'));
const ManageReviews = lazy(() => import('./components/pages/dashboard/admin/reviews/ManageReviews'));
const AdminHeroSlides = lazy(() => import('../src/components/pages/dashboard/admin/AdminHeroSlides'));
const PressManagement = lazy(() => import('../src/components/pages/PressManagement'));

import NotFound from './components/seo/NotFound';
const PrivacyPolicy = lazy(() => import('./components/seo/PrivacyPolicy'));
const BulkQuote = lazy(() => import('./components/pages/BulkQuote'));
const ProjectCostCalculator = lazy(() => import('./components/pages/costCalculator/ProjectCostCalculator'));
const PharmaApiList = lazy(() => import('./components/pages/pharmaApi/PharmaApiList'));
const PharmaApiDetail = lazy(() => import('./components/pages/pharmaApi/PharmaApiDetail'));
const ManagePharmaApis = lazy(() => import('./components/pages/dashboard/admin/pharmaApi/ManagePharmaApis'));
const PharmaApiForm = lazy(() => import('./components/pages/dashboard/admin/pharmaApi/PharmaApiForm'));
const TestimonialsPage = lazy(() => import('./components/testimonials/TestimonialsPage'));
const ManageTestimonials = lazy(() => import('./components/pages/dashboard/admin/testimonials/ManageTestimonials'));
const ManageBulkQuotes = lazy(() => import('./components/pages/dashboard/admin/quotes/ManageBulkQuotes'));
import { ResourcePage } from './components/seo/SolutionPages';

const Wishlist = () => (
  <div className="p-8 text-slate-200">
    <h2 className="text-2xl font-bold">Your Wishlist</h2>
    <p className="mt-4 text-slate-400">You haven't added any items yet.</p>
  </div>
);

// Shown while a page's code is downloading
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center pt-24" role="status" aria-label="Loading">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
  </div>
);

// Pages that are not Next.js pages yet. The site header, footer and providers come
// from shell/SiteShell.jsx; home, shop, products, solutions, press, about, contact and
// search have their own folders under app/[locale].
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          {/* ── Public top‑level routes ── */}
          <Route path="/register" element={<Register />} />
          <Route path="/categories/:categoriesName" element={<CategoryPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/career" element={<CareerPage />} />

          {/* Resources */}
          <Route path="/resources/:slug" element={<ResourcePage />} />

          {/* ── Dashboard (protected) ── */}
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route element={<DashboardShell kind="user" />}>
              <Route index element={<UserDMain />} />
              <Route path="orders" element={<UserOrders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="payments" element={<UserPayments />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="reviews" element={<UserReviews />} />
            </Route>

            {/* Admin routes */}
            <Route element={<PrivateRoute role="admin" />}>
              <Route element={<DashboardShell kind="admin" />}>
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
              <Route path="pharma-apis" element={<ManagePharmaApis />} />
              <Route path="pharma-apis/new" element={<PharmaApiForm />} />
              <Route path="pharma-apis/:id/edit" element={<PharmaApiForm />} />
              <Route path="testimonials" element={<ManageTestimonials />} />
              <Route path="offers" element={<ManageOffers />} />
              <Route path="manage-reviews" element={<ManageReviews />} />
              <Route path="bulk-quotes" element={<ManageBulkQuotes />} />
              <Route path="/dashboard/hero-slides" element={<AdminHeroSlides />} />
              <Route path="press" element={<PressManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/bulk-quote" element={<BulkQuote />} />
          <Route path="/project-cost-calculator" element={<ProjectCostCalculator />} />
          <Route path="/pharma-api" element={<PharmaApiList />} />
          <Route path="/pharma-api/:slug" element={<PharmaApiDetail />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />

          {/* Anything else */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
