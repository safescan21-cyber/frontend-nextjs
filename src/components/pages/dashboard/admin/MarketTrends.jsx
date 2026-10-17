import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Plus, X, ExternalLink, MapPin, Search, Lightbulb, RotateCcw } from 'lucide-react';

// Admin "Market Trends": Google Trends charts for the machines we sell.
// Uses Google's official embed loader (the same code as the "< >" embed button
// on trends.google.com). Google has no open API, so the charts load in the
// admin's browser straight from Google; nothing goes through our server.
// If Google changes the loader version, update it from the embed code on
// trends.google.com (Explore → any chart → "< >").
const LOADER = 'https://ssl.gstatic.com/trends_nrtr/4564_RC01/embed_loader.js';
const MAX = 5; // Google compares at most 5 search terms
const STORAGE_KEY = 'admin_market_trends';

const DEFAULT_KEYWORDS = [
  'tablet press machine',
  'capsule filling machine',
  'blister packing machine',
  'liquid filling machine',
  'ribbon blender',
];

const REGIONS = [
  { value: 'IN', label: 'India' },
  { value: 'IN-GJ', label: 'Gujarat' },
  { value: 'IN-MH', label: 'Maharashtra' },
  { value: 'IN-HP', label: 'Himachal Pradesh' },
  { value: 'IN-TG', label: 'Telangana' },
  { value: '', label: 'Worldwide' },
];

const PERIODS = [
  { value: 'today 3-m', label: 'Past 90 days' },
  { value: 'today 12-m', label: 'Past 12 months' },
  { value: 'today 5-y', label: 'Past 5 years' },
];

const SUGGESTIONS = [
  'pharma machinery', 'tablet coating machine', 'fluid bed dryer', 'rapid mixer granulator',
  'cartoning machine', 'labelling machine', 'food processing machine', 'packaging machine',
  'ampoule filling machine', 'sifter machine', 'colloid mill', 'pouch packing machine',
];

// Broad terms always have enough searches for "related searches"; very specific
// machine names often don't (Google then shows "not enough data").
const BROAD_TERMS = ['pharma machinery', 'packaging machine', 'food processing machine'];

let loaderPromise;
const loadTrends = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.trends?.embed) return Promise.resolve(window.trends);
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = LOADER;
      s.async = true;
      s.onload = () => (window.trends?.embed ? resolve(window.trends) : reject(new Error('Trends loader missing')));
      s.onerror = () => { loaderPromise = null; reject(new Error('Could not load Google Trends')); };
      document.head.appendChild(s);
    });
  }
  return loaderPromise;
};

const readSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.keywords) && saved.keywords.length) return saved;
  } catch { /* storage blocked or bad data */ }
  return null;
};

