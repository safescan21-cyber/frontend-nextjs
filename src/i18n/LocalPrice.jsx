'use client';
// "≈ $3,950" next to an INR price on the country versions (nothing on the India site).
// Checkout is still charged in INR, so it is labelled as an estimate.
import { useLocale } from './LocaleContext';

export default function LocalPrice({ inr, className = 'text-xs text-slate-500' }) {
  const { formatLocal, t } = useLocale();
  const local = formatLocal(Number(inr));
  if (!local) return null;
  return (
    <span className={className} title={t('Approximate price in your currency. You pay in Indian rupees (INR).')}>
      ≈ {local}
    </span>
  );
}
