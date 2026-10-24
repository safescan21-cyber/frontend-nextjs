// Admin: SEO health of every page in the sitemap (title, description, H1, canonical, noindex,
// image alt texts, speed). Runs automatically every Monday with an email report; this page
// runs it now. Backend: POST /api/seo/audit (Backend/src/seo/seoAudit.js)
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Search, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import getBaseURL from '../../../../../utlis/baseURL';

const token = () => { try { return localStorage.getItem('token'); } catch { return null; } };

export default function SeoHealth() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState(false);
  const [onlyIssues, setOnlyIssues] = useState(true);

  const run = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${getBaseURL()}/api/seo/audit${email ? '?email=1' : ''}`, {
        method: 'POST',
        credentials: 'include',
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not run the check');
      setResult(data);
      if (data.emailed) toast.success(`Report emailed to ${data.reportTo}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pages = (result?.pages || []).filter((p) => !onlyIssues || p.issues.length);
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">SEO Health</h1>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">
        Checks every page in your sitemap the way Google sees it: page title, description, H1 heading, canonical link, noindex, image descriptions, structured data and speed.
        It runs automatically every Monday at 8:00 and emails the report; all pages are then sent to search engines (IndexNow) to be re-crawled.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={run} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {busy ? 'Checking all pages… (about a minute)' : 'Run SEO check now'}
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /> Also email the report
        </label>
      </div>

      {result && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-xs uppercase text-gray-500">Pages checked</p><p className="text-2xl font-bold">{result.checked}</p><p className="text-xs text-gray-500">sitemap: {result.sitemapUrls} incl. languages</p></div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-xs uppercase text-red-700">Errors</p><p className="text-2xl font-bold text-red-700">{result.errors}</p></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs uppercase text-amber-700">Warnings</p><p className="text-2xl font-bold text-amber-700">{result.warnings}</p></div>
            <div className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-xs uppercase text-gray-500">Average load</p><p className="text-2xl font-bold">{(result.avgMs / 1000).toFixed(1)} s</p></div>
          </div>
          {result.site?.length > 0 && <ul className="mt-3 text-sm text-red-700">{result.site.map((x) => <li key={x.text}>● {x.text}</li>)}</ul>}

          <div className="mt-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pages</h2>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} /> Only pages with issues</label>
          </div>
          {pages.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle className="h-5 w-5" /> No problems found on any page.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {pages.map((p) => (
                <li key={p.url} className="p-3 text-sm">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{p.url.replace('https://www.foodpharmamachinery.com', '') || '/'}</a>
                  <span className="ml-2 text-xs text-gray-500">{p.status} · {(p.ms / 1000).toFixed(1)} s</span>
                  {p.title && <p className="text-xs text-gray-500">{p.title}</p>}
                  {p.issues.length ? (
                    <ul className="mt-1 space-y-0.5">
                      {p.issues.map((x) => (
                        <li key={x.text} className={`flex items-start gap-1.5 ${x.level === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                          {x.level === 'error' ? <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />} {x.text}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-1 flex items-center gap-1 text-green-700"><CheckCircle className="h-3.5 w-3.5" /> OK</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
