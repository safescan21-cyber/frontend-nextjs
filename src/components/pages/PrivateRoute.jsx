import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isLoggingOut } from '../useSiteLogout';

const PrivateRoute = ({ role }) => {
  const { user, ready } = useSelector((state) => state.auth ?? {});
  const location = useLocation();

  // The saved login is read just after the page loads (shell/SessionRestore.jsx)
  if (!ready) return null;

  // Not logged in at all → send to login, remember where they wanted to go
  if (!user) {
    if (isLoggingOut()) return null; // on the way to the home page after Logout
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role for this section → bounce to their own dashboard
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized → render whatever nested route matched
  return <Outlet />;
};

export default PrivateRoute;