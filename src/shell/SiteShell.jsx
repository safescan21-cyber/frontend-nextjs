'use client';
// Everything around the page content, shared by every page: Redux store, language,
// header, footer, chat, cookie banner and toasts. Rendered by app/[locale]/layout.jsx,
// so it stays mounted while visitors move between pages and is part of the
// server-rendered HTML.
import '../App.css';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import { makeStore } from '../components/store/store';
import SessionRestore from './SessionRestore';
import { LocaleProvider } from '../i18n/LocaleContext';
import ScrollToTop from '../components/pages/Scrolltotop';
import PageViewTracker from '../components/PageViewTracker';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileActionButtons from '../components/MobileActionButtons';
import CookieConsent from '../components/pages/CookieConsent';
import LiveChat from '../components/pages/LiveChat';
import RouteSeo from '../components/seo/RouteSeo';
import WebMcpTools from '../components/webmcp/WebMcpTools';
import { dedupeHead } from './headTags';

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

export default function SiteShell({ locale = '', children }) {
  const [store] = useState(makeStore);

  // Next.js and the pages' <Seo> both write head tags; keep only the newest of each
  useEffect(() => {
    dedupeHead();
    const observer = new MutationObserver(dedupeHead);
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Provider store={store}>
      <HelmetProvider>
        <LocaleProvider locale={locale}>
          <SessionRestore />
          <ScrollToTop />
          <PageViewTracker />
          <div className="app-shell flex flex-col min-h-screen">
            <Toaster position="top-right" reverseOrder={false} gutter={8} toastOptions={toastOptions} />
            <Navbar />
            <RouteSeo />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <MobileActionButtons />
            <Footer />
            <CookieConsent />
            <LiveChat />
          </div>
          <WebMcpTools />
        </LocaleProvider>
      </HelmetProvider>
    </Provider>
  );
}
