// /sitemap-content.xml — products and press articles, built live by the API
// (Backend/src/seo/seoRoutes.js). Proxied here so the URL works without nginx rules.
const API = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.foodpharmamachinery.com').replace(/\/$/, '');

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(`${API}/sitemap-content.xml`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return new Response(await res.text(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  } catch {
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}
