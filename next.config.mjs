import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This folder is the project root (a stray package-lock.json higher up must not be picked)
const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the VPS (run with PM2: node .next/standalone/server.js)
  output: 'standalone',
  outputFileTracingRoot: root,
  turbopack: { root },
  reactStrictMode: false, // the existing app was written without Strict Mode double-effects
  // Put page metadata in <head> for every visitor (not streamed in later), so
  // ClientApp can swap it for react-helmet-async's tags without duplicates.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  // Addresses from the old site that Google still has: 301 to the closest page today
  async redirects() {
    const moved = (source, destination) => ({ source, destination, statusCode: 301 });
    return [
      moved('/services', '/solutions'),
      moved('/services/installation', '/solutions/turnkey'),
      moved('/services/validation', '/solutions/compliance'),
      moved('/services/aftersales', '/contact'),
      moved('/services/:slug*', '/solutions'),
      moved('/product/:id', '/shop/:id'),
      moved('/terms', '/privacy'),
      moved('/packaging', '/solutions/packaging'),
      moved('/tablet-press', '/products/tablet-press'),
      moved('/capsule-filling', '/products/capsule-filling'),
      // Old "view order" links (the order pages live in the customer dashboard)
      moved('/orders', '/dashboard/orders'),
      moved('/orders/:id', '/dashboard/orders/:id'),
      moved('/:loc(en-us|en-gb|fr|ja|ko|ur)/orders', '/:loc/dashboard/orders'),
      moved('/:loc(en-us|en-gb|fr|ja|ko|ur)/orders/:id', '/:loc/dashboard/orders/:id'),
    ];
  },
  // Every page lives under src/app/[locale]/…: /fr/shop is served as it is, and the
  // India site (no country folder) as /_in/… (never visible to visitors). Keep the
  // folder list in step with LOCALES and DEFAULT_SEGMENT in src/i18n/locales.js.
  // Not for Next's own files, API routes or files with an extension.
  async rewrites() {
    const skip = '(?!(?:en-us|en-gb|fr|ja|ko|ur|_in|_next|api)(?:/|$))(?!.*\\.)';
    return {
      beforeFiles: [
        { source: '/', destination: '/_in' },
        { source: `/:first(${skip}[^/]+)`, destination: '/_in/:first' },
        { source: `/:first(${skip}[^/]+)/:rest*`, destination: '/_in/:first/:rest*' },
      ],
    };
  },
  async headers() {
    return [
      {
        // Google sign-in popups need this (same header the Vite site/nginx sends)
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Same protection the API gets from helmet: HTTPS only, no framing by other sites
          // (clickjacking), no MIME guessing, no full addresses sent to other sites
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // (payment is left out: Stripe's card / Google Pay frame needs it at checkout)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
