import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { replaceCart } from './cartSlice';
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
const CART_KEY = 'cart_v1';
const readSavedCart = (raw) => {
  try {
    const list = JSON.parse(raw ?? (typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null) ?? '[]');
    return Array.isArray(list)
      ? list.filter((i) => i && typeof i._id === 'string' && Number(i.price) >= 0 && Number(i.quantity) >= 1).slice(0, 50)
      : [];
  } catch {
    return [];
  }
};

export const store = configureStore({
  preloadedState: { cart: { products: readSavedCart() } },
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

if (typeof window !== 'undefined') {
  let savedCart = store.getState().cart.products;
  store.subscribe(() => {
    const products = store.getState().cart.products;
    if (products === savedCart) return;
    savedCart = products;
    try { localStorage.setItem(CART_KEY, JSON.stringify(products)); } catch { /* storage full or blocked */ }
  });
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) store.dispatch(replaceCart(readSavedCart(e.newValue ?? '[]')));
  });
}

export default store;