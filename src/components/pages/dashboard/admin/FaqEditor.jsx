// Product FAQ editor for the admin product forms: question + answer pairs (max 15)
//   <FaqEditor value={faqs} onChange={setFaqs} />
import { Plus, Trash2 } from 'lucide-react';

const EXAMPLES = ['What power supply does it need?', 'How much floor space is required?', 'What is the delivery time?', 'Is installation and operator training included?'];

export default function FaqEditor({ value = [], onChange }) {
  const set = (i, patch) => onChange(value.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Questions buyers ask (FAQ)</label>
        {value.length < 15 && (
          <button type="button" onClick={() => onChange([...value, { q: '', a: '' }])} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
            <Plus className="h-4 w-4" /> Add question
          </button>
        )}
      </div>
      <p className="mt-0.5 text-xs text-gray-500">Shown on the product page and to Google. Only write answers that are true for this machine, e.g. {EXAMPLES.slice(0, 2).join(' / ')}</p>
      <div className="mt-2 space-y-3">
        {value.map((f, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3">
            <div className="flex gap-2">
              <input value={f.q} onChange={(e) => set(i, { q: e.target.value })} maxLength={300} placeholder={EXAMPLES[i % EXAMPLES.length]} aria-label={`Question ${i + 1}`} className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" />
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`Remove question ${i + 1}`} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <textarea value={f.a} onChange={(e) => set(i, { a: e.target.value })} maxLength={2000} rows={2} placeholder="Answer" aria-label={`Answer ${i + 1}`} className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
