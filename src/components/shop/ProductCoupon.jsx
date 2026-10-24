'use client';
// The coupon the admin attached to a product (Products → coupon code), shown only while
// the code is valid (Backend /api/offers/validate-code, checked against the product price).
//   <ProductCoupon product={product} />
import { useEffect, useState } from 'react';
import { Copy, Tag } from 'lucide-react';
import getBaseURL from '../../utlis/baseURL';
import { useLocale } from '../../i18n/LocaleContext';

export default function ProductCoupon({ product }) {
  const { t } = useLocale();
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const code = String(product?.couponCode || '').trim();
  const price = Number(product?.price) || 0;

  useEffect(() => {
    if (!code || !(price > 0)) return undefined;
    let live = true;
    fetch(`${getBaseURL()}/api/offers/validate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal: price }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        // Valid now, or valid with a bigger order (minimum order message): show it
        if (d.valid || /minimum order/i.test(d.message || '')) setInfo(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [code, price]);

  if (!info) return null;
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-3">
      <Tag className="h-5 w-5 text-red-500" aria-hidden="true" />
      <div className="text-sm text-red-900">
        <span className="font-semibold">{t('Coupon')}:</span>{' '}
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono font-bold text-red-700 ring-1 ring-red-200 hover:bg-red-100" title={t('Copy code')}>
          {code} <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>{' '}
        {copied ? t('Copied!') : info.valid
          ? t('{label}: you save ₹{amount} at checkout.', { label: info.label || '', amount: Number(info.discount).toLocaleString('en-IN') })
          : info.message}
      </div>
    </div>
  );
}
