// Coupon code for a product: suggests the discount codes made in Admin → Discount Offers.
// The product page shows the code only while it is valid.
import { useEffect, useState } from 'react';
import getBaseUrl from '../../../../../utlis/baseURL';

export default function CouponInput({ value, onChange }) {
  const [codes, setCodes] = useState([]);
  useEffect(() => {
    let token = null;
    try { token = localStorage.getItem('token'); } catch { /* storage blocked */ }
    fetch(`${getBaseUrl()}/api/offers`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setCodes((d.offers || []).filter((o) => o.code && o.discountType && o.discountValue > 0)))
      .catch(() => {});
  }, []);
  return (
    <div>
      <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700">Coupon code (optional, shown on the product page while valid)</label>
      <input
        id="couponCode"
        name="couponCode"
        list="coupon-codes"
        value={value || ''}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s+/g, ''))}
        placeholder={codes[0]?.code || 'DIWALI10'}
        maxLength={30}
        className="add-product-InputCSS"
      />
      <datalist id="coupon-codes">
        {codes.map((o) => (
          <option key={o._id} value={o.code}>{o.discountType === 'percent' ? `${o.discountValue}% off` : `₹${o.discountValue} off`}{o.isActive ? '' : ' (inactive)'}</option>
        ))}
      </datalist>
      {codes.length === 0 && <p className="mt-1 text-xs text-gray-500">No discount codes yet: create one under Discount Offers.</p>}
    </div>
  );
}
