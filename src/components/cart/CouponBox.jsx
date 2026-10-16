import React, { useEffect, useState } from 'react';
import { Tag, X, Loader2, CheckCircle } from 'lucide-react';
import { COUPON_STORAGE_KEY, checkCoupon } from '../../utlis/coupon';

// "Have a coupon code?" box for the order summary.
// applied = { code, discount, label } or null
const CouponBox = ({ subtotal, applied, onApply, onRemove, disabled }) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  // Pre-fill a code the visitor copied from the home page offer
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(COUPON_STORAGE_KEY);
      if (saved && !applied) {
        setCode(saved);
        setOpen(true);
      }
    } catch { /* storage blocked */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = async (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return setError('Please enter a coupon code.');
    setChecking(true);
    setError('');
    try {
      const result = await checkCoupon(clean, subtotal);
      if (result.valid) {
        onApply({ code: result.code, discount: result.discount, label: result.label });
        setCode('');
        try { sessionStorage.removeItem(COUPON_STORAGE_KEY); } catch { /* storage blocked */ }
      } else {
        setError(result.message || "This coupon code isn't valid.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
        <span className="flex min-w-0 items-center gap-2 text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <span className="font-mono font-bold">{applied.code}</span>
            {applied.label ? ` · ${applied.label}` : ''}
          </span>
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove coupon ${applied.code}`}
          className="shrink-0 rounded p-1 text-green-700 hover:bg-green-100 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
      >
        <Tag className="h-4 w-4" /> Have a coupon code?
      </button>
    );
  }

  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor="coupon-code" className="mb-1 block text-xs font-medium text-gray-600">Coupon code</label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
          placeholder="e.g. DIWALI25"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled || checking}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'coupon-error' : undefined}
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2 font-mono text-base uppercase sm:text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'
          }`}
        />
        <button
          type="submit"
          disabled={disabled || checking}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {checking && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply
        </button>
      </div>
      {error && <p id="coupon-error" role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </form>
  );
};

export default CouponBox;
