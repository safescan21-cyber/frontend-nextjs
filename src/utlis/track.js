// First-party activity tracking for the admin "Customer Insights" page.
// Only sends anything when the visitor accepted analytics cookies.
import getBaseURL from './baseURL';

const VISITOR_KEY = 'fpm_visitor_id';
const LIKES_KEY = 'fpm_liked_products';

export const hasAnalyticsConsent = () => {
  try {
    const record = JSON.parse(localStorage.getItem('cookie_consent') || 'null');
    return Boolean(record?.preferences?.analytics);
  } catch {
    return false;
  }
};

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^a-zA-Z0-9-]/g, '');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

export const track = (type, data = {}) => {
  if (!hasAnalyticsConsent()) return;
  const visitorId = getVisitorId();
  if (!visitorId) return;
  let token = null;
  try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }

  fetch(`${getBaseURL()}/api/insights/track`, {
    method: 'POST',
    keepalive: true,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      visitorId,
      type,
      path: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      ...data,
    }),
  }).catch(() => { /* tracking must never break the site */ });
};

// ❤️ product likes, remembered on this device
export const getLikedProducts = () => {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]')); } catch { return new Set(); }
};

export const setProductLiked = (productId, liked, productName = '') => {
  const set = getLikedProducts();
  if (liked) set.add(productId); else set.delete(productId);
  try { localStorage.setItem(LIKES_KEY, JSON.stringify([...set])); } catch { /* storage blocked */ }
  track(liked ? 'product_like' : 'product_unlike', { productId, productName });
};
