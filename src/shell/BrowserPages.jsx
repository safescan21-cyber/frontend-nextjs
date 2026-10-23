'use client';
// Account and cart pages: Next.js routes (app/[locale]/login, cart…) whose content is
// drawn in the browser only. They depend on the login and cart saved on this device
// and on Firebase sign-in, and are kept out of Google, so there is nothing to gain
// from rendering them on the server.
import dynamic from 'next/dynamic';
import PageLoader from './PageLoader';

const browserOnly = (load) => dynamic(load, { ssr: false, loading: PageLoader });

export const CartPage = browserOnly(() => import('../components/cart/CartPage'));
export const CheckoutPage = browserOnly(() => import('../components/cart/CheckoutPage'));
export const LoginPage = browserOnly(() => import('../components/pages/Login'));
export const RegisterPage = browserOnly(() => import('../components/Register'));
export const ForgotPasswordPage = browserOnly(() => import('../components/password/ForgotPassword'));
export const ResetPasswordPage = browserOnly(() => import('../components/password/ResetPassword'));
