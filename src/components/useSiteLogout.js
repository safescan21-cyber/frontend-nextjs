// Log out from anywhere (header dropdown, admin side menu): ends the server session,
// clears the saved user and cart, goes home.
import { useDispatch } from 'react-redux';
import { useNavigate } from '../shell/router';
import toast from 'react-hot-toast';
import { useLogoutUserMutation } from './store/authApi';
import { logout } from './store/authSlice';
import { clearCart } from './store/cartSlice';

// True for a moment while logging out. The move to the home page lands a little after
// the user is cleared; meanwhile the protected page must not bounce to /login
// (see pages/PrivateRoute.jsx).
let loggingOut = false;
export const isLoggingOut = () => loggingOut;

export default function useSiteLogout() {
  const [logoutUser, { isLoading }] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async (after) => {
    try {
      await logoutUser().unwrap();
      after?.();
      loggingOut = true;
      navigate('/', { replace: true });
      dispatch(logout());
      dispatch(clearCart());
      setTimeout(() => { loggingOut = false; }, 10000); // Next.js may take a moment to show the home page
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed. Please try again.');
    }
  };

  return { signOut, isLoggingOut: isLoading };
}
