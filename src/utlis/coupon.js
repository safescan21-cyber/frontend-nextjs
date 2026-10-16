import getBaseURL from './baseURL';

// Set when a code is copied from the home page offer banner; checkout pre-fills it
export const COUPON_STORAGE_KEY = 'fpm_coupon';

export const rememberCoupon = (code) => {
  try { sessionStorage.setItem(COUPON_STORAGE_KEY, code); } catch { /* storage blocked */ }
};

// Asks the server whether a code works for this subtotal → { valid, discount, code, label, message }
export const checkCoupon = async (code, subtotal) => {
  const res = await fetch(`${getBaseURL()}/api/offers/validate-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.message) throw new Error("Couldn't check the code right now. Please try again.");
  return data;
};
