'use client';
// Pages that are not Next.js pages yet (login, cart, dashboard…, see App.jsx).
// Shows the server-rendered SEO summary (children) until those pages' code has
// loaded in the browser, then swaps it for the page. They use window, localStorage
// etc. while rendering, so they are never rendered on the server.
import { useEffect, useState } from 'react';

let LoadedApp = null; // after the first load, moving between these pages shows them at once

export default function ClientApp({ children }) {
  const [App, setApp] = useState(() => LoadedApp);

  useEffect(() => {
    if (App) return undefined;
    let cancelled = false;
    import('../App').then((mod) => {
      LoadedApp = mod.default;
      if (!cancelled) setApp(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [App]);

  return App ? <App /> : children;
}
