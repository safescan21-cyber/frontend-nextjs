import { useEffect } from 'react';
import { useLocation } from '../shell/router';
import { track } from '../utlis/track';
import { gaPageView } from '../utlis/analytics';

// Records a page view on every route change (admin dashboard excluded)
const PageViewTracker = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/dashboard')) return;
    track('page_view');
    const t = setTimeout(gaPageView, 300);
    return () => clearTimeout(t);
  }, [pathname, search]);
  return null;
};

export default PageViewTracker;
