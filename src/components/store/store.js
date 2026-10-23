import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import authApi from './authApi';
import productsApi from './products/productsApi';
import { reviewApi } from './review/reviewApi';
import statsApi from "./stats/statsApi";
import orderApi from "./orderApi";
import { jobsApi } from '../pages/dashboard/admin/jobs/jobsApi';

// ─── NEW: Hero API ──
import { heroApi } from './heroApi';   // adjust path if needed
import { track } from '../../utlis/track';

// Records add-to-cart for Customer Insights, wherever it happens on the site
const trackCartMiddleware = () => (next) => (action) => {
  if (action.type === 'cart/addToCart' && action.payload?._id) {
    track('add_to_cart', { productId: String(action.payload._id), productName: action.payload.name || '' });
  }
  return next(action);
};

// The cart is kept on this device so it survives reloads and is shared with
// other open windows (pharma API pages open in a new window). Prices in it are
// only for display: the server prices every order from the database.
// The saved cart and login are read after the page has loaded (SessionRestore.jsx):
// the server renders every page logged out with an empty cart, and the first
// render in the browser has to match it.
export const CART_KEY = 'cart_v1';
export const readSavedCart = (raw) => {
  try {
    const list = JSON.parse(raw ?? (typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null) ?? '[]');
    return Array.isArray(list)
      ? list.filter((i) => i && typeof i._id === 'string' && Number(i.price) >= 0 && Number(i.quantity) >= 1).slice(0, 50)
      : [];
  } catch {
    return [];
  }
};

// One store per browser tab, and one per request on the server (SiteShell.jsx)
export const makeStore = () => configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,

    // ─── ADD HERO API ──
    [heroApi.reducerPath]: heroApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      reviewApi.middleware,
      statsApi.middleware,
      orderApi.middleware,
      jobsApi.middleware,

      // ─── ADD HERO API MIDDLEWARE ──
      heroApi.middleware,
      trackCartMiddleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Saves the cart on every change, once it has been restored (see SessionRestore.jsx)
export const saveCartOnChange = (store) => {
  let savedCart = store.getState().cart.products;
  return store.subscribe(() => {
    const products = store.getState().cart.products;
    if (products === savedCart) return;
    savedCart = products;
    try { localStorage.setItem(CART_KEY, JSON.stringify(products)); } catch { /* storage full or blocked */ }
  });
};
