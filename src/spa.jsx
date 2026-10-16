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

export default function Spa() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PageViewTracker />
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  );
}
