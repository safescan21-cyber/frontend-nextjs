// Root layout: replaces the Vite index.html (<head> tags, icons, global CSS).
import { headers } from 'next/headers';
import '../index.css';
import { SITE_URL, SITE_NAME } from '../components/seo/organization';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE } from '../seo/pageSeo';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    'food pharma machinery', 'pharma machinery India', 'tablet press', 'capsule filling machine', 'blister packaging machine',
    'liquid filling machine', 'tube filling machine', 'fluid bed dryer', 'sigma mixer', 'pharma spares', 'PureLine Machinery Haridwar',
  ],
  // Logo icons under new file names: Google's search results still show the old
  // Vite icon it cached long ago, and new URLs make it fetch the logo again.
  // Google wants a square icon whose size is a multiple of 48px, listed first.
  icons: {
    icon: [
      { url: '/icon-2026.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-2026-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-2026.svg', type: 'image/svg+xml' },
      { url: '/icon-2026-32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icon-2026.ico',
    apple: [{ url: '/apple-touch-icon.png?v=6', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: [DEFAULT_IMAGE] },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
};

// Applies the visitor's saved theme before first paint (see components/ThemeToggle.jsx)
const THEME_SCRIPT = "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}";

export default async function RootLayout({ children }) {
  const h = await headers();
  const lang = h.get('x-site-lang') || 'en-IN'; // set by proxy.js
  const dir = h.get('x-site-dir') === 'rtl' ? 'rtl' : 'ltr'; // Urdu reads right to left
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
