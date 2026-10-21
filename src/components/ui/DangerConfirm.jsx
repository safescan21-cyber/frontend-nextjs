// Confirmation for actions that wipe data: the admin types a word (DELETE) before the
// red button works. Esc or Cancel closes it.
//
//   <DangerConfirm open={x} title="Delete all visitor data?" onCancel={…} onConfirm={…} busy={…}>
//     What will be removed and what stays.
//   </DangerConfirm>
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

export default function DangerConfirm({ open, title, children, word = 'DELETE', confirmLabel = 'Delete everything', busy = false, onCancel, onConfirm }) {
  const [typed, setTyped] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setTyped('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel?.();
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open, busy, onCancel]);

  if (!open) return null;
  const ok = typed.trim().toUpperCase() === word;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]" role="presentation" onClick={() => !busy && onCancel?.()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="danger-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40"><AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 id="danger-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            <div className="mt-1 text-sm text-gray-600 dark:text-slate-300">{children}</div>
          </div>
        </div>
        <form
          className="mt-5"
          onSubmit={(e) => { e.preventDefault(); if (ok && !busy) onConfirm?.(); }}
        >
          <label className="block text-sm text-gray-700 dark:text-slate-200">
            Type <strong className="font-mono text-red-600">{word}</strong> to confirm
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={!ok || busy} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              {busy ? 'Deleting…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