// One Google Trends chart. Re-drawn whenever its settings change.
const TrendsWidget = ({ type, keywords, geo, time, onError }) => {
  const box = useRef(null);
  const key = `${type}|${keywords.join(',')}|${geo}|${time}`;
  useEffect(() => {
    let cancelled = false;
    const el = box.current;
    if (!el || !keywords.length) return undefined;
    el.innerHTML = '';
    loadTrends()
      .then((trends) => {
        if (cancelled) return;
        el.innerHTML = '';
        const q = keywords.map(encodeURIComponent).join(',');
        trends.embed.renderExploreWidgetTo(
          el,
          type,
          { comparisonItem: keywords.map((keyword) => ({ keyword, geo, time })), category: 0, property: '' },
          { exploreQuery: `date=${encodeURIComponent(time)}${geo ? `&geo=${geo}` : ''}&q=${q}`, guestPath: 'https://trends.google.com:443/trends/embed/' },
        );
      })
      .catch((err) => !cancelled && onError?.(err.message));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return <div ref={box} className="min-h-[200px] [&_iframe]:!w-full" />;
};

const MarketTrends = () => {
  const saved = typeof window !== 'undefined' ? readSaved() : null;
  const [keywords, setKeywords] = useState(saved?.keywords || DEFAULT_KEYWORDS);
  const [geo, setGeo] = useState(saved?.geo ?? 'IN');
  const [time, setTime] = useState(saved?.time || 'today 12-m');
  const [focus, setFocus] = useState(saved?.focus || BROAD_TERMS[0]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ keywords, geo, time, focus })); } catch { /* storage blocked */ }
  }, [keywords, geo, time, focus]);
  const focusOptions = [...new Set([...BROAD_TERMS, ...keywords])];
  useEffect(() => { if (!focusOptions.includes(focus)) setFocus(BROAD_TERMS[0]); }, [keywords, focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const addKeyword = (word) => {
    const k = word.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
    if (!k || keywords.includes(k)) return;
    if (keywords.length >= MAX) { setError(`Google compares at most ${MAX} terms. Remove one first.`); return; }
    setError('');
    setKeywords([...keywords, k]);
    setDraft('');
  };
  const removeKeyword = (k) => { setError(''); setKeywords(keywords.filter((x) => x !== k)); };
  const reset = () => { setError(''); setKeywords(DEFAULT_KEYWORDS); setGeo('IN'); setTime('today 12-m'); setFocus(BROAD_TERMS[0]); };

  const regionLabel = REGIONS.find((r) => r.value === geo)?.label || 'India';
  const openUrl = `https://trends.google.com/trends/explore?date=${encodeURIComponent(time)}${geo ? `&geo=${geo}` : ''}&q=${keywords.map(encodeURIComponent).join(',')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <TrendingUp className="h-6 w-6 text-blue-600" /> Market Trends
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            How much people search Google for our machines in {regionLabel}. Data from Google Trends.
          </p>
        </div>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Open in Google Trends <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {keywords.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              {k}
              <button type="button" onClick={() => removeKeyword(k)} aria-label={`Remove ${k}`} className="rounded-full p-0.5 hover:bg-blue-100">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {keywords.length < MAX && (
            <form onSubmit={(e) => { e.preventDefault(); addKeyword(draft); }} className="inline-flex items-center gap-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a search term…"
                aria-label="Add a search term"
                className="w-48 rounded-full border border-slate-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" aria-label="Add" className="rounded-full bg-blue-600 p-1.5 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            <select value={geo} onChange={(e) => setGeo(e.target.value)} aria-label="Region" className="rounded-lg border border-slate-300 px-2 py-1.5">
              {REGIONS.map((r) => <option key={r.value || 'world'} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <select value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time period" className="rounded-lg border border-slate-300 px-2 py-1.5">
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <span className="text-xs text-slate-400">{keywords.length}/{MAX} terms · saved on this device</span>
        </div>

        {keywords.length < MAX && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500">Ideas:</span>
            {SUGGESTIONS.filter((s) => !keywords.includes(s)).slice(0, 8).map((s) => (
              <button key={s} type="button" onClick={() => addKeyword(s)} className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-600 hover:border-blue-300 hover:text-blue-700">
                + {s}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {keywords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Add a search term to see its trend.</p>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 font-semibold text-slate-800">Search interest over time</h3>
            <p className="mb-3 text-xs text-slate-500">100 = the busiest week for these terms; 50 = half as many searches.</p>
            <TrendsWidget type="TIMESERIES" keywords={keywords} geo={geo} time={time} onError={setError} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 font-semibold text-slate-800">Where people search</h3>
            <p className="mb-3 text-xs text-slate-500">Regions with the most interest: good places for ads, dealers and visits.</p>
            <TrendsWidget type="GEO_MAP" keywords={keywords} geo={geo} time={time} onError={setError} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-1.5 font-semibold text-slate-800"><Search className="h-4 w-4" /> What else people search</h3>
                <p className="text-xs text-slate-500">Related searches for one term. &quot;Rising&quot; ones are great topics for new product pages and articles.</p>
              </div>
              <select value={focus} onChange={(e) => setFocus(e.target.value)} aria-label="Term for related searches" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                {focusOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <p className="mb-3 text-xs text-slate-400">
              &quot;Not enough data&quot;? Google only lists related searches for terms many people search. Pick a broader term, &quot;Past 5 years&quot; or &quot;Worldwide&quot;.
            </p>
            {focus && (
              <div className="grid gap-4 lg:grid-cols-2">
                <TrendsWidget type="RELATED_QUERIES" keywords={[focus]} geo={geo} time={time} onError={setError} />
                <TrendsWidget type="RELATED_TOPICS" keywords={[focus]} geo={geo} time={time} onError={setError} />
              </div>
            )}
          </section>
        </>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="flex items-center gap-1.5 font-semibold"><Lightbulb className="h-4 w-4" /> How to use this</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use the words people search most in product names and titles (e.g. &quot;tablet press machine&quot; rather than &quot;tablet compression unit&quot;).</li>
          <li>Rising related searches → write a product page or article for them before competitors do.</li>
          <li>Top regions → target Google Ads there and plan dealer or sales visits.</li>
          <li>Seasonal peaks → launch offers and ads a few weeks before the busy months.</li>
        </ul>
        <p className="mt-2 text-xs text-amber-800">If a chart shows &quot;Too many requests&quot;, wait a minute and reload: Google limits how often charts can load.</p>
      </div>
    </div>
  );
};

export default MarketTrends;
