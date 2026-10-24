// Admin: teach the website chat (Nova). Questions + answers written here are looked up by the
// chat within a few minutes, and are included when the model is trained (llm-training/).
// Also lists what visitors asked that the chat couldn't answer, to answer in one click.
// Backend: /api/chat-qa (Backend/src/chatQa/chatQaRoutes.js)
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Save, Search, Trash2, MessageCircleQuestion, X } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';
import Toggle from '../../../../ui/Toggle';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };
const call = async (path, options = {}) => {
  const res = await fetch(`${getBaseURL()}/api/chat-qa${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};
const input = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none';

const Row = ({ item, onSaved, onDeleted }) => {
  const [x, setX] = useState(item);
  const [busy, setBusy] = useState('');
  const changed = x.question !== item.question || x.answer !== item.answer || x.active !== item.active;
  const save = async () => {
    setBusy('save');
    try {
      const d = await call(`/${item._id}`, { method: 'PATCH', body: JSON.stringify({ question: x.question, answer: x.answer, active: x.active }) });
      onSaved(d.item);
      toast.success('Saved');
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this question and answer?')) return;
    setBusy('delete');
    try { await call(`/${item._id}`, { method: 'DELETE' }); onDeleted(item._id); } catch (e) { toast.error(e.message); setBusy(''); }
  };
  return (
    <li className={`rounded-xl border bg-white p-4 ${x.active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}>
      <label className="text-xs font-semibold uppercase text-gray-500">Question
        <input value={x.question} onChange={(e) => setX({ ...x, question: e.target.value })} maxLength={300} className={input} />
      </label>
      <label className="mt-2 block text-xs font-semibold uppercase text-gray-500">Answer
        <textarea value={x.answer} onChange={(e) => setX({ ...x, answer: e.target.value })} maxLength={2000} rows={3} className={input} />
      </label>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Toggle checked={x.active} onChange={(v) => setX({ ...x, active: v })} label={x.active ? 'Used by the chat' : 'Not used'} />
        <div className="flex gap-2">
          <button type="button" onClick={remove} disabled={!!busy} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button type="button" onClick={save} disabled={!changed || !!busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40">
            {busy === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>
    </li>
  );
};

export default function ChatTraining() {
  const [items, setItems] = useState([]);
  const [missed, setMissed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState({ question: '', answer: '', missedId: '' });
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    Promise.all([call('/all'), call('/missed').catch(() => ({ items: [] }))])
      .then(([a, m]) => { setItems(a.items || []); setMissed(m.items || []); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await call('', { method: 'POST', body: JSON.stringify(draft) });
      setItems((v) => [d.item, ...v]);
      if (draft.missedId) setMissed((v) => v.filter((m) => m._id !== draft.missedId));
      setDraft({ question: '', answer: '', missedId: '' });
      toast.success('Added – the chat uses it within a few minutes');
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const answerMissed = (m) => {
    setDraft({ question: m.text, answer: '', missedId: m._id });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => formRef.current?.querySelector('textarea')?.focus(), 400);
  };
  const dismiss = async (m) => {
    try { await call(`/missed/${m._id}`, { method: 'PATCH', body: JSON.stringify({ status: 'dismissed' }) }); setMissed((v) => v.filter((x) => x._id !== m._id)); } catch (e) { toast.error(e.message); }
  };

  const shown = items.filter((i) => !q.trim() || `${i.question} ${i.answer}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Chatbot Training</h1>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">
        Teach Nova, the website chat. Each question and answer you add is used by the chat within a few minutes, and is included the next time the model is trained.
        Write answers the way you want customers to read them, and only true facts – the chat repeats them.
      </p>

      <form ref={formRef} onSubmit={add} className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Plus className="h-4 w-4" /> Add a question</h2>
          {draft.missedId && <button type="button" onClick={() => setDraft({ question: '', answer: '', missedId: '' })} className="text-gray-500 hover:text-gray-800" aria-label="Clear"><X className="h-4 w-4" /></button>}
        </div>
        <label className="mt-3 block text-sm font-medium text-gray-700">Question a customer might ask
          <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} required maxLength={300} placeholder="Do you export machines to Nepal?" className={input} />
        </label>
        <label className="mt-3 block text-sm font-medium text-gray-700">Nova's answer
          <textarea value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} required maxLength={2000} rows={3} placeholder="Yes, we supply machines to Nepal. Share your requirement on WhatsApp and we'll send a quotation with delivery terms." className={input} />
        </label>
        <button type="submit" disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add to Nova's knowledge
        </button>
      </form>

      {missed.length > 0 && (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-amber-900"><MessageCircleQuestion className="h-5 w-5" /> Questions Nova couldn't answer ({missed.length})</h2>
          <p className="text-xs text-amber-800">Asked by visitors (contact details removed). Answer the common ones so Nova knows next time.</p>
          <ul className="mt-3 divide-y divide-amber-200">
            {missed.map((m) => (
              <li key={m._id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-sm text-gray-900">{m.text} <span className="text-xs text-amber-700">· asked {m.count}×</span></span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => answerMissed(m)} className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700">Answer it</button>
                  <button type="button" onClick={() => dismiss(m)} className="rounded-lg px-3 py-1 text-xs text-gray-600 hover:bg-amber-100">Dismiss</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-gray-900">Nova's questions and answers ({items.length})</h2>
        <span className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-56 rounded-lg border border-gray-300 py-2 pl-8 pr-2 text-sm" /></span>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : shown.length === 0 ? (
        <p className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">{items.length ? 'Nothing matches your search.' : 'No questions yet. Add the questions customers ask most, with your best answers.'}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {shown.map((i) => (
            <Row key={i._id} item={i} onSaved={(n) => setItems((v) => v.map((x) => (x._id === n._id ? n : x)))} onDeleted={(id) => setItems((v) => v.filter((x) => x._id !== id))} />
          ))}
        </ul>
      )}
    </div>
  );
}
