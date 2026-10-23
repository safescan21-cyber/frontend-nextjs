import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const CategoryPage = lazy(() => import('./components/pages/CategoryPage'));
import PrivateRoute from './components/pages/PrivateRoute';
import PageLoader from './shell/PageLoader';

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
const AddJob = lazy(() => import('./components/pages/dashboard/admin/jobs/AddJob'));
const ManageJobs = lazy(() => import('./components/pages/dashboard/admin/jobs/ManageJobs'));

const VisitorAnalytics = lazy(() => import('./components/pages/dashboard/admin/VisitorAnalytics'));
const CustomerInsights = lazy(() => import('./components/pages/dashboard/admin/insights/CustomerInsights'));
const MarketTrends = lazy(() => import('./components/pages/dashboard/admin/MarketTrends'));
const ManageOffers = lazy(() => import('./components/pages/dashboard/admin/offers/ManageOffers'));
const ManageReviews = lazy(() => import('./components/pages/dashboard/admin/reviews/ManageReviews'));
const AdminHeroSlides = lazy(() => import('../src/components/pages/dashboard/admin/AdminHeroSlides'));
const PressManagement = lazy(() => import('../src/components/pages/PressManagement'));

import NotFound from './components/seo/NotFound';
const ProjectCostCalculator = lazy(() => import('./components/pages/costCalculator/ProjectCostCalculator'));
const ManagePharmaApis = lazy(() => import('./components/pages/dashboard/admin/pharmaApi/ManagePharmaApis'));
const PharmaApiForm = lazy(() => import('./components/pages/dashboard/admin/pharmaApi/PharmaApiForm'));
const ManageTestimonials = lazy(() => import('./components/pages/dashboard/admin/testimonials/ManageTestimonials'));
const ManageBulkQuotes = lazy(() => import('./components/pages/dashboard/admin/quotes/ManageBulkQuotes'));
import { ResourcePage } from './components/seo/SolutionPages';

const Wishlist = () => (
  <div className="p-8 text-slate-200">
    <h2 className="text-2xl font-bold">Your Wishlist</h2>
    <p className="mt-4 text-slate-400">You haven't added any items yet.</p>
  </div>
);

// Pages that are not Next.js pages yet: the dashboards, wishlist, resource pages, the
// project cost calculator and old /categories/ addresses. The site header, footer and
// providers come from shell/SiteShell.jsx; every other page has its own folder under
// app/[locale].
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          {/* ── Public top‑level routes ── */}
          <Route path="/categories/:categoriesName" element={<CategoryPage />} />
          <Route path="/wishlist" element={<Wishlist />} />

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

          <Route path="/project-cost-calculator" element={<ProjectCostCalculator />} />

          {/* Anything else */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
