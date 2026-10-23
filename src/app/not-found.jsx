// Addresses outside the site pages (e.g. /api/… or a missing file). Missing pages,
// products and articles use app/[locale]/not-found.jsx, inside the site header.

// (Next.js adds <meta name="robots" content="noindex"> to 404 responses itself)
export const metadata = {
  title: { absolute: 'Page not found | Food Pharma Machinery' },
  description: 'This page is no longer available. Browse pharma and food processing machinery at Food Pharma Machinery.',
  openGraph: { title: 'Page not found | Food Pharma Machinery' },
  twitter: { title: 'Page not found | Food Pharma Machinery' },
};

export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '120px 16px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>
        This page is no longer available. <a href="/shop">Browse pharma and food processing machinery</a>.
      </p>
    </main>
  );
}
