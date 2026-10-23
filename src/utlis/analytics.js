// Google Analytics 4 — loads only when VITE_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXX)
// AND the visitor accepted analytics cookies. Without both, nothing is sent to Google.
import { hasAnalyticsConsent } from './track';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
let loaded = false;

export const initAnalytics = () => {
  if (loaded || !GA_ID || !/^G-[A-Z0-9]+$/.test(GA_ID) || !hasAnalyticsConsent()) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  // Page views are sent by gaPageView() on each route change
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
};

export const gaPageView = () => {
  initAnalytics();
  if (!loaded || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
  });
};

// Goals in Google Analytics (only with analytics consent and a GA id, like page views):
//   gaEvent('generate_lead', { form: 'quick_quote' })   gaEvent('file_download', { file_name })
// WhatsApp and phone links are counted automatically (whatsapp_click, phone_click).
export const gaEvent = (name, params = {}) => {
  initAnalytics();
  if (!loaded || !window.gtag) return;
  window.gtag('event', name, { page_path: window.location.pathname, ...params });
};

// Start as soon as the visitor accepts analytics in the cookie banner
if (typeof window !== 'undefined') {
  window.addEventListener('cookieConsentUpdated', () => gaPageView());
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) gaEvent('whatsapp_click', { link_text: (a.textContent || '').trim().slice(0, 60) });
    else if (href.startsWith('tel:')) gaEvent('phone_click', { link_text: href.slice(4) });
  }, { capture: true });
}
