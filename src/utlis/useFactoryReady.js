'use client';
// Whether /factory has content (factory photos or client installations added in admin).
// Until then the page is noindex (and out of the sitemap), so links to it are hidden: links to
// noindex pages show up in Google Search Console as "Excluded by noindex".
import { useEffect, useState } from 'react';
import getBaseURL from './baseURL';

let ready = null; // one check per page load, shared by every component that asks

const check = () => {
  if (!ready) {
    const has = (kind) => fetch(`${getBaseURL()}/api/showcase?kind=${kind}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => Boolean(d?.items?.length))
      .catch(() => false);
    ready = Promise.all([has('photo'), has('client')]).then(([photos, clients]) => photos || clients);
  }
  return ready;
};

export default function useFactoryReady() {
  const [isReady, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    check().then((v) => { if (alive) setReady(v); });
    return () => { alive = false; };
  }, []);
  return isReady;
}
