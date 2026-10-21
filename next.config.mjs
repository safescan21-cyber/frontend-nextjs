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
    ];
  },
  async headers() {
    return [
      {
        // Google sign-in popups need this (same header the Vite site/nginx sends)
        source: '/:path*',
        headers: [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }],
      },
    ];
  },
};

export default nextConfig;
