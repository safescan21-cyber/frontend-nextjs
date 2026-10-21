'use client';
// Shows the server-rendered SEO summary (children) until the React app has
// loaded in the browser, then swaps it for the app. The app uses window,
// localStorage etc. at import time, so it is never rendered on the server.
import { useEffect, useState } from 'react';
import WebMcpTools from '../components/webmcp/WebMcpTools';

// Next.js writes these head tags for crawlers; once the app runs, its <Seo>
// component (react-helmet-async) writes its own. The newest copy of each wins.
// Older copies are neutralised, not removed: React owns both sets of elements
// and crashes if it later tries to remove one that is gone.
// (<title> is left alone: the app sets document.title itself, which always wins.)
const headKey = (el) => {
  if (el.tagName === 'LINK') {
    if (el.getAttribute('rel') === 'canonical') return 'canonical';
    if (el.getAttribute('rel') === 'alternate' && el.getAttribute('hreflang')) return `alt:${el.getAttribute('hreflang')}`;
    return null;
  }
  if (el.tagName !== 'META') return null;
  const name = el.getAttribute('name') || el.getAttribute('property');
  return name && /^(description|robots|og:|twitter:)/.test(name) ? `meta:${name}` : null;
};

const neutralise = (el) => {
  if (el.tagName === 'LINK') {
    el.setAttribute('rel', `x-replaced-${el.getAttribute('rel')}`);
  } else {
    const attr = el.hasAttribute('name') ? 'name' : 'property';
    el.setAttribute(`data-replaced-${attr}`, el.getAttribute(attr));
    el.removeAttribute(attr);
  }
};

const dedupeHead = () => {
  const newest = new Map();
  [...document.head.children].reverse().forEach((el) => {
    const key = headKey(el);
    if (!key) return;
    if (newest.has(key)) neutralise(el);
    else newest.set(key, el);
  });
};

export default function ClientApp({ children }) {
  const [Spa, setSpa] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import('../spa').then((mod) => {
      if (!cancelled) setSpa(() => mod.default);
    });
    const observer = new MutationObserver(dedupeHead);
    observer.observe(document.head, { childList: true });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {Spa ? <Spa /> : children}
      <WebMcpTools />
    </>
  );
}
