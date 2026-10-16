// Missing products/articles: real 404 status for Google, and the app's own
// "page not found" screen for people (React Router renders it).
import ClientApp from './ClientApp';

// (Next.js adds <meta name="robots" content="noindex"> to 404 responses itself)
export const metadata = {
  title: { absolute: 'Page not found | Food Pharma Machinery' },
  description: 'This page is no longer available. Browse pharma and food processing machinery at Food Pharma Machinery.',
  openGraph: { title: 'Page not found | Food Pharma Machinery' },
  twitter: { title: 'Page not found | Food Pharma Machinery' },
};

export default function NotFound() {
  return (
    <ClientApp>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '120px 16px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p>
          This page is no longer available. <a href="/shop">Browse pharma and food processing machinery</a>.
        </p>
      </main>
    </ClientApp>
  );
}
