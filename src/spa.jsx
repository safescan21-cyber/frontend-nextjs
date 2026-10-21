'use client';
// The existing React app (formerly src/main.jsx), loaded in the browser only.
// Next.js serves every URL (see app/[[...slug]]/page.jsx); React Router inside
// the app takes over routing exactly as it did on the Vite site.
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import { store } from './components/store/store';
import ScrollToTop from './components/pages/Scrolltotop';
import PageViewTracker from './components/PageViewTracker';
import { LocaleProvider } from './i18n/LocaleContext';
import { splitLocale } from './i18n/locales';

export default function Spa() {
  // /fr/shop -> the app runs under /fr (country versions, see i18n/locales.js)
  const { locale } = splitLocale(window.location.pathname);
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter basename={locale ? `/${locale}` : undefined}>
          <LocaleProvider locale={locale}>
            <ScrollToTop />
            <PageViewTracker />
            <App />
          </LocaleProvider>
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}
