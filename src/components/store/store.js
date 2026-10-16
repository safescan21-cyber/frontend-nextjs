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

export const store = configureStore({
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

export default store;