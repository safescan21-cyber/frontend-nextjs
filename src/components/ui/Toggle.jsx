// On/off switch used for every yes/no setting (admin and customer screens).
//
//   <Toggle checked={active} onChange={setActive} label="Show on website" />
//   <Toggle checked={x} onChange={…} label="Sell online" description="Off = enquiry only" />
//   <Toggle checked={x} onChange={…} aria-label="Visible: Tablet press" size="sm" />   // in tables
//
// A real <button role="switch">: keyboard (Space/Enter), screen readers and focus ring
// work; the whole row (label included) is clickable. Consent boxes and row selection
// stay checkboxes – those are agreements and selections, not settings.
import { useId } from 'react';
import { Check, Loader2 } from 'lucide-react';

const TONES = {
  blue: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30',
  green: 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30',
  amber: 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30',
};

const SIZES = {
  sm: { track: 'h-5 w-9', knob: 'h-4 w-4', on: 'translate-x-4 rtl:-translate-x-4', icon: 'h-2.5 w-2.5', text: 'text-xs' },
  md: { track: 'h-6 w-11', knob: 'h-5 w-5', on: 'translate-x-5 rtl:-translate-x-5', icon: 'h-3 w-3', text: 'text-sm' },
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  busy = false,
  size = 'md',
  tone = 'blue',
  className = '',
  labelClassName = 'font-medium text-gray-800 dark:text-slate-100',
  id,
  ...rest // aria-label, title, name…
}) {
  const autoId = useId();
  const switchId = id || `toggle-${autoId}`;
  const s = SIZES[size] || SIZES.md;
  const off = disabled || busy;

  const flip = () => {
    if (!off) onChange?.(!checked);
  };

  return (
    <div className={`inline-flex items-start gap-3 ${off ? 'opacity-60' : ''} ${className}`}>
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-busy={busy || undefined}
        disabled={off}
        onClick={flip}
        className={`relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${s.track} ${
          checked ? `${TONES[tone] || TONES.blue} shadow-md` : 'bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500'
        } ${off ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={`flex items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${s.knob} ${
            checked ? s.on : 'translate-x-0'
          }`}
        >
          {busy ? (
            <Loader2 className={`${s.icon} animate-spin text-gray-400`} />
          ) : (
            <Check className={`${s.icon} text-blue-600 transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
          )}
        </span>
      </button>
      {(label || description) && (
        <label htmlFor={switchId} className={`select-none ${off ? 'cursor-not-allowed' : 'cursor-pointer'} ${s.text}`}>
          {label && <span className={`block leading-6 ${labelClassName}`}>{label}</span>}
          {description && <span className="block text-xs leading-snug text-gray-500 dark:text-slate-400">{description}</span>}
        </label>
      )}
    </div>
  );
}
