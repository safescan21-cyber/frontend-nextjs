# Food Pharma Machinery — Next.js frontend

Next.js version of the www.foodpharmamachinery.com website (PureLine Machinery Pvt. Ltd.).
It replaces the Vite/React frontend (`safescan21-cyber/frontend`) and uses the same
backend API (`api.foodpharmamachinery.com`).

## Migration status

**Step 1 — done (this repo):** the whole existing React app runs inside Next.js.

- Every URL is served by `src/app/[[...slug]]/page.jsx`. Next.js renders that page's
  **SEO on the server**: title, description, canonical URL, Open Graph/Twitter tags,
  structured data (Organization, Product, NewsArticle, BreadcrumbList) and a short
  readable summary for crawlers.
- Product (`/shop/:id`) and press (`/press/:id`) pages are looked up from the API
  (cached 5 minutes); missing ones return a real **404**. Demo products are `noindex`.
- In the browser the original app (React Router, Redux, Stripe, Firebase login…) takes
  over exactly as before — see `src/spa.jsx` and `src/app/ClientApp.jsx`.
- `/sitemap.xml` (pages) and `/sitemap-content.xml` (products & press, from the API).

**Step 2 — next:** convert pages one by one into real server-rendered Next.js pages
(own folder under `src/app`, server components, `next/link`, `next/image`). Suggested
order: product page → shop → home → solutions → static pages. Dashboard and checkout
can stay client-side.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3001
```

The live API only accepts browser requests from approved origins; for local testing
against it, run on port 5173: `npx next dev -p 5173`.

## Environment variables

All are `NEXT_PUBLIC_*` (they end up in the browser bundle) — see `.env.example`.
They are the old `VITE_*` variables renamed.

> Security: `NEXT_PUBLIC_DEEPSEEK_API_KEY` / `NEXT_PUBLIC_OPENROUTER_API_KEY` (used by
> the live chat) are visible to anyone in the browser, exactly as they were on the Vite
> site. Move those calls to the backend and rotate the keys.

## Deploy on the VPS (when ready to switch)

```bash
npm ci && npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
PORT=3001 pm2 start .next/standalone/server.js --name foodpharma-next
```

nginx for `www.foodpharmamachinery.com`: keep the `/p/` (share pages) proxy to the API,
and send everything else to Next.js instead of the static folder:

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

The current Vite site keeps working until nginx is switched, so you can test the Next.js
version on a separate subdomain first (e.g. `next.foodpharmamachinery.com`).
