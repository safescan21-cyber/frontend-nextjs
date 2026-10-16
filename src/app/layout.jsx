// Root layout: replaces the Vite index.html (<head> tags, icons, global CSS).
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
  icons: {
    icon: [
      { url: '/favicon.svg?v=5', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png?v=5', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=5', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png?v=5', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=5',
    apple: [{ url: '/apple-touch-icon.png?v=5', sizes: '180x180' }],
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
