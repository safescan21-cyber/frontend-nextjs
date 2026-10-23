'use client';
// Adds a machine to the comparison (up to 3) or takes it off again.
//   <CompareButton id={product._id} />                 (button with text)
//   <CompareButton id={product._id} compact />         (small chip, for product cards)
import toast from 'react-hot-toast';
import { GitCompare } from 'lucide-react';
import { useCompare, toggleCompare, MAX_COMPARE } from '../../utlis/compare';
import { useLocale } from '../../i18n/LocaleContext';

export default function CompareButton({ id, compact = false, className = '' }) {
  const { t } = useLocale();
  const ids = useCompare();
  const on = ids.includes(id);

  const click = (e) => {
    e.preventDefault(); // cards are links
    e.stopPropagation();
    if (!toggleCompare(id)) toast.error(t('You can compare up to {n} machines. Remove one first.', { n: MAX_COMPARE }));
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={click}
        aria-pressed={on}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow ${on ? 'bg-orange-500 text-white' : 'bg-white/95 text-slate-700 hover:bg-orange-50'} ${className}`}
      >
        <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
        {on ? t('Comparing') : t('Compare')}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={on}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${on ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-300 text-slate-700 hover:border-orange-400'} ${className}`}
    >
      <GitCompare className="h-4 w-4" aria-hidden="true" />
      {on ? t('Added to compare') : t('Add to compare')}
    </button>
  );
}
