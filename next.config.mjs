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
